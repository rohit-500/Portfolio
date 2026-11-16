# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A static, single-page personal portfolio site. Plain HTML/CSS/JS — no build step, package manager, linter, or tests.

To preview locally, open `index.html` directly or serve the directory (e.g. `python3 -m http.server` from the repo root).

## Design language

Clean, modern and minimal: Geist for all text, Geist Mono for small metadata (dates, labels, section indices `01`–`05`). Neutral off-white / near-black palette with a single cobalt accent (`--accent`). Sections use a sticky heading column beside a content column; content sits in thin-bordered rounded surfaces (`--surface`, `--line`, `--radius`). Playful touches are deliberate and live alongside the clean base: rotating tagline words, a mouse-reactive hero grid (spotlight + fading cell trail; `--cell` in CSS must match `CELL` in JS), a reading-progress line, a rubber-band logo, cursor spotlight on `.spot` cards (per-card color via `--c: var(--c-blue|green|orange|pink)`), and an interactive terminal. All motion is disabled under `prefers-reduced-motion`.

## Structure

- `index.html` — the entire page. Each `<section class="section wrap" id="…">` has a `.section-head` and `.section-body`; nav links in `.masthead` point at those ids and are highlighted via `aria-current` as you scroll. A small inline script in `<head>` adds the `js` class and applies the saved theme before first paint.
- `css/style.css` — all styling. Every color is a token on `:root` (light theme); the dark theme redefines the same tokens twice — under `:root[data-theme="dark"]` and under `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` — so any token change must be made in all three places.
- `javascript/script.js` — theme toggle (persists to `localStorage` key `theme`), mobile menu, IntersectionObserver reveal (`.reveal` → `.is-visible`, then `.is-settled` so hover transitions take over; hidden state only applies under `.js`), active-nav tracking, the hero rotator, toast + emoji confetti, copy-email, and the contact form handler.
- Terminal playground: commands are entries in the `commands` object in `script.js` (keys are full lowercase command lines, e.g. `'sudo hire-rohit'`; each returns an array of HTML lines). When portfolio content changes (experience, projects, skills, achievements), update both the HTML section and the matching terminal command.
- `images/` — portrait (`images/img/hom4.png`, a circular cutout with transparent corners) and favicon. `css/` also holds unused legacy assets (`back.jpg`, demo `*.mp4`s).

Only external dependency is Google Fonts.

## Contact form

The contact form (`name="google-sheet"`, `#myform`) is submitted from `script.js`: it POSTs `FormData` to a Google Apps Script web app that writes to a Google Sheet, and shows the result in `#form-status`. The input `name` attributes (`name`, `email`, `description`) must match the columns the Apps Script expects.
