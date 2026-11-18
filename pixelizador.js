// ============================================================================
// PIXELIZADOR PRO — 7 CAMADAS COM 4 CONTA-GOTAS CADA + PALETAS + ESTILOS + ZIP
// Versão melhorada: match robusto, debug visual, contador de pixels e feedback
// ============================================================================

const PALETTES = {
  none: { name: "Original (Sem Troca de Paleta)", colors: [] },
  gameboy: { name: "Game Boy Clássico (4 cores)", colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] },
  gb_pocket: { name: "Game Boy Pocket", colors: ["#1a1c1a", "#525752", "#9aa19a", "#dce3dc"] },
  virtualboy: { name: "Virtual Boy (Vermelho)", colors: ["#000000", "#550000", "#aa0000", "#ff0000"] },
  nes: { name: "NES Clássico (16 cores)", colors: ["#000000", "#fcfcfc", "#f8f8f8", "#bcbcbc", "#7c7c7c", "#a4e4fc", "#3cbcfc", "#0078f8", "#0000fc", "#b8b8f8", "#6888fc", "#0058f8", "#f8b8f8", "#f878f8", "#d800cc", "#e40058", "#f83800", "#e45c10", "#ac7c00", "#00b800", "#00a800", "#00a844", "#008888"] },
  pico8: { name: "PICO-8 (16 cores)", colors: ["#000000", "#1d2b53", "#7e2553", "#008751", "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8", "#ff004d", "#ffa300", "#ffec27", "#00e436", "#29adff", "#83769c", "#ff77a8", "#ffccaa"] },
  sweetie16: { name: "Sweetie 16", colors: ["#1a1c2c", "#5d275d", "#b13e53", "#ef7d57", "#ffcd75", "#a7f070", "#38b764", "#257179", "#29366f", "#3b5dc9", "#41a6f6", "#73eff7", "#f4f4f4", "#94b0c2", "#566c86", "#333c57"] },
  endesga32: { name: "Endesga 32", colors: ["#be4a2f", "#d77643", "#ead4aa", "#e4a672", "#b86f50", "#733e39", "#3e2731", "#a22633", "#e43b44", "#f77622", "#feae34", "#fee761", "#63c74d", "#3e8948", "#265c42", "#193c3e", "#124e89", "#0099db", "#2ce8f5", "#ffffff", "#c0cbdc", "#8b9bb4", "#5a6988", "#3a4466", "#262b44", "#181425", "#ff0044", "#68386c", "#b55088", "#f6757a", "#e8b796", "#c28569"] },
  cga1: { name: "CGA Modo 1 (Ciano/Magenta)", colors: ["#000000", "#55ffff", "#ff55ff", "#ffffff"] },
  cga2: { name: "CGA Modo 2 (Verde/Vermelho)", colors: ["#000000", "#55ff55", "#ff5555", "#ffff55"] },
  commodore64: { name: "Commodore 64", colors: ["#000000", "#ffffff", "#880000", "#aaffee", "#cc44cc", "#00cc55", "#0000aa", "#eeee77", "#dd8855", "#664400", "#ff7777", "#333333", "#777777", "#aaff66", "#0088ff", "#bbbbbb"] },
  cyberpunk: { name: "Cyberpunk Neon", colors: ["#090514", "#1d1135", "#511845", "#900c3f", "#c70039", "#ff5733", "#00f5d4", "#00bbf9", "#fee440", "#f15bb5"] },
  vaporwave: { name: "Vaporwave Pastel", colors: ["#2b193d", "#482673", "#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96", "#ffffff"] },
  sepia: { name: "Sépia Vintage", colors: ["#1e140c", "#3e2a1a", "#6e4c30", "#9e734e", "#cfa378", "#f2d6b3"] },
  grayscale: { name: "Preto e Branco (8 Tons)", colors: ["#000000", "#242424", "#484848", "#6d6d6d", "#919191", "#b6b6b6", "#dadada", "#ffffff"] },
  bw_1bit: { name: "1-Bit Puro (Preto/Branco)", colors: ["#000000", "#ffffff"] },
  skin_tones: { name: "Tons de Pele (Anime / RPG)", colors: ["#3b1d14", "#5c2c1d", "#82432e", "#a85d43", "#c97b5d", "#e39b7b", "#f5be9f", "#ffdec7", "#fff0e5"] },
  hair_anime: { name: "Cabelo Anime & Fantasia", colors: ["#14111c", "#2d253d", "#543b6b", "#8a4f9e", "#c96dd8", "#ff9cee", "#ffd6fa", "#3d1e10", "#7a3b1e", "#bd6832", "#f2a65a", "#ffe082", "#102e4a", "#1f618d", "#3498db", "#85c1e9"] },
  fire_lava: { name: "Fogo & Lava", colors: ["#140505", "#4a0c0c", "#8f190d", "#d93814", "#ff7714", "#ffbe26", "#fff799"] },
  ice_frost: { name: "Gelo & Cristal", colors: ["#081426", "#122e54", "#1f568c", "#3489c7", "#6cc2eb", "#b5e6fa", "#ffffff"] },
  forest_moss: { name: "Floresta & Musgo", colors: ["#0d1a0f", "#1b361e", "#2d5930", "#478546", "#6fb364", "#a5d98f", "#def5c9"] },
  gold_metal: { name: "Ouro & Bronze", colors: ["#241606", "#4d310d", "#805517", "#b88025", "#e8b339", "#ffe066", "#fff8cc"] }
};

const STYLES = {
  flat: "Pixel Sólido (Clássico)",
  bayer2: "Dithering Bayer 2x2",
  bayer4: "Dithering Bayer 4x4",
  bayer8: "Dithering Bayer 8x8",
  checker: "Quadriculado (Checkerboard)",
  scanline_h: "Scanlines CRT Horizontais",
  scanline_v: "Scanlines Verticais",
  grid: "Grade Pixel (Borda Escura)",
  bevel: "Bloco 3D (Relevo / Bevel)",
  dots: "Pontos / Meio-Tom (Halftone)",
  crosshatch: "Hachura Cruzada (Crosshatch)",
  diagonal: "Listras Diagonais",
  cel_shade: "Cel-Shading (Alto Contraste)",
  posterize: "Posterização Suave"
};

const LAYER_DEFINITIONS = [
  { id: "hair", name: "1. Cabelo", defaultColor: "#3b2314", defaultPalette: "hair_anime", defaultStyle: "bayer4" },
  { id: "skin", name: "2. Pele / Rosto", defaultColor: "#f2b894", defaultPalette: "skin_tones", defaultStyle: "flat" },
  { id: "top", name: "3. Roupa Superior", defaultColor: "#2563eb", defaultPalette: "pico8", defaultStyle: "bayer2" },
  { id: "bottom", name: "4. Roupa Inferior", defaultColor: "#1e293b", defaultPalette: "endesga32", defaultStyle: "checker" },
  { id: "shoes", name: "5. Sapatos / Luvas", defaultColor: "#dc2626", defaultPalette: "sweetie16", defaultStyle: "bevel" },
  { id: "eyes", name: "6. Olhos / Detalhes", defaultColor: "#10b981", defaultPalette: "cyberpunk", defaultStyle: "flat" },
  { id: "accessory", name: "7. Acessório / Arma", defaultColor: "#eab308", defaultPalette: "gold_metal", defaultStyle: "bayer4" }
];

const BAYER2 = [[0, 2], [3, 1]];
const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]
];

const state = {
  pixelSize: 4,
  globalPalette: "none",
  globalStyle: "flat",
  outlineThreshold: 0,
  zoom: 100,
  zipFps: 12,
  activeEyedropper: null,
  mediaType: "demo",
  isPlaying: false,
  showDebug: false,
  layers: LAYER_DEFINITIONS.map((def, idx) => ({
    ...def,
    enabled: idx < 3,
    colors: [
      { active: true, hex: def.defaultColor },
      { active: false, hex: "#888888" },
      { active: false, hex: "#888888" },
      { active: false, hex: "#888888" }
    ],
    tolerance: 45,
    palette: def.defaultPalette,
    style: def.defaultStyle
  }))
};

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
const sourceVideo = document.getElementById("sourceVideo");
let sourceImage = new Image();
let animFrameId = null;

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

const parsedPalettes = {};
for (const key in PALETTES) {
  parsedPalettes[key] = PALETTES[key].colors.map(hexToRgb);
}

function findNearestPaletteColor(r, g, b, paletteKey) {
  const pal = parsedPalettes[paletteKey];
  if (!pal || pal.length === 0) return { r, g, b };
  let best = pal[0];
  let minDist = Infinity;
  for (let i = 0; i < pal.length; i++) {
    const c = pal[i];
    const d = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (d < minDist) { minDist = d; best = c; }
  }
  return best;
}

function applyStyleAndPalette(r, g, b, bx, by, paletteKey, styleKey) {
  let nr = r, ng = g, nb = b;

  if (styleKey === "bayer2") {
    const t = (BAYER2[by % 2][bx % 2] / 4 - 0.5) * 48;
    nr += t; ng += t; nb += t;
  } else if (styleKey === "bayer4") {
    const t = (BAYER4[by % 4][bx % 4] / 16 - 0.5) * 56;
    nr += t; ng += t; nb += t;
  } else if (styleKey === "bayer8") {
    const t = (BAYER8[by % 8][bx % 8] / 64 - 0.5) * 64;
    nr += t; ng += t; nb += t;
  } else if (styleKey === "checker") {
    const t = ((bx + by) % 2 === 0) ? 18 : -18;
    nr += t; ng += t; nb += t;
  } else if (styleKey === "scanline_h") {
    if (by % 2 === 1) { nr *= 0.65; ng *= 0.65; nb *= 0.65; }
  } else if (styleKey === "scanline_v") {
    if (bx % 2 === 1) { nr *= 0.65; ng *= 0.65; nb *= 0.65; }
  } else if (styleKey === "cel_shade") {
    const lum = 0.299 * nr + 0.587 * ng + 0.114 * nb;
    const factor = lum > 145 ? 1.2 : (lum > 85 ? 0.9 : 0.6);
    nr *= factor; ng *= factor; nb *= factor;
  } else if (styleKey === "posterize") {
    nr = Math.round(nr / 64) * 64;
    ng = Math.round(ng / 64) * 64;
    nb = Math.round(nb / 64) * 64;
  }

  nr = Math.max(0, Math.min(255, nr));
  ng = Math.max(0, Math.min(255, ng));
  nb = Math.max(0, Math.min(255, nb));

  const mapped = findNearestPaletteColor(nr, ng, nb, paletteKey);
  return { r: mapped.r, g: mapped.g, b: mapped.b };
}

// ============================================================================
// UI
// ============================================================================

function populateSelect(selectEl, itemsObj, selectedValue) {
  selectEl.innerHTML = "";
  for (const key in itemsObj) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = typeof itemsObj[key] === "string" ? itemsObj[key] : itemsObj[key].name;
    if (key === selectedValue) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

function buildUI() {
  populateSelect(document.getElementById("selectGlobalPalette"), PALETTES, state.globalPalette);
  populateSelect(document.getElementById("selectGlobalStyle"), STYLES, state.globalStyle);

  const container = document.getElementById("layersContainer");
  container.innerHTML = "";

  state.layers.forEach((layer, layerIdx) => {
    const card = document.createElement("div");
    card.className = "layer-card";
    card.style.borderLeft = `4px solid ${layer.colors[0].hex}`;

    const header = document.createElement("div");
    header.className = "layer-header";
    header.innerHTML = `
      <label style="cursor:pointer; font-weight:700; color:#00ffcc;">
        <input type="checkbox" id="layer_en_${layerIdx}" ${layer.enabled ? "checked" : ""}>
        ${layer.name}
      </label>
      <span style="font-size:11px; color:#a1a1aa;">Tol: <strong id="lbl_tol_${layerIdx}">${layer.tolerance}</strong></span>
    `;
    card.appendChild(header);

    const swatchesGrid = document.createElement("div");
    swatchesGrid.className = "swatches-grid";

    layer.colors.forEach((slot, slotIdx) => {
      const slotBox = document.createElement("div");
      slotBox.className = "swatch-slot" + (slot.active ? "" : " disabled-slot");
      slotBox.id = `slot_box_${layerIdx}_${slotIdx}`;

      slotBox.innerHTML = `
        <div class="swatch-top">
          <input type="checkbox" id="slot_chk_${layerIdx}_${slotIdx}" ${slot.active ? "checked" : ""} title="Ativar/Desativar cor ${slotIdx + 1}">
          <input type="color" id="slot_col_${layerIdx}_${slotIdx}" value="${slot.hex}" title="Cor ${slotIdx + 1}">
          <button class="btn-clear-slot" id="slot_clr_${layerIdx}_${slotIdx}" title="Desativar cor">×</button>
        </div>
        <button class="btn-drop" id="slot_drop_${layerIdx}_${slotIdx}" title="Capturar cor ${slotIdx + 1} no personagem">💧 #${slotIdx + 1}</button>
      `;
      swatchesGrid.appendChild(slotBox);
    });

    card.appendChild(swatchesGrid);

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexDirection = "column";
    controls.style.gap = "5px";
    controls.innerHTML = `
      <input type="range" id="layer_tol_${layerIdx}" min="5" max="140" value="${layer.tolerance}" title="Tolerância de captura das 4 cores">
      <div class="row">
        <select id="layer_pal_${layerIdx}" title="Paleta exclusiva desta camada"></select>
        <select id="layer_sty_${layerIdx}" title="Estilo exclusivo desta camada"></select>
      </div>
      <div class="row" style="font-size:10px; color:#a1a1aa; justify-content:space-between;">
        <span>Pixels: <strong id="layer_count_${layerIdx}">0</strong></span>
        <span>Cor principal: <span id="layer_prev_${layerIdx}" style="display:inline-block; width:14px; height:14px; background:${layer.colors[0].hex}; border-radius:3px; border:1px solid #000;"></span></span>
      </div>
    `;
    card.appendChild(controls);
    container.appendChild(card);

    populateSelect(document.getElementById(`layer_pal_${layerIdx}`), PALETTES, layer.palette);
    populateSelect(document.getElementById(`layer_sty_${layerIdx}`), STYLES, layer.style);

    document.getElementById(`layer_en_${layerIdx}`).addEventListener("change", (e) => {
      layer.enabled = e.target.checked;
      renderFrame();
    });

    document.getElementById(`layer_tol_${layerIdx}`).addEventListener("input", (e) => {
      layer.tolerance = parseInt(e.target.value, 10);
      document.getElementById(`lbl_tol_${layerIdx}`).textContent = layer.tolerance;
      renderFrame();
    });

    document.getElementById(`layer_pal_${layerIdx}`).addEventListener("change", (e) => {
      layer.palette = e.target.value;
      renderFrame();
    });

    document.getElementById(`layer_sty_${layerIdx}`).addEventListener("change", (e) => {
      layer.style = e.target.value;
      renderFrame();
    });

    layer.colors.forEach((slot, slotIdx) => {
      const chkEl = document.getElementById(`slot_chk_${layerIdx}_${slotIdx}`);
      const colEl = document.getElementById(`slot_col_${layerIdx}_${slotIdx}`);
      const clrEl = document.getElementById(`slot_clr_${layerIdx}_${slotIdx}`);
      const dropEl = document.getElementById(`slot_drop_${layerIdx}_${slotIdx}`);
      const boxEl = document.getElementById(`slot_box_${layerIdx}_${slotIdx}`);

      chkEl.addEventListener("change", (e) => {
        slot.active = e.target.checked;
        boxEl.classList.toggle("disabled-slot", !slot.active);
        if (slot.active) {
          layer.enabled = true;
          document.getElementById(`layer_en_${layerIdx}`).checked = true;
        }
        renderFrame();
      });

      colEl.addEventListener("input", (e) => {
        slot.hex = e.target.value;
        slot.active = true;
        chkEl.checked = true;
        boxEl.classList.remove("disabled-slot");
        layer.enabled = true;
        document.getElementById(`layer_en_${layerIdx}`).checked = true;
        if (slotIdx === 0) card.style.borderLeftColor = slot.hex;
        const prev = document.getElementById(`layer_prev_${layerIdx}`);
        if (prev) prev.style.background = slot.hex;
        renderFrame();
      });

      clrEl.addEventListener("click", () => {
        slot.active = false;
        chkEl.checked = false;
        boxEl.classList.add("disabled-slot");
        renderFrame();
      });

      dropEl.addEventListener("click", () => {
        const isSame = state.activeEyedropper &&
          state.activeEyedropper.layerIndex === layerIdx &&
          state.activeEyedropper.slotIndex === slotIdx;

        clearEyedropperState();
        if (!isSame) {
          state.activeEyedropper = { layerIndex: layerIdx, slotIndex: slotIdx };
          dropEl.classList.add("eyedropper-active");
          canvas.classList.add("picking");
          setStatus(`💧 Clique no personagem para capturar ${layer.name} (Cor #${slotIdx + 1})`);
        }
      });
    });
  });
}

function clearEyedropperState() {
  state.activeEyedropper = null;
  document.querySelectorAll(".btn-drop").forEach(b => b.classList.remove("eyedropper-active"));
  canvas.classList.remove("picking");
}

function setStatus(text) {
  document.getElementById("statusBadge").textContent = text;
}

// ============================================================================
// RENDER
// ============================================================================

function renderFrame() {
  let srcW = 320, srcH = 320;

  if (state.mediaType === "image" && sourceImage.complete && sourceImage.naturalWidth > 0) {
    srcW = sourceImage.naturalWidth;
    srcH = sourceImage.naturalHeight;
  } else if (state.mediaType === "video" && sourceVideo.videoWidth > 0) {
    srcW = sourceVideo.videoWidth;
    srcH = sourceVideo.videoHeight;
  }

  const maxDim = 640;
  if (srcW > maxDim || srcH > maxDim) {
    const ratio = Math.min(maxDim / srcW, maxDim / srcH);
    srcW = Math.round(srcW * ratio);
    srcH = Math.round(srcH * ratio);
  }

  canvas.width = srcW;
  canvas.height = srcH;
  offCanvas.width = srcW;
  offCanvas.height = srcH;
  canvas.style.transform = `scale(${state.zoom / 100})`;

  if (state.mediaType === "demo") {
    drawDemoCharacter(offCtx, srcW, srcH);
  } else if (state.mediaType === "image") {
    offCtx.clearRect(0, 0, srcW, srcH);
    offCtx.drawImage(sourceImage, 0, 0, srcW, srcH);
  } else if (state.mediaType === "video") {
    offCtx.drawImage(sourceVideo, 0, 0, srcW, srcH);
  }

  const imgData = offCtx.getImageData(0, 0, srcW, srcH);
  const data = imgData.data;
  const px = state.pixelSize;

  const activeLayers = state.layers
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.enabled)
    .map(l => ({
      ...l,
      targets: l.colors.filter(c => c.active).map(c => hexToRgb(c.hex))
    }))
    .filter(l => l.targets.length > 0);

  const layerCounts = new Array(state.layers.length).fill(0);

  ctx.clearRect(0, 0, srcW, srcH);

  const cols = Math.ceil(srcW / px);
  const rows = Math.ceil(srcH / px);

  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      const startX = bx * px;
      const startY = by * px;
      const sampleX = Math.min(srcW - 1, startX + Math.floor(px / 2));
      const sampleY = Math.min(srcH - 1, startY + Math.floor(px / 2));
      const idx = (sampleY * srcW + sampleX) * 4;

      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a < 20) continue;

      let matchedLayer = null;
      let bestDist = Infinity;

      for (let i = 0; i < activeLayers.length; i++) {
        const layer = activeLayers[i];
        for (let t = 0; t < layer.targets.length; t++) {
          const target = layer.targets[t];
          const dist = colorDistance(r, g, b, target.r, target.g, target.b);
          if (dist <= layer.tolerance && dist < bestDist) {
            bestDist = dist;
            matchedLayer = layer;
          }
        }
      }

      if (matchedLayer) layerCounts[matchedLayer.idx]++;

      const targetPalette = matchedLayer ? matchedLayer.palette : state.globalPalette;
      const targetStyle = matchedLayer ? matchedLayer.style : state.globalStyle;

      if (state.outlineThreshold > 0 && bx > 0 && by > 0) {
        const leftIdx = (sampleY * srcW + Math.max(0, sampleX - px)) * 4;
        const diff = colorDistance(r, g, b, data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]);
        if (diff > (260 - state.outlineThreshold)) {
          ctx.fillStyle = "#08080a";
          ctx.fillRect(startX, startY, px, px);
          continue;
        }
      }

      const finalCol = applyStyleAndPalette(r, g, b, bx, by, targetPalette, targetStyle);
      drawStyledBlock(ctx, startX, startY, px, finalCol, targetStyle);

      if (state.showDebug && matchedLayer) {
        ctx.strokeStyle = matchedLayer.colors[0].hex;
        ctx.lineWidth = 1;
        ctx.strokeRect(startX + 0.5, startY + 0.5, px - 1, px - 1);
      }
    }
  }

  state.layers.forEach((_, i) => {
    const el = document.getElementById(`layer_count_${i}`);
    if (el) el.textContent = layerCounts[i];
  });
}

function drawStyledBlock(context, x, y, size, col, styleKey) {
  const baseFill = `rgb(${col.r},${col.g},${col.b})`;

  if (styleKey === "dots" && size >= 3) {
    context.fillStyle = `rgb(${Math.round(col.r * 0.35)},${Math.round(col.g * 0.35)},${Math.round(col.b * 0.35)})`;
    context.fillRect(x, y, size, size);
    context.fillStyle = baseFill;
    context.beginPath();
    context.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2);
    context.fill();
    return;
  }

  context.fillStyle = baseFill;
  context.fillRect(x, y, size, size);

  if (styleKey === "grid" && size >= 3) {
    context.strokeStyle = "rgba(0,0,0,0.35)";
    context.lineWidth = 1;
    context.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  } else if (styleKey === "bevel" && size >= 4) {
    context.fillStyle = "rgba(255,255,255,0.25)";
    context.fillRect(x, y, size, 1);
    context.fillRect(x, y, 1, size);
    context.fillStyle = "rgba(0,0,0,0.3)";
    context.fillRect(x, y + size - 1, size, 1);
    context.fillRect(x + size - 1, y, 1, size);
  } else if (styleKey === "crosshatch" && size >= 4) {
    context.strokeStyle = "rgba(0,0,0,0.28)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + size, y + size);
    context.stroke();
  } else if (styleKey === "diagonal" && size >= 4) {
    context.strokeStyle = "rgba(255,255,255,0.22)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x + size, y);
    context.lineTo(x, y + size);
    context.stroke();
  }
}

function drawDemoCharacter(c, w, h) {
  c.fillStyle = "#1e293b";
  c.fillRect(0, 0, w, h);

  // Cabelo base
  c.fillStyle = "#3b2314";
  c.fillRect(105, 40, 110, 75);
  // Mecha secundária
  c.fillStyle = "#9a3412";
  c.fillRect(175, 45, 35, 65);

  // Pele base
  c.fillStyle = "#f2b894";
  c.fillRect(118, 70, 84, 72);
  // Sombra da pele
  c.fillStyle = "#c97b5d";
  c.fillRect(118, 130, 84, 12);

  // Olhos
  c.fillStyle = "#10b981";
  c.fillRect(134, 96, 12, 14);
  c.fillRect(174, 96, 12, 14);
  // Pupila
  c.fillStyle = "#064e3b";
  c.fillRect(138, 100, 4, 6);
  c.fillRect(178, 100, 4, 6);

  // Roupa superior
  c.fillStyle = "#2563eb";
  c.fillRect(96, 146, 128, 74);
  c.fillStyle = "#1e3a8a";
  c.fillRect(96, 146, 128, 8);

  // Cinto
  c.fillStyle = "#eab308";
  c.fillRect(96, 212, 128, 12);

  // Roupa inferior
  c.fillStyle = "#1e293b";
  c.fillRect(108, 224, 44, 58);
  c.fillRect(168, 224, 44, 58);

  // Sapatos
  c.fillStyle = "#dc2626";
  c.fillRect(102, 282, 52, 20);
  c.fillRect(166, 282, 52, 20);
  c.fillStyle = "#7f1d1d";
  c.fillRect(102, 298, 52, 4);
  c.fillRect(166, 298, 52, 4);
}

// ============================================================================
// CONTA-GOTAS
// ============================================================================

canvas.addEventListener("click", (e) => {
  if (!state.activeEyedropper) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = offCanvas.width / rect.width;
  const scaleY = offCanvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  if (x < 0 || y < 0 || x >= offCanvas.width || y >= offCanvas.height) return;

  const pixel = offCtx.getImageData(x, y, 1, 1).data;
  const hex = "#" + [pixel[0], pixel[1], pixel[2]]
    .map(v => v.toString(16).padStart(2, "0"))
    .join("");

  const { layerIndex, slotIndex } = state.activeEyedropper;
  const layer = state.layers[layerIndex];
  const slot = layer.colors[slotIndex];

  slot.hex = hex;
  slot.active = true;
  layer.enabled = true;

  document.getElementById(`layer_en_${layerIndex}`).checked = true;
  document.getElementById(`slot_chk_${layerIndex}_${slotIndex}`).checked = true;
  document.getElementById(`slot_col_${layerIndex}_${slotIndex}`).value = hex;
  document.getElementById(`slot_box_${layerIndex}_${slotIndex}`).classList.remove("disabled-slot");

  const prev = document.getElementById(`layer_prev_${layerIndex}`);
  if (prev) prev.style.background = hex;

  const box = document.getElementById(`slot_box_${layerIndex}_${slotIndex}`);
  box.style.transform = "scale(1.15)";
  setTimeout(() => { box.style.transform = "scale(1)"; }, 150);

  clearEyedropperState();
  setStatus(`✅ ${hex.toUpperCase()} salvo em ${layer.name} (#${slotIndex + 1})`);
  renderFrame();
});

// ============================================================================
// ZIP NATIVO
// ============================================================================

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const centralDir = [];
  const fileChunks = [];
  let offset = 0;

  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = file.data;
    const crc = crc32(data);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);

    fileChunks.push(localHeader, data);

    const cdHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    cdHeader.set(nameBytes, 46);

    centralDir.push(cdHeader);
    offset += localHeader.length + data.length;
  }

  let cdSize = 0;
  centralDir.forEach(c => cdSize += c.length);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);

  return new Blob([...fileChunks, ...centralDir, eocd], { type: "application/zip" });
}

async function exportVideoSequenceZip() {
  if (state.mediaType !== "video" || !sourceVideo.duration) {
    alert("Carregue primeiro um vídeo (.MP4 ou .WEBM) para exportar a sequência PNG em .ZIP.");
    return;
  }

  const wasPlaying = !sourceVideo.paused;
  sourceVideo.pause();
  state.isPlaying = false;

  const fps = state.zipFps;
  const duration = sourceVideo.duration;
  const totalFrames = Math.max(1, Math.floor(duration * fps));
  const files = [];

  const bar = document.getElementById("zipProgress");
  const barFill = bar.querySelector("div");
  const statusEl = document.getElementById("zipStatus");
  bar.classList.add("active");

  for (let i = 0; i < totalFrames; i++) {
    const targetTime = Math.min(duration - 0.01, i / fps);
    sourceVideo.currentTime = targetTime;

    await new Promise(resolve => {
      const onSeeked = () => { sourceVideo.removeEventListener("seeked", onSeeked); resolve(); };
      sourceVideo.addEventListener("seeked", onSeeked);
    });

    renderFrame();
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    const arrayBuf = await blob.arrayBuffer();
    const frameNum = String(i + 1).padStart(4, "0");
    files.push({ name: `frame_${frameNum}.png`, data: new Uint8Array(arrayBuf) });

    const pct = Math.round(((i + 1) / totalFrames) * 100);
    barFill.style.width = `${pct}%`;
    statusEl.textContent = `Renderizando quadro ${i + 1} de ${totalFrames} (${pct}%)...`;
  }

  statusEl.textContent = "Compactando arquivos PNG em .ZIP...";
  const zipBlob = createZipBlob(files);
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sequencia_pixel_art_${fps}fps.zip`;
  a.click();
  URL.revokeObjectURL(url);

  statusEl.textContent = `✅ Concluído! ${totalFrames} quadros exportados.`;
  setTimeout(() => bar.classList.remove("active"), 3000);
  if (wasPlaying) {
    sourceVideo.play();
    state.isPlaying = true;
    videoLoop();
  }
}

// ============================================================================
// CONTROLES
// ============================================================================

function videoLoop() {
  if (!state.isPlaying || state.mediaType !== "video") return;
  renderFrame();
  const seek = document.getElementById("videoSeek");
  const timeLbl = document.getElementById("videoTime");
  if (sourceVideo.duration) {
    seek.value = (sourceVideo.currentTime / sourceVideo.duration) * 100;
    timeLbl.textContent = `${sourceVideo.currentTime.toFixed(1)}s / ${sourceVideo.duration.toFixed(1)}s`;
  }
  animFrameId = requestAnimationFrame(videoLoop);
}

document.getElementById("rangePixelSize").addEventListener("input", (e) => {
  state.pixelSize = parseInt(e.target.value, 10);
  document.getElementById("lblPixelSize").textContent = `${state.pixelSize} px`;
  renderFrame();
});

document.getElementById("selectGlobalPalette").addEventListener("change", (e) => {
  state.globalPalette = e.target.value;
  renderFrame();
});

document.getElementById("selectGlobalStyle").addEventListener("change", (e) => {
  state.globalStyle = e.target.value;
  renderFrame();
});

document.getElementById("rangeOutline").addEventListener("input", (e) => {
  state.outlineThreshold = parseInt(e.target.value, 10);
  document.getElementById("lblOutline").textContent = state.outlineThreshold;
  renderFrame();
});

document.getElementById("rangeZipFps").addEventListener("input", (e) => {
  state.zipFps = parseInt(e.target.value, 10);
  document.getElementById("lblZipFps").textContent = `${state.zipFps} FPS`;
});

document.getElementById("rangeZoom").addEventListener("input", (e) => {
  state.zoom = parseInt(e.target.value, 10);
  document.getElementById("lblZoom").textContent = `${state.zoom}%`;
  canvas.style.transform = `scale(${state.zoom / 100})`;
});

document.getElementById("btnToggleDebug").addEventListener("click", () => {
  state.showDebug = !state.showDebug;
  const btn = document.getElementById("btnToggleDebug");
  btn.textContent = state.showDebug ? "Debug ON" : "Debug Visual";
  btn.style.background = state.showDebug ? "#ff0066" : "";
  renderFrame();
});

document.getElementById("btnOpenFile").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);

  if (file.type.startsWith("video/")) {
    state.mediaType = "video";
    sourceVideo.src = url;
    sourceVideo.onloadeddata = () => {
      sourceVideo.play();
      state.isPlaying = true;
      setStatus(`Vídeo carregado: ${file.name}`);
      videoLoop();
    };
  } else {
    state.isPlaying = false;
    cancelAnimationFrame(animFrameId);
    state.mediaType = "image";
    sourceImage = new Image();
    sourceImage.onload = () => {
      setStatus(`Imagem carregada: ${file.name}`);
      renderFrame();
    };
    sourceImage.src = url;
  }
});

document.getElementById("btnDemoChar").addEventListener("click", () => {
  state.isPlaying = false;
  cancelAnimationFrame(animFrameId);
  state.mediaType = "demo";
  setStatus("Personagem exemplo carregado");
  renderFrame();
});

document.getElementById("btnDownloadPng").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "personagem_pixel_art.png";
  a.click();
});

document.getElementById("btnExportZip").addEventListener("click", exportVideoSequenceZip);

document.getElementById("btnPlayPause").addEventListener("click", () => {
  if (state.mediaType !== "video") return;
  if (sourceVideo.paused) {
    sourceVideo.play();
    state.isPlaying = true;
    videoLoop();
  } else {
    sourceVideo.pause();
    state.isPlaying = false;
  }
});

document.getElementById("btnStop").addEventListener("click", () => {
  if (state.mediaType !== "video") return;
  sourceVideo.pause();
  sourceVideo.currentTime = 0;
  state.isPlaying = false;
  renderFrame();
});

document.getElementById("videoSeek").addEventListener("input", (e) => {
  if (state.mediaType !== "video" || !sourceVideo.duration) return;
  sourceVideo.currentTime = (parseFloat(e.target.value) / 100) * sourceVideo.duration;
  renderFrame();
});

// Inicialização
buildUI();
renderFrame();