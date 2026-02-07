# SpectraForge EQ

Desktop EQ matching tool built with Tauri, Rust, and React. It analyzes reference/input audio and proposes an EQ curve to move one tonal profile toward another.

## Highlights

- High-resolution spectral analysis workflow
- Adjustable correction intensity and smoothing
- Frequency response visualization
- Export options for practical mixing workflows
- Cross-platform desktop packaging via Tauri

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Rust + Tauri
- DSP path: FFT-based analysis with curve processing

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run tauri build
```

## Project Layout

- `src/`: frontend UI and interaction logic
- `src-tauri/`: Rust backend and desktop shell
