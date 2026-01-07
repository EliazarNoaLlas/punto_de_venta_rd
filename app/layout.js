'use client';

import "./globals.css";
import Script from "next/script";
import { metadata } from "./metadata"; // si quieres separarlo
import { useServiceWorker } from "../lib/useServiceWorker";

export default function RootLayout({ children }) {
    useServiceWorker(); // <-- Registramos SW aquí

    return (
        <html lang="es">
        <head>
            {/* Icono de la app */}
            <link rel="apple-touch-icon" sizes="180x180" href="/icons/logo.svg" />

            {/* Manifest y PWA */}
            <link rel="manifest" href={metadata.manifest} />
            <meta name="theme-color" content={metadata.themeColor} />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content={metadata.appleWebApp.statusBarStyle} />
            <meta name="apple-mobile-web-app-title" content={metadata.appleWebApp.title} />

            {/* Scripts globales */}
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/rsvp/4.8.5/rsvp.min.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"
                strategy="beforeInteractive"
            />
        </head>
        <body suppressHydrationWarning>
        {children}

        {/* Ionicons */}
        <Script
            type="module"
            src="https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/ionicons/ionicons.esm.js"
            strategy="afterInteractive"
        />
        <Script
            nomodule
            src="https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/ionicons/ionicons.js"
            strategy="afterInteractive"
        />
        </body>
        </html>
    );
}
