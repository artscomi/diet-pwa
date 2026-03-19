"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconFileUpload } from "@tabler/icons-react";
import { dailyMenus } from "@/data/dailyMenus";
import InstallAppCTA from "./InstallAppCTA";
import Footer from "./Footer";
import { validateDietJson } from "@/utils/validateDietJson";
import type { UserDiet, UploadedFileInfo } from "@/types/diet";
import {
  isAllowedMime,
  MAX_UPLOAD_BYTES,
  ACCEPT_UPLOAD,
} from "@/constants/upload";
import "./Landing.css";

/** Fallback se Pexels non è configurata o la richiesta fallisce */
const LANDING_BG_FALLBACK = [
  "/landing-bg.png",
  "https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?auto=compress&w=1920",
  "https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&w=1920",
];
const LANDING_BG_INTERVAL_MS = 12000;
const LANDING_BG_FADE_MS = 450;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const USER_DIET_KEY = "userDiet";
const DIET_MENU_PREFIX = "dietMenu_";

function saveUserDiet(data: UserDiet): void {
  localStorage.setItem(USER_DIET_KEY, JSON.stringify(data));
}

/** Rimuove i menu salvati per giorno (dietMenu_*), così dopo un cambio dieta si usa il menu del giorno dalla nuova dieta */
export function clearSavedDailyMenus(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DIET_MENU_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function getDefaultUserDiet(): UserDiet {
  return {
    dailyMenus: JSON.parse(
      JSON.stringify(dailyMenus),
    ) as UserDiet["dailyMenus"],
  };
}

export function loadUserDiet(): UserDiet | null {
  try {
    const raw = localStorage.getItem(USER_DIET_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserDiet;
  } catch {
    return null;
  }
}

export function clearUserDiet(): void {
  localStorage.removeItem(USER_DIET_KEY);
}

interface LandingProps {
  onDietLoaded: (diet: UserDiet) => void;
}

const FOOD_QUERIES = ["healthy food", "salad", "diet", "hipster diet"];

const MAX_FILE_SIZE_MB = MAX_UPLOAD_BYTES / 1024 / 1024;

/** Limite per salvare l’anteprima in localStorage (500 KB) */
const MAX_PREVIEW_BYTES = 500 * 1024;

const STEP_LABELS = ["Upload", "Analisi", "Generazione menu"] as const;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Landing({ onDietLoaded }: LandingProps) {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bgImages, setBgImages] = useState<string[]>(LANDING_BG_FALLBACK);
  const [bgIndex, setBgIndex] = useState(0);
  const [bgVisible, setBgVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPexels() {
      const query =
        FOOD_QUERIES[Math.floor(Math.random() * FOOD_QUERIES.length)];
      const page = Math.floor(Math.random() * 5) + 1;
      try {
        const res = await fetch(
          `/api/pexels-photos?query=${encodeURIComponent(query)}&per_page=15&page=${page}`,
        );
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as { urls?: string[] };
        if (cancelled) return;
        if (Array.isArray(data?.urls) && data.urls.length > 0) {
          setBgImages(shuffle(data.urls));
        }
      } catch {
        // mantieni fallback
      }
    }
    loadPexels();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const len = bgImages.length;
    if (len === 0) return;
    const runFade = () => {
      setBgVisible(false);
      bgTimeoutRef.current = setTimeout(() => {
        setBgIndex((i) => (i + 1) % len);
        setBgVisible(true);
        bgTimeoutRef.current = null;
      }, LANDING_BG_FADE_MS);
    };
    const t = setInterval(runFade, LANDING_BG_INTERVAL_MS);
    return () => {
      clearInterval(t);
      if (bgTimeoutRef.current) clearTimeout(bgTimeoutRef.current);
    };
  }, [bgImages.length]);

  useEffect(() => {
    const len = bgImages.length;
    if (len === 0) return;
    const nextIndex = (bgIndex + 1) % len;
    const url = bgImages[nextIndex];
    if (url?.startsWith("http")) {
      const img = document.createElement("img");
      img.src = url;
    }
  }, [bgIndex, bgImages]);

  const handleUseDefault = () => {
    clearSavedDailyMenus();
    const defaultDiet = getDefaultUserDiet();
    saveUserDiet(defaultDiet);
    onDietLoaded(defaultDiet);
  };

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!isAllowedMime(file.type)) {
        setError(
          "Tipo di file non supportato. Usa PDF, TXT o immagini (JPG, PNG, WebP).",
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(
          `File troppo grande. Dimensione massima: ${MAX_FILE_SIZE_MB} MB.`,
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setUploadStatus("loading");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/parse-diet", {
          method: "POST",
          body: formData,
        });
        const text = await res.text();
        let json: { success?: boolean; data?: UserDiet; error?: string };
        try {
          json = text ? (JSON.parse(text) as typeof json) : {};
        } catch {
          setUploadStatus(null);
          setError(
            "Il server non ha risposto correttamente. Verifica che l’app sia avviata con npm run dev.",
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        if (!res.ok) {
          setUploadStatus(null);
          setError(json.error || "Errore durante l'analisi del file");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        if (!json.success || !json.data) {
          setUploadStatus(null);
          setError("Risposta non valida dal server");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const validation = validateDietJson(json.data);
        if (!validation.valid) {
          setUploadStatus(null);
          setError(validation.error || "Il file non contiene una dieta valida");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        let uploadedFile: UploadedFileInfo | undefined;
        if (file.size <= MAX_PREVIEW_BYTES) {
          try {
            const previewDataUrl = await readFileAsDataUrl(file);
            uploadedFile = {
              name: file.name,
              mimeType: file.type,
              previewDataUrl,
            };
          } catch {
            uploadedFile = { name: file.name, mimeType: file.type };
          }
        } else {
          uploadedFile = { name: file.name, mimeType: file.type };
        }

        const toSave: UserDiet = {
          dailyMenus: json.data.dailyMenus,
          ...(json.data.dietData && { dietData: json.data.dietData }),
          ...(uploadedFile && { uploadedFile }),
        };
        setUploadStatus(null);
        clearSavedDailyMenus();
        saveUserDiet(toSave);
        onDietLoaded(toSave);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        setUploadStatus(null);
        setError(
          err instanceof Error
            ? err.message
            : "Errore di connessione. Verifica che il server sia avviato.",
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onDietLoaded],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadStatus === "loading") return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploadStatus === "loading") return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      processFile(file);
    }
  };

  return (
    <div className="landing">
      <div className="landing-hero">
        <div
          className="landing-bg"
          aria-hidden
          style={{
            backgroundImage: `url(${bgImages[bgIndex] ?? bgImages[0]})`,
            opacity: bgVisible ? 1 : 0,
          }}
        />
        <div className="landing-panel">
          <header className="landing-header">
            <h1 className="landing-logo">
              <Image
                src="/favicon-icon.svg"
                alt="PocketDiet"
                width={80}
                height={80}
                className="site-icon--landing"
                priority
              />
              <span className="landing-logo__text">PocketDiet</span>
            </h1>
            <p className="landing-subtitle">
              La dieta del tuo nutrizionista, sempre con te. Caricala qui e
              consulta i tuoi pasti del giorno, direttamente dal telefono.
            </p>
          </header>

          <main className="landing-main">
            <div
              className={`landing-dropzone ${isDragging ? "landing-dropzone--active" : ""} ${uploadStatus === "loading" ? "landing-dropzone--loading" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                uploadStatus !== "loading" && fileInputRef.current?.click()
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === " ") &&
                  uploadStatus !== "loading"
                ) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Carica un file con la tua dieta"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_UPLOAD}
                onChange={handleFileChange}
                disabled={uploadStatus === "loading"}
                className="landing-file-input"
                id="diet-file"
                aria-hidden
              />
              {uploadStatus === "loading" ? (
                <div className="landing-loading">
                  <p className="landing-dropzone-text">
                    Stiamo generando il tuo menu del giorno...
                  </p>
                  <ol className="landing-steps" aria-label="Stato elaborazione">
                    {STEP_LABELS.map((label, idx) => (
                      <li
                        key={label}
                        className="landing-step landing-step--active"
                      >
                        <span className="landing-step__badge">{idx + 1}</span>
                        <span className="landing-step__label">{label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <>
                  <IconFileUpload
                    size={40}
                    className="landing-dropzone-icon"
                    stroke={1.5}
                  />
                  <p className="landing-dropzone-title">
                    Carica la dieta del tuo nutrizionista
                  </p>
                  <p className="landing-dropzone-hint">
                    PDF, foto o testo del piano alimentare (max{" "}
                    {MAX_FILE_SIZE_MB} MB).
                  </p>
                </>
              )}
            </div>

            {/* <button
              type="button"
              className="landing-btn landing-btn-secondary landing-demo__cta"
              onClick={handleUseDefault}
              disabled={uploadStatus === "loading"}
            >
              Prova demo
            </button> */}

            {error && (
              <p className="landing-error" role="alert">
                {error}
              </p>
            )}

            <div className="landing-install-wrap">
              <InstallAppCTA />
            </div>
          </main>

          <Footer showInstallCTA={false} />
        </div>
      </div>
    </div>
  );
}
