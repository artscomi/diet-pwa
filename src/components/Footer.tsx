"use client";

import Link from "next/link";
import { HeartIcon } from "./Icons";
import InstallAppCTA from "./InstallAppCTA";
import UninstallFooterLink from "./UninstallFooterLink";
import "./Footer.css";

interface FooterProps {
  showInstallCTA?: boolean;
}

const currentYear = new Date().getFullYear();

export default function Footer({ showInstallCTA = false }: FooterProps) {
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID ?? "";
  const showCookiePolicy = Boolean(clarityProjectId || hotjarId);

  const poweredByLabel = process.env.NEXT_PUBLIC_POWERED_BY_LABEL ?? "artscomi";
  const poweredByUrl =
    process.env.NEXT_PUBLIC_POWERED_BY_URL ?? "https://instagram.com/artscomi";

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__links" aria-label="Link footer">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/termini">Termini</Link>
          <Link href="/contatti">Contatti</Link>
          {showCookiePolicy && <Link href="/cookie">Cookie</Link>}
        </nav>

        <p className="site-footer__copyright">
          <span>
            made with
            <HeartIcon
              size={14}
              style={{
                margin: "0 0.25rem",
                color: "#e74c3c",
                verticalAlign: "middle",
                display: "inline-block",
              }}
            />
          </span>
          <span>
            powered by{" "}
            <a href={poweredByUrl} target="_blank" rel="noopener noreferrer">
              {poweredByLabel}
            </a>
          </span>
          <span>© {currentYear}</span>
        </p>
        {showInstallCTA && <InstallAppCTA variant="minimal" />}
        {showInstallCTA && <UninstallFooterLink />}
      </div>
    </footer>
  );
}
