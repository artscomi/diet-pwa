'use client'

import { HeartIcon } from './Icons'
import InstallAppCTA from './InstallAppCTA'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Made with{' '}
        <HeartIcon
          size={14}
          style={{
            margin: '0 0.25rem',
            color: '#e74c3c',
            verticalAlign: 'middle',
            display: 'inline-block',
          }}
        />{' '}
        by{' '}
        <a
          href="https://instagram.com/artscomi"
          target="_blank"
          rel="noopener noreferrer"
        >
          Artscomi
        </a>{' '}
        – Menoo
      </p>
      <InstallAppCTA />
    </footer>
  )
}
