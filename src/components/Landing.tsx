"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconFileUpload } from "@tabler/icons-react";
import { dailyMenus } from "@/data/dailyMenus";
import InstallAppCTA, { isStandalone } from "./InstallAppCTA";
import Footer from "./Footer";
import { validateDietJson } from "@/utils/validateDietJson";
import type { UserDiet, UploadedFileInfo } from "@/types/diet";
import {
  isAllowedMime,
  MAX_UPLOAD_BYTES,
  ACCEPT_UPLOAD,
} from "@/constants/upload";
import { clearAllMealCompletions } from "@/utils/mealCompletionStatus";
import {
  PEXELS_CDN_QUERY_CARD,
  PEXELS_CDN_QUERY_FULL,
} from "@/constants/pexelsCdn";
import "./Landing.css";

/** Fallback desktop se Pexels non risponde (CDN a massima larghezza utile). */
const LANDING_BG_FALLBACK = [
  "/landing-bg.png",
  `https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?${PEXELS_CDN_QUERY_FULL}`,
  `https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?${PEXELS_CDN_QUERY_FULL}`,
];
const LANDING_BG_INTERVAL_MS = 12000;
const LANDING_BG_FADE_MS = 450;
/** Ultimo step (card “Condividi”): immagine fissa — Pexels 6214370 (lista spesa) */
const VALUE_PROP_LAST_STEP_IMAGE = `https://images.pexels.com/photos/6214370/pexels-photo-6214370.jpeg?${PEXELS_CDN_QUERY_CARD}`;
/** Card “Progressi”: to-do / checklist (Pexels 6690908 — Tara Winstead) */
const VALUE_PROP_SPOTLIGHT_IMAGE = `https://images.pexels.com/photos/6690908/pexels-photo-6690908.jpeg?${PEXELS_CDN_QUERY_CARD}`;

/**
 * Immagini di default per le 3 card (1–2 aggiornabili da API; ultima sempre VALUE_PROP_LAST_STEP_IMAGE).
 */
const VALUE_PROP_CARD_FALLBACK: [string, string, string] = [
  `https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?${PEXELS_CDN_QUERY_CARD}`,
  `https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?${PEXELS_CDN_QUERY_CARD}`,
  VALUE_PROP_LAST_STEP_IMAGE,
];

/** Ricerche Pexels solo per le prime due card (sempre cibo / stile di vita sano). */
const VALUE_PROP_PEXELS_QUERIES = [
  "healthy colorful lunch bowl vegetables",
  "fresh healthy vegetables ingredients wooden table",
] as const;
/** Auto-scroll orizzontale tra le card (non tra le foto nella stessa card) */
const VALUE_PROP_SCROLL_INTERVAL_MS = 5500;
/** Carosello foto solo da questa larghezza in su (allineato al CSS) */
const LANDING_DESKTOP_BG_MQ = "(min-width: 768px)";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function mergeValuePropCardImages(
  fromApi: [string | undefined, string | undefined],
): [string, string, string] {
  return [
    fromApi[0] ?? VALUE_PROP_CARD_FALLBACK[0],
    fromApi[1] ?? VALUE_PROP_CARD_FALLBACK[1],
    VALUE_PROP_LAST_STEP_IMAGE,
  ];
}

/** Sfondo desktop: solo query orientate a cibo sano (Pexels). */
const HEALTHY_BG_QUERIES = [
  "healthy food colorful",
  "healthy salad bowl fresh",
  "fresh vegetables healthy meal",
  "healthy breakfast fruit yogurt",
  "nutritious balanced plate",
  "healthy meal prep vegetables",
] as const;

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
  clearAllMealCompletions();
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
  /** PWA standalone: solo upload, niente hero marketing / value prop / “Scopri”. */
  uploadOnly?: boolean;
}

const MAX_FILE_SIZE_MB = MAX_UPLOAD_BYTES / 1024 / 1024;

const LANDING_VALUE_STEPS = [
  {
    title: "I tuoi pasti",
    blurb:
      "Colazione, pranzo e cena con porzioni e alternative: tutto il giorno in un’unica schermata. Sempre a portata di mano.",
  },
  {
    title: "Lista della spesa",
    blurb: "Genera la lista della spesa in base ai pasti della tua dieta.",
  },
  {
    title: "Condividi",
    blurb: "Condividi la lista della spesa con chi vuoi.",
  },
] as const;

/** Carosello: card progressi in mezzo alle tre, con immagine fissa (checklist / dieta) */
const VALUE_PROP_TRACK_ITEMS = [
  { type: "photo" as const, stepIndex: 0, imageIndex: 0 },
  { type: "spotlight" as const },
  { type: "photo" as const, stepIndex: 1, imageIndex: 1 },
  { type: "photo" as const, stepIndex: 2, imageIndex: 2 },
] as const;

/** Limite per salvare l’anteprima in localStorage (500 KB) */
const MAX_PREVIEW_BYTES = 500 * 1024;

const STEP_LABELS = [
  "Caricamento file",
  "Analisi della dieta",
  "Preparazione dei menu",
] as const;
const STEP_EMOJIS = ["📄", "🔍", "🍽️"] as const;
const STEP_DELAY_MS = [800, 2500] as const;

const DIET_PARSE_VALIDATION_USER_MESSAGE =
  "Non siamo riusciti a leggere correttamente la dieta da questo file. A volte basta un secondo tentativo, puoi riprovare per favore?";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Landing({
  onDietLoaded,
  uploadOnly = false,
}: LandingProps) {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [desktopCarouselBg, setDesktopCarouselBg] = useState(false);
  const [bgImages, setBgImages] = useState<string[]>(LANDING_BG_FALLBACK);
  const [bgIndex, setBgIndex] = useState(0);
  const [bgVisible, setBgVisible] = useState(true);
  const [valuePropCardImages, setValuePropCardImages] = useState<
    [string, string, string]
  >(() => [...VALUE_PROP_CARD_FALLBACK]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valuePropTrackRef = useRef<HTMLDivElement>(null);
  const bgTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [landingStandalone, setLandingStandalone] = useState(false);

  useEffect(() => {
    setLandingStandalone(isStandalone());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(LANDING_DESKTOP_BG_MQ);
    const sync = () => setDesktopCarouselBg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (uploadOnly || !desktopCarouselBg) return;
    let cancelled = false;
    async function loadPexels() {
      const query =
        HEALTHY_BG_QUERIES[
          Math.floor(Math.random() * HEALTHY_BG_QUERIES.length)
        ];
      const page = Math.floor(Math.random() * 5) + 1;
      try {
        const res = await fetch(
          `/api/pexels-photos?query=${encodeURIComponent(query)}&per_page=15&page=${page}&purpose=background`,
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
  }, [desktopCarouselBg, uploadOnly]);

  useEffect(() => {
    if (uploadOnly) return;
    let cancelled = false;
    async function loadValuePropPexels() {
      try {
        const responses = await Promise.all(
          VALUE_PROP_PEXELS_QUERIES.map((query, i) =>
            fetch(
              `/api/pexels-photos?query=${encodeURIComponent(query)}&per_page=6&page=${i + 1}&purpose=card`,
            ),
          ),
        );
        if (cancelled) return;
        const picked: [string | undefined, string | undefined] = [
          undefined,
          undefined,
        ];
        for (let i = 0; i < responses.length; i++) {
          const res = responses[i];
          if (!res.ok) continue;
          const data = (await res.json()) as { urls?: string[] };
          if (cancelled) return;
          const u = data.urls?.[0];
          if (u) picked[i] = u;
        }
        if (picked.some(Boolean)) {
          setValuePropCardImages(mergeValuePropCardImages(picked));
        }
      } catch {
        /* fallback già in stato */
      }
    }
    loadValuePropPexels();
    return () => {
      cancelled = true;
    };
  }, [uploadOnly]);

  useEffect(() => {
    if (uploadOnly) return;
    const track = valuePropTrackRef.current;
    if (!track) return;
    const stepCount = VALUE_PROP_TRACK_ITEMS.length;
    if (stepCount < 2) return;
    let slide = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const advance = () => {
      slide = (slide + 1) % stepCount;
      const card = track.querySelectorAll<HTMLElement>(
        ".landing-value-prop__card",
      )[slide];
      if (!card) return;
      track.scrollTo({
        left: card.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };
    const id = setInterval(advance, VALUE_PROP_SCROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [uploadOnly]);

  useEffect(() => {
    if (uploadOnly || !desktopCarouselBg) return;
    const len = bgImages.length;
    if (len <= 1) return;
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
  }, [bgImages.length, desktopCarouselBg, uploadOnly]);

  useEffect(() => {
    if (uploadOnly || !desktopCarouselBg) return;
    const len = bgImages.length;
    if (len <= 1) return;
    const nextIndex = (bgIndex + 1) % len;
    const url = bgImages[nextIndex];
    if (url?.startsWith("http")) {
      const img = document.createElement("img");
      img.src = url;
    }
  }, [bgIndex, bgImages, desktopCarouselBg, uploadOnly]);

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
      setLoadingStep(0);
      setTimeout(() => setLoadingStep(1), STEP_DELAY_MS[0]);
      setTimeout(() => setLoadingStep(2), STEP_DELAY_MS[0] + STEP_DELAY_MS[1]);

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
            "Il server non ha risposto correttamente. Verifica che l’app sia avviata con yarn dev.",
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
          if (process.env.NODE_ENV === "development" && validation.error) {
            console.warn("[validateDietJson]", validation.error);
          }
          setError(DIET_PARSE_VALIDATION_USER_MESSAGE);
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

  const handleLoadDefaultList = useCallback(() => {
    const diet = getDefaultUserDiet();
    clearSavedDailyMenus();
    saveUserDiet(diet);
    setError(null);
    onDietLoaded(diet);
  }, [onDietLoaded]);

  const showDevDefaultLoader = process.env.NODE_ENV === "development";

  const standaloneLayout = landingStandalone || uploadOnly;

  return (
    <div
      className={`landing${standaloneLayout ? " landing--standalone" : ""}${uploadOnly ? " landing--uploadOnly" : ""}`}
    >
      <div className="landing-hero">
        {desktopCarouselBg && !uploadOnly && (
          <div
            className="landing-bg"
            aria-hidden
            style={{
              backgroundImage: `url(${bgImages[bgIndex] ?? bgImages[0]})`,
              opacity: bgVisible ? 1 : 0,
            }}
          />
        )}
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
              {uploadOnly ? (
                <>
                  Carica il file della dieta per aprire i pasti e la lista della
                  spesa.
                </>
              ) : (
                <>
                  La dieta del tuo nutrizionista, sempre con te. Caricala qui e
                  consulta i tuoi pasti del giorno, direttamente dal telefono.
                </>
              )}
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
                  <div className="landing-spinner" />
                  <p className="landing-loading-title">
                    Preparazione del tuo menu...
                  </p>
                  <ol className="landing-steps" aria-label="Stato elaborazione">
                    {STEP_LABELS.map((label, idx) => {
                      const status =
                        idx < loadingStep
                          ? "done"
                          : idx === loadingStep
                            ? "active"
                            : "pending";
                      return (
                        <li
                          key={label}
                          className={`landing-step landing-step--${status}`}
                        >
                          <span className="landing-step__icon">
                            {status === "done" ? "✓" : STEP_EMOJIS[idx]}
                          </span>
                          <span className="landing-step__label">{label}</span>
                          {status === "active" && (
                            <span className="landing-step__dots" />
                          )}
                        </li>
                      );
                    })}
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

            {showDevDefaultLoader && (
              <div className="landing-dev-default-wrap">
                <button
                  type="button"
                  className="landing-btn landing-btn-secondary landing-dev-default-btn"
                  onClick={handleLoadDefaultList}
                  disabled={uploadStatus === "loading"}
                >
                  Carica lista default
                </button>
              </div>
            )}

            {!uploadOnly && (
              <div className="landing-value-prop">
                <p className="landing-value-prop__eyebrow">
                  <span className="landing-value-prop__eyebrowLead">
                    Cosa puoi fare con
                  </span>{" "}
                  <span className="landing-value-prop__eyebrowBrand">
                    PocketDiet
                  </span>
                </p>
                <div
                  ref={valuePropTrackRef}
                  className="landing-value-prop__track"
                  role="list"
                  aria-label="Scorri per vedere i passaggi"
                >
                  {VALUE_PROP_TRACK_ITEMS.map((item) => {
                    if (item.type === "spotlight") {
                      return (
                        <div
                          key="progressi-report"
                          className="landing-value-prop__card landing-value-prop__card--spotlight"
                          role="listitem"
                          aria-labelledby="landing-spotlight-title"
                        >
                          <div
                            className="landing-value-prop__photo"
                            aria-hidden
                          >
                            <Image
                              className="landing-value-prop__photoImg"
                              src={VALUE_PROP_SPOTLIGHT_IMAGE}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 80vw, 320px"
                              style={{
                                objectFit: "cover",
                                objectPosition: "center 38%",
                              }}
                            />
                          </div>
                          <h2
                            id="landing-spotlight-title"
                            className="landing-spotlight__title"
                          >
                            Progressi
                          </h2>
                          <p className="landing-spotlight__text">
                            Tieni d&apos;occhio quanto riesci a seguire il
                            piano, giorno dopo giorno, con un report facile da
                            leggere.
                          </p>
                        </div>
                      );
                    }
                    const step = LANDING_VALUE_STEPS[item.stepIndex];
                    const src =
                      valuePropCardImages[item.imageIndex] ??
                      VALUE_PROP_CARD_FALLBACK[item.imageIndex];
                    return (
                      <div
                        key={step.title}
                        className="landing-value-prop__card"
                        role="listitem"
                      >
                        <div className="landing-value-prop__photo" aria-hidden>
                          <Image
                            className="landing-value-prop__photoImg"
                            src={src}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 80vw, 320px"
                            style={{
                              objectFit: "cover",
                              objectPosition: "center center",
                            }}
                          />
                        </div>
                        <span className="landing-value-prop__stepTitle">
                          {step.title}
                        </span>
                        <span className="landing-value-prop__stepBlurb">
                          {step.blurb}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!uploadOnly && (
              <div className="landing-discover">
                <Link href="/" className="landing-header__backLink">
                  Scopri PocketDiet
                </Link>
              </div>
            )}

            {error && (
              <p className="landing-error" role="alert">
                {error}
              </p>
            )}
          </main>

          <Footer showInstallCTA={false} />
        </div>
      </div>

      {!standaloneLayout && (
        <div className="landing-install-dock">
          <InstallAppCTA variant="stickyBar" />
        </div>
      )}
    </div>
  );
}
