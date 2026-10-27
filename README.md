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



## Educational note

This is a conceptual model, not a commercial CPU emulator or a semiconductor-physics simulator. The arithmetic output is computed exactly for the supported input range, while the depicted signal propagation, transistor states, and timing are explanatory rather than measured physical behavior.
