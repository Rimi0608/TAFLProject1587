#  Theory of Automata and Formal Languages (TAFL)
## Project: Context Free Grammar to Chomsky Normal Form (CNF) and Greibach Normal Form (GNF) Converter

---

###  Author Information
- **Name:** Rishab Kumar
- **Roll No:** 2024UCS1587
- **Subject:** Theory of Automata and Formal Languages (TAFL)
- **Topic:** CFG to CNF & GNF Step-by-Step Conversion

---

###  Description
This project was developed as a comprehensive, product-grade tool to help students, teaching assistants, and researchers understand the mathematical transformations required to convert a Context-Free Grammar (CFG) into standardized forms. The application performs rigorous transformations and displays every intermediate grammar step, providing a clear visual path from an arbitrary CFG to its **Chomsky Normal Form (CNF)** or **Greibach Normal Form (GNF)**.

Beyond simple conversion, the portal features a **CYK Engine Testing Playground** to verify string membership, visualizes complex syntax via **Adaptive Parse Trees**, and offers a **1-Click Academic Export** generating mathematically flawless LaTeX formatting for immediate use in research papers and homework assignments.

---

###  Key Features
*   **Dual Pipeline Conversion**:
    *   **6-Step CNF Pipeline**: Start Symbol Augmentation, ε-Elimination, Unit Removal, Useless Symbol Removal, Terminal Replacement, and Binarization.
    *   **9-Step GNF Pipeline**: Full Greibach ordering including variable indexing ($A_i < A_j$), indirect cycle detection, direct left-recursion removal ($Z_i$), and forward/backward substitution.
*   **CYK Testing Playground**: Input any string to verify its membership dynamically against the internally generated CNF rule set. Generates standard CYK DP tables.
*   **Visual Parse Trees & Derivations**: View visually stunning, non-overlapping SVG Parse Trees and Leftmost Derivation paths for any accepted string.
*   **One-Click Academic Export (LaTeX)**: Saves 30+ minutes of manual formatting by allowing users to click a single "LaTeX" button to copy any conversion step directly into `\begin{align*}` math blocks, or copy entire Parse Trees directly into `tikz-qtree` format for seamless pasting into Overleaf.
*   **Step-by-Step Transparency**: Every mathematical operation is tracked and displayed as an individual "Step Card" exposing nullable variables, unit closures, generating sets, etc.
*   **Premium "Saki-Inspired" Design**: Minimalist, high-contrast monochrome aesthetic with fluid animations, auto-dark mode, and responsive glassmorphism.

---

###  Getting Started
Deploy Link - https://rimi0608.github.io/TAFLProject1587/
Repository Link - https://github.com/Rimi0608/TAFLProject1587/
#### 1. Clone the Repository
using git clone <https://github.com/Rimi0608/TAFLProject1587/>
#### 2. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed on your system.
```bash
npm install
```

#### 3. Run Locally
Start the development server:
```bash
npm run dev
```

#### 4. Build for Production
To generate a production-ready bundle in the `dist/` folder:
```bash
npm run build
```

---

###  Conversion Logic (Pipelines)

#### Chomsky Normal Form (CNF) Logic
1.  **Preprocessing**: Ensures start variable is isolated.
2.  **ε-elimination**: Power-set generation for nullable variables.
3.  **Unit Removal**: Transitive closure analysis.
4.  **Useless Pruning**: Generating and Reachable set filtration.
5.  **Terminal Replacement**: Standardizes binary rule literals.
6.  **Binarization**: Decomposes long rules into binary equivalents.

#### Greibach Normal Form (GNF) Logic
1.  **Preprocessing** & **Simplification**: (Epsilon/Unit/Useless removal).
2.  **CNF Initialization**: Sets the baseline binary structure.
3.  **Variable Ordering**: Establishes $A_1, A_2, \dots, A_n$ hierarchy.
4.  **Left Recursion Removal**: Solves direct/indirect cycles using the Greibach lemma.
5.  **Sequential Substitution**: Back-substitutes variables to ensure every rule starts with a terminal.

---

###  License
This project is for educational purposes. Developed by Rishab Kumar.
