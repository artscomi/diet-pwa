"use client";

import { HeartIcon } from "./Icons";
import InstallAppCTA from "./InstallAppCTA";
import UninstallFooterLink from "./UninstallFooterLink";
import "./Footer.css";

interface FooterProps {
  showInstallCTA?: boolean;
}

const currentYear = new Date().getFullYear();

export default function Footer({ showInstallCTA = true }: FooterProps) {
  return (
    <footer className="site-footer">
      <p>
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
        by{" "}
        <a
          href="https://instagram.com/artscomi"
          target="_blank"
          rel="noopener noreferrer"
        >
          artscomi
        </a>{" "}
        <span>© {currentYear}</span>
      </p>
      {showInstallCTA && <InstallAppCTA />}
      {showInstallCTA && <UninstallFooterLink />}
    </footer>
  );
}
