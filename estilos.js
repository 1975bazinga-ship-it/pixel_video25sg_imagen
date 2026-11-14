window.BANCO_ESTILOS = [
  // ===== ORIGINAIS =====
  { id: "quadrado_media", nome: "01. Quadrado (Média de Cor)" },
  { id: "quadrado_centro", nome: "02. Quadrado (Amostra Central)" },
  { id: "erosao", nome: "03. Erosão de Sombras (Mais Escuro)" },
  { id: "dilatacao", nome: "04. Dilatação de Luz (Mais Claro)" },
  { id: "bayer2", nome: "05. Dithering Bayer 2x2" },
  { id: "bayer4", nome: "06. Dithering Bayer 4x4" },
  { id: "bayer8", nome: "07. Dithering Bayer 8x8" },
  { id: "meio_tom", nome: "08. Meio-Tom (Pontos Variáveis)" },
  { id: "leds", nome: "09. Matriz de LEDs Circulares" },
  { id: "losangos", nome: "10. Losangos / Diamantes" },
  { id: "lego", nome: "11. Blocos de Montar (LEGO)" },
  { id: "ponto_cruz", nome: "12. Ponto Cruz (Bordado)" },
  { id: "azulejo3d", nome: "13. Azulejos 3D Chanfrados" },
  { id: "crt_rgb", nome: "14. Subpixels CRT (RGB)" },
  { id: "scanlines", nome: "15. Monitor Scanlines" },
  { id: "ascii", nome: "16. Arte ASCII Retrô" },

  // ===== NOVOS ESTILOS =====
  { id: "hexagonos", nome: "17. Colmeia de Hexágonos" },
  { id: "circulos", nome: "18. Círculos Sobrepostos (Halftone)" },
  { id: "triangulos", nome: "19. Mosaico Triangular" },
  { id: "estrelas", nome: "20. Estrelas de 5 Pontas" },
  { id: "coracoes", nome: "21. Corações Pixelados" },
  { id: "flores", nome: "22. Flores / Margaridas" },
  { id: "favos", nome: "23. Favos de Mel (Honeycomb)" },
  { id: "arcade", nome: "24. Arcade Pixel (8-bit)" },
  { id: "crosshatch", nome: "25. Hachura Cruzada (Crosshatch)" },
  { id: "pontilhismo", nome: "26. Pontilhismo (Seurat)" },
  { id: "mosaico_vidro", nome: "27. Mosaico de Vidro (Vitral)" },
  { id: "quadrado_borda", nome: "28. Quadrados com Borda Interna" },
  { id: "espiral", nome: "29. Espirais Concêntricas" },
  { id: "grid_dots", nome: "30. Grade de Pontos (LED Matrix)" },
  { id: "ondas", nome: "31. Ondas Senoidais" },
  { id: "zigzag", nome: "32. Zigue-Zague / Chevron" },
  { id: "tijolos", nome: "33. Tijolos de Alvenaria" },
  { id: "madeira", nome: "34. Textura de Madeira" },
  { id: "neon_glow", nome: "35. Neon Glow (Brilho)" },
  { id: "cristal", nome: "36. Cristal / Gemas" },
  { id: "circuito", nome: "37. Placa de Circuito" },
  { id: "pixel_art", nome: "38. Pixel Art (Bloco Sólido)" },
  { id: "borrado", nome: "39. Desfoque (Blur Pixelado)" },
  { id: "sharpen", nome: "40. Nitidez (Sharpen)" },
  { id: "emboss", nome: "41. Relevo (Emboss)" },
  { id: "contorno_estilo", nome: "42. Contorno Estilizado" },
  { id: "carvao", nome: "43. Desenho a Carvão" },
  { id: "aquarela", nome: "44. Aquarela (Watercolor)" },
  { id: "quadrinhos", nome: "45. Quadrinhos (Comic)" },
  { id: "matrix_rain", nome: "46. Chuva Matrix (Glifos)" },
  { id: "cruz_dupla", nome: "47. Cruz Dupla (Xadrez)" },
  { id: "oculos", nome: "48. Óculos / Lentes" },
  { id: "yin_yang", nome: "49. Yin-Yang Rotativo" },
  { id: "engrenagem", nome: "50. Engrenagens Mecânicas" },
  { id: "bolhas", nome: "51. Bolhas de Sabão" },
  { id: "diamante_facetado", nome: "52. Diamante Facetado" },
  { id: "quadrado_rotacionado", nome: "53. Quadrado Rotacionado 45°" },
  { id: "losango_vazado", nome: "54. Losango Vazado" },
  { id: "retangulo_vertical", nome: "55. Retângulos Verticais" },
  { id: "barra_horizontal", nome: "56. Barras Horizontais" },
  { id: "pontos_aleatorios", nome: "57. Pontos Aleatórios (Estilo TV)" },
  { id: "vhs", nome: "58. VHS / Fita Cassete" },
  { id: "glitch", nome: "59. Glitch Digital" },
  { id: "pixel_shift", nome: "60. Pixel Shift (Deslocamento)" }
];

window.EstiloRenderer = {
  bayer2: [[0, 2], [3, 1]],
  bayer4: [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ],
  bayer8: [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
  ],
  asciiChars: [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
  matrixChars: ["0", "1", "7", "4", "9", "ア", "イ", "ウ", "エ", "オ"],

  renderizar(ctx, srcData, w, h, opts) {
    const { bloco, estilo, rgbPaleta, grade, contorno, brilho, contraste, chromaAtivo, chromaRgb, chromaTol } = opts;
    ctx.clearRect(0, 0, w, h);

    const cols = Math.ceil(w / bloco);
    const rows = Math.ceil(h / bloco);
    const gridColors = new Array(rows * cols);
    const factor = (259 * (contraste + 255)) / (255 * (259 - contraste));

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const px = gx * bloco;
        const py = gy * bloco;
        const bw = Math.min(bloco, w - px);
        const bh = Math.min(bloco, h - py);

        let r = 0, g = 0, b = 0, a = 0;

        if (estilo === "quadrado_centro") {
          const cx = Math.min(w - 1, px + Math.floor(bw / 2));
          const cy = Math.min(h - 1, py + Math.floor(bh / 2));
          const idx = (cy * w + cx) * 4;
          r = srcData[idx]; g = srcData[idx + 1]; b = srcData[idx + 2]; a = srcData[idx + 3];
        } else if (estilo === "erosao") {
          let minLuma = Infinity;
          for (let y = py; y < py + bh; y++) {
            for (let x = px; x < px + bw; x++) {
              const idx = (y * w + x) * 4;
              const luma = srcData[idx] + srcData[idx + 1] + srcData[idx + 2];
              if (luma < minLuma) {
                minLuma = luma;
                r = srcData[idx]; g = srcData[idx + 1]; b = srcData[idx + 2]; a = srcData[idx + 3];
              }
            }
          }
        } else if (estilo === "dilatacao") {
          let maxLuma = -1;
          for (let y = py; y < py + bh; y++) {
            for (let x = px; x < px + bw; x++) {
              const idx = (y * w + x) * 4;
              const luma = srcData[idx] + srcData[idx + 1] + srcData[idx + 2];
              if (luma > maxLuma) {
                maxLuma = luma;
                r = srcData[idx]; g = srcData[idx + 1]; b = srcData[idx + 2]; a = srcData[idx + 3];
              }
            }
          }
        } else {
          let count = 0;
          for (let y = py; y < py + bh; y++) {
            for (let x = px; x < px + bw; x++) {
              const idx = (y * w + x) * 4;
              r += srcData[idx]; g += srcData[idx + 1]; b += srcData[idx + 2]; a += srcData[idx + 3];
              count++;
            }
          }
          r /= count; g /= count; b /= count; a /= count;
        }

        if (chromaAtivo && a > 10) {
          const dist = Math.hypot(r - chromaRgb[0], g - chromaRgb[1], b - chromaRgb[2]);
          if (dist <= chromaTol) a = 0;
        }

        if (a < 20) {
          gridColors[gy * cols + gx] = null;
          continue;
        }

        r = Math.min(255, Math.max(0, factor * (r - 128) + 128 + brilho));
        g = Math.min(255, Math.max(0, factor * (g - 128) + 128 + brilho));
        b = Math.min(255, Math.max(0, factor * (b - 128) + 128 + brilho));

        if (estilo === "bayer2") {
          const t = (this.bayer2[gy % 2][gx % 2] / 4 - 0.5) * 64;
          r = Math.min(255, Math.max(0, r + t));
          g = Math.min(255, Math.max(0, g + t));
          b = Math.min(255, Math.max(0, b + t));
        } else if (estilo === "bayer4") {
          const t = (this.bayer4[gy % 4][gx % 4] / 16 - 0.5) * 64;
          r = Math.min(255, Math.max(0, r + t));
          g = Math.min(255, Math.max(0, g + t));
          b = Math.min(255, Math.max(0, b + t));
        } else if (estilo === "bayer8") {
          const t = (this.bayer8[gy % 8][gx % 8] / 64 - 0.5) * 64;
          r = Math.min(255, Math.max(0, r + t));
          g = Math.min(255, Math.max(0, g + t));
          b = Math.min(255, Math.max(0, b + t));
        }

        const finalRgb = window.PaletaHelper.corMaisProxima(r, g, b, rgbPaleta);
        gridColors[gy * cols + gx] = finalRgb;
        this.desenharBloco(ctx, estilo, px, py, bw, bh, finalRgb, gx, gy, bloco);
      }
    }

    if (grade || contorno) {
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const c = gridColors[gy * cols + gx];
          const px = gx * bloco;
          const py = gy * bloco;

          if (grade && c) {
            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, bloco - 1, bloco - 1);
          }

          if (contorno && c) {
            ctx.fillStyle = "#000000";
            const t = Math.max(1, Math.floor(bloco * 0.18));
            const top = gy > 0 ? gridColors[(gy - 1) * cols + gx] : null;
            const bot = gy < rows - 1 ? gridColors[(gy + 1) * cols + gx] : null;
            const left = gx > 0 ? gridColors[gy * cols + (gx - 1)] : null;
            const right = gx < cols - 1 ? gridColors[gy * cols + (gx + 1)] : null;

            if (!top || this.diffCor(c, top) > 95) ctx.fillRect(px, py, bloco, t);
            if (!bot || this.diffCor(c, bot) > 95) ctx.fillRect(px, py + bloco - t, bloco, t);
            if (!left || this.diffCor(c, left) > 95) ctx.fillRect(px, py, t, bloco);
            if (!right || this.diffCor(c, right) > 95) ctx.fillRect(px + bloco - t, py, t, bloco);
          }
        }
      }
    }
  },

  diffCor(c1, c2) {
    return Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]) + Math.abs(c1[2] - c2[2]);
  },

  desenharBloco(ctx, estilo, x, y, w, h, rgb, gx, gy, bloco) {
    const cor = `rgb(${rgb[0]|0},${rgb[1]|0},${rgb[2]|0})`;
    const luma = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) / 255;

    switch (estilo) {
      case "leds": {
        ctx.fillStyle = "#0a0a0c";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.max(1, Math.min(w, h) * 0.42), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "meio_tom": {
        ctx.fillStyle = "#111116";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const raio = Math.max(0.8, (Math.min(w, h) * 0.48) * luma);
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, raio, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "losangos": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w / 2, y + h);
        ctx.lineTo(x, y + h / 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "lego": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.max(1, Math.min(w, h) * 0.26), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "ponto_cruz": {
        ctx.fillStyle = "#1a1817";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1.2, w * 0.22);
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + w - 1, y + h - 1);
        ctx.moveTo(x + w - 1, y + 1);
        ctx.lineTo(x + 1, y + h - 1);
        ctx.stroke();
        break;
      }
      case "azulejo3d": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        const b = Math.max(1, Math.floor(w * 0.16));
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(x, y, w, b);
        ctx.fillRect(x, y, b, h);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(x, y + h - b, w, b);
        ctx.fillRect(x + w - b, y, b, h);
        break;
      }
      case "crt_rgb": {
        ctx.fillStyle = "#050505";
        ctx.fillRect(x, y, w, h);
        const sw = w / 3;
        ctx.fillStyle = `rgb(${rgb[0]|0},0,0)`;
        ctx.fillRect(x, y, sw, h - 1);
        ctx.fillStyle = `rgb(0,${rgb[1]|0},0)`;
        ctx.fillRect(x + sw, y, sw, h - 1);
        ctx.fillStyle = `rgb(0,0,${rgb[2]|0})`;
        ctx.fillRect(x + sw * 2, y, sw, h - 1);
        break;
      }
      case "scanlines": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, Math.max(1, h * 0.65));
        ctx.fillStyle = "#08080a";
        ctx.fillRect(x, y + h * 0.65, w, h * 0.35);
        break;
      }
      case "ascii": {
        ctx.fillStyle = "#0a0a0d";
        ctx.fillRect(x, y, w, h);
        const charIdx = Math.min(this.asciiChars.length - 1, Math.floor(luma * this.asciiChars.length));
        ctx.fillStyle = cor;
        ctx.font = `bold ${Math.max(6, Math.floor(h * 0.95))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.asciiChars[charIdx], x + w / 2, y + h / 2 + 1);
        break;
      }

      // ===== NOVOS ESTILOS =====
      case "hexagonos": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.48;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "circulos": {
        ctx.fillStyle = "#111116";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.max(1, Math.min(w, h) * 0.48), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "triangulos": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "estrelas": {
        ctx.fillStyle = "#0a0a0d";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const cx = x + w / 2, cy = y + h / 2, rOut = Math.min(w, h) * 0.48, rIn = rOut * 0.4;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const r = i % 2 === 0 ? rOut : rIn;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "coracoes": {
        ctx.fillStyle = "#1a0a12";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2;
        const s = Math.min(w, h) * 0.4;
        ctx.moveTo(cx, cy + s * 0.8);
        ctx.bezierCurveTo(cx - s * 1.2, cy - s * 0.2, cx - s * 0.6, cy - s * 1.2, cx, cy - s * 0.5);
        ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.2, cx + s * 1.2, cy - s * 0.2, cx, cy + s * 0.8);
        ctx.fill();
        break;
      }
      case "flores": {
        ctx.fillStyle = "#0a120a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const cx = x + w / 2, cy = y + h / 2, petR = Math.min(w, h) * 0.2;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(angle) * petR * 1.4, cy + Math.sin(angle) * petR * 1.4, petR, petR * 0.6, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#ffdd00";
        ctx.beginPath();
        ctx.arc(cx, cy, petR * 0.7, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "favos": {
        ctx.fillStyle = "#1a1200";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.5;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
      case "arcade": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillRect(x + i * w / 4, y + j * h / 4, w / 4, h / 4);
            }
          }
        }
        break;
      }
      case "crosshatch": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1;
        for (let i = -w; i < w + h; i += 4) {
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i - h, y + h);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i + h, y + h);
          ctx.stroke();
        }
        break;
      }
      case "pontilhismo": {
        ctx.fillStyle = "#111116";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const step = Math.max(2, Math.floor(Math.min(w, h) / 4));
        for (let i = 0; i < w; i += step) {
          for (let j = 0; j < h; j += step) {
            const jitter = Math.sin(gx * 7.3 + gy * 11.7 + i + j) * step * 0.3;
            ctx.beginPath();
            ctx.arc(x + i + jitter, y + j + jitter, Math.max(0.5, step * 0.35), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case "mosaico_vidro": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        const segs = 5;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 1.5;
        for (let i = 1; i < segs; i++) {
          ctx.beginPath();
          ctx.moveTo(x + (w / segs) * i + Math.sin(gx + i) * 2, y);
          ctx.lineTo(x + (w / segs) * i + Math.cos(gy + i) * 2, y + h);
          ctx.stroke();
        }
        for (let j = 1; j < segs; j++) {
          ctx.beginPath();
          ctx.moveTo(x, y + (h / segs) * j + Math.cos(gx + j) * 2);
          ctx.lineTo(x + w, y + (h / segs) * j + Math.sin(gy + j) * 2);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(x, y, w * 0.5, h * 0.5);
        break;
      }
      case "quadrado_borda": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(1, Math.floor(w * 0.12));
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        break;
      }
      case "espiral": {
        ctx.fillStyle = "#0a0a0d";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1, w * 0.12);
        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2;
        for (let t = 0; t < Math.PI * 4; t += 0.2) {
          const r = (t / (Math.PI * 4)) * Math.min(w, h) * 0.45;
          const px = cx + r * Math.cos(t);
          const py = cy + r * Math.sin(t);
          if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        break;
      }
      case "grid_dots": {
        ctx.fillStyle = "#08080a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const step = Math.max(2, Math.floor(Math.min(w, h) / 3));
        for (let i = step / 2; i < w; i += step) {
          for (let j = step / 2; j < h; j += step) {
            ctx.beginPath();
            ctx.arc(x + i, y + j, Math.max(0.8, step * 0.25), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case "ondas": {
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1, h * 0.15);
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          for (let i = 0; i <= w; i += 2) {
            const yy = y + h / 2 + Math.sin((i / w) * Math.PI * 4 + k * 1.5 + gx * 0.5) * h * 0.3;
            if (i === 0) ctx.moveTo(x + i, yy); else ctx.lineTo(x + i, yy);
          }
          ctx.stroke();
        }
        break;
      }
      case "zigzag": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = Math.max(1, w * 0.08);
        ctx.beginPath();
        for (let i = 0; i <= w; i += w / 3) {
          const yy = y + (i % (w / 1.5) < w / 3 ? h * 0.2 : h * 0.8);
          if (i === 0) ctx.moveTo(x + i, yy); else ctx.lineTo(x + i, yy);
        }
        ctx.stroke();
        break;
      }
      case "tijolos": {
        ctx.fillStyle = "#4a2a1a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const offset = (gy % 2 === 0) ? 0 : w / 2;
        ctx.fillRect(x + offset, y, w - offset, h / 2);
        ctx.fillRect(x, y + h / 2, w, h / 2 - 1);
        ctx.strokeStyle = "#1a0a05";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        break;
      }
      case "madeira": {
        ctx.fillStyle = "#5a3a1a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        for (let j = 0; j < h; j += 3) {
          ctx.fillRect(x, y + j, w, 1.5);
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(x, y, w, 1);
        break;
      }
      case "neon_glow": {
        ctx.fillStyle = "#050508";
        ctx.fillRect(x, y, w, h);
        ctx.shadowColor = cor;
        ctx.shadowBlur = Math.min(w, h) * 0.6;
        ctx.fillStyle = cor;
        ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
        break;
      }
      case "cristal": {
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h * 0.4);
        ctx.lineTo(x + w * 0.7, y + h);
        ctx.lineTo(x + w * 0.3, y + h);
        ctx.lineTo(x, y + h * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w * 0.3, y + h);
        ctx.lineTo(x, y + h * 0.4);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "circuito": {
        ctx.fillStyle = "#0a1a0a";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#2a6a2a";
        ctx.lineWidth = Math.max(1, w * 0.1);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y + h * 0.2);
        ctx.lineTo(x + w * 0.8, y + h * 0.2);
        ctx.lineTo(x + w * 0.8, y + h * 0.8);
        ctx.stroke();
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x + w * 0.2, y + h * 0.2, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.8, y + h * 0.8, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "pixel_art": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        break;
      }
      case "borrado": {
        const blur = Math.max(2, Math.floor(w * 0.15));
        ctx.fillStyle = cor;
        ctx.fillRect(x - blur, y - blur, w + blur * 2, h + blur * 2);
        break;
      }
      case "sharpen": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = luma > 0.5 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
        break;
      }
      case "emboss": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(x, y, w, h * 0.2);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(x, y + h * 0.8, w, h * 0.2);
        break;
      }
      case "contorno_estilo": {
        ctx.fillStyle = "#08080a";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1.5, w * 0.12);
        ctx.strokeRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.7);
        break;
      }
      case "carvao": {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (gx + gy + i) * 1.7;
          ctx.beginPath();
          ctx.moveTo(x + w / 2 + Math.cos(angle) * w * 0.3, y + h / 2 + Math.sin(angle) * h * 0.3);
          ctx.lineTo(x + w / 2 + Math.cos(angle + 2) * w * 0.4, y + h / 2 + Math.sin(angle + 2) * h * 0.4);
          ctx.stroke();
        }
        break;
      }
      case "aquarela": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        for (let i = 0; i < 5; i++) {
          const rr = (Math.sin(gx * 3 + gy * 7 + i) * 0.5 + 0.5) * w * 0.5;
          ctx.fillStyle = `rgba(${rgb[0]|0},${rgb[1]|0},${rgb[2]|0},0.25)`;
          ctx.beginPath();
          ctx.arc(x + w * 0.5 + Math.sin(gx + i) * w * 0.3, y + h * 0.5 + Math.cos(gy + i) * h * 0.3, rr * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "quadrinhos": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(1.5, w * 0.1);
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        for (let i = 0; i < 3; i++) {
          const sx = x + (i / 3) * w + w / 6;
          ctx.beginPath();
          ctx.arc(sx, y + h * 0.2, w * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "matrix_rain": {
        ctx.fillStyle = "#000a00";
        ctx.fillRect(x, y, w, h);
        const charIdx = Math.floor((luma + Math.sin(gx * 13 + gy * 7) * 0.3) * this.matrixChars.length);
        ctx.fillStyle = `rgb(0,${Math.min(255, rgb[1]|0)},0)`;
        ctx.font = `bold ${Math.max(6, Math.floor(h * 0.95))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.matrixChars[Math.abs(charIdx) % this.matrixChars.length], x + w / 2, y + h / 2 + 1);
        break;
      }
      case "cruz_dupla": {
        ctx.fillStyle = "#1a1817";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1.2, w * 0.18);
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + w - 1, y + h - 1);
        ctx.moveTo(x + w - 1, y + 1);
        ctx.lineTo(x + 1, y + h - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + 1);
        ctx.lineTo(x + w / 2, y + h - 1);
        ctx.moveTo(x + 1, y + h / 2);
        ctx.lineTo(x + w - 1, y + h / 2);
        ctx.stroke();
        break;
      }
      case "oculos": {
        ctx.fillStyle = "#0a0a0d";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x + w * 0.3, y + h / 2, Math.min(w, h) * 0.25, 0, Math.PI * 2);
        ctx.arc(x + w * 0.7, y + h / 2, Math.min(w, h) * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1, w * 0.06);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h / 2);
        ctx.lineTo(x + w * 0.7, y + h / 2);
        ctx.stroke();
        break;
      }
      case "yin_yang": {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.45, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 0.3, Math.min(w, h) * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "engrenagem": {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.4;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          ctx.lineTo(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3);
          ctx.lineTo(cx + Math.cos(a + 0.2) * r, cy + Math.sin(a + 0.2) * r);
          ctx.lineTo(cx + Math.cos(a + 0.4) * r, cy + Math.sin(a + 0.4) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "bolhas": {
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1, w * 0.08);
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(x + w * 0.38, y + h * 0.38, Math.min(w, h) * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "diamante_facetado": {
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y);
        ctx.lineTo(x + w, y + h * 0.35);
        ctx.lineTo(x + w * 0.5, y + h);
        ctx.lineTo(x, y + h * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y);
        ctx.lineTo(x + w * 0.5, y + h);
        ctx.lineTo(x, y + h * 0.35);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "quadrado_rotacionado": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-w * 0.35, -h * 0.35, w * 0.7, h * 0.7);
        ctx.restore();
        break;
      }
      case "losango_vazado": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = cor;
        ctx.lineWidth = Math.max(1.5, w * 0.15);
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w / 2, y + h);
        ctx.lineTo(x, y + h / 2);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case "retangulo_vertical": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.fillRect(x + w * 0.25, y, w * 0.5, h);
        break;
      }
      case "barra_horizontal": {
        ctx.fillStyle = "#121216";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        ctx.fillRect(x, y + h * 0.25, w, h * 0.5);
        break;
      }
      case "pontos_aleatorios": {
        ctx.fillStyle = "#0a0a0d";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const seed = gx * 131 + gy * 71;
        for (let i = 0; i < 8; i++) {
          const rx = ((Math.sin(seed + i * 7.3) * 0.5 + 0.5) * w);
          const ry = ((Math.cos(seed + i * 11.7) * 0.5 + 0.5) * h);
          ctx.fillRect(x + rx, y + ry, Math.max(1, w * 0.1), Math.max(1, h * 0.1));
        }
        break;
      }
      case "vhs": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(255,0,0,0.25)";
        ctx.fillRect(x + 1, y, w, h);
        ctx.fillStyle = "rgba(0,0,255,0.25)";
        ctx.fillRect(x - 1, y, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let j = 0; j < h; j += 2) {
          ctx.fillRect(x, y + j, w, 0.5);
        }
        break;
      }
      case "glitch": {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        const shift = Math.sin(gx * 3 + gy * 7) * w * 0.3;
        ctx.fillStyle = "rgba(255,0,0,0.4)";
        ctx.fillRect(x + shift, y, w * 0.5, h);
        ctx.fillStyle = "rgba(0,255,255,0.4)";
        ctx.fillRect(x - shift, y, w * 0.5, h);
        break;
      }
      case "pixel_shift": {
        ctx.fillStyle = "#0a0a0d";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = cor;
        const shift = Math.floor(luma * 3);
        ctx.fillRect(x + shift, y + shift, w - shift * 2, h - shift * 2);
        break;
      }
      default: {
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, w, h);
        break;
      }
    }
  }
};