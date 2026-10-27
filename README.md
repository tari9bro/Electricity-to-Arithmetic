# Inside the CPU Lab — Electricity to Arithmetic

An interactive educational website exploring how binary input values move through a simplified CPU model: registers, control logic, a CMOS inverter, Boolean gates, an arithmetic logic unit (ALU), and the output register.

## Features

- Addition, subtraction, multiplication, and division for integer inputs from 0–9.
- Binary input registers and an 8-bit result register with signed two's-complement encoding for negative subtraction results.
- A ten-step signal journey you can inspect one stage at a time.
- Seven interactive logic-gate demonstrations with live truth tables: NOT, AND, OR, NAND, NOR, XOR, and XNOR.
- An idealized CMOS inverter lab showing complementary PMOS/NMOS switching.
- Illustrative clock profiles and timing estimates.
- Responsive dark interface; the website is self-contained in `index.html` and needs no framework or package install.

## Run locally

Open `index.html` directly in a modern browser, or use any static file server. This version does not require Node.js for the page itself.

To run the supplemental arithmetic and gate engine tests with Node.js 22 or newer:

```sh
npm test
```

## Publish on GitHub Pages

The repository contains the workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It runs tests, copies the site to `dist/`, and publishes `dist/` to GitHub Pages on each push to `main`.

1. Open **Settings → Pages** for this repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish successfully.
4. Visit the deployment URL shown by the workflow. For this repository it is normally [https://tari9bro.github.io/Electricity-to-Arithmetic/](https://tari9bro.github.io/Electricity-to-Arithmetic/).

## Educational note

This is a conceptual model, not a commercial CPU emulator or a semiconductor-physics simulator. The arithmetic output is computed exactly for the supported input range, while the depicted signal propagation, transistor states, and timing are explanatory rather than measured physical behavior.
