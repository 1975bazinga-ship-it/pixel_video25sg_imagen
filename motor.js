(() => {
  "use strict";

  const mainCanvas = document.getElementById("mainCanvas");
  const ctx = mainCanvas.getContext("2d", { willReadFrequently: true });
  const offCanvas = document.createElement("canvas");
  const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
  const videoEl = document.getElementById("hiddenVideo");
  const fileInput = document.getElementById("fileInput");
  const statusBadge = document.getElementById("statusBadge");

  const selectPaleta = document.getElementById("selectPaleta");
  const palettePreview = document.getElementById("palettePreview");
  const selectEstilo = document.getElementById("selectEstilo");
  const rangeZoom = document.getElementById("rangeZoom");
  
  const canvasArea = document.getElementById("canvasArea");
  const canvasWrapper = document.getElementById("canvasWrapper");

  const state = {
    isPlayingFrames: false,
    playFramesInterval: null,
    mediaType: "none",
    currentImg: null,
    synthTime: 0,
    isPlaying: true,
    animFrameId: null,
    layersAnimFrameId: null,

    frames: [],
    currentFrameIndex: 0,

    bloco: 2,
    paletteKey: "original",
    estiloKey: "quadrado_media",
    grade: false,
    contorno: false,
    contornoForca: 50,
    brilho: 0,
    contraste: 0,
    chromaAtivo: false,
    chromaHex: "#00ff00",
    chromaTol: 35,

    customPalette: ["#ff0055", "#00ffcc", "#ffff00", "#111122"],
    useCustomPalette: false,

    layersActive: false,
    showDebug: false,
    activeEyedropper: null,
    layers: [],

    mediaRecorder: null,
    recordedChunks: [],
      // Adicione dentro de const state = { ... }
    customFonts: [
      { name: "Arial", family: "Arial, sans-serif" },
      { name: "Pixel / Monospace", family: "monospace" },
      { name: "Impact", family: "Impact, sans-serif" }
    ],
    draggingTextIndex: null,
    dragOffset: { x: 0, y: 0 },
    texts: [
      { id: 1, active: false, content: "TEXTO 1", x: 50, y: 60, size: 36, color: "#ffffff", strokeColor: "#000000", strokeWidth: 3, fontFamily: "Arial, sans-serif", layerPos: "front", applyStyle: false, applyPalette: false, align: "left", rotation: 0, anim: "none", speed: 1 },
      { id: 2, active: false, content: "TEXTO 2", x: 50, y: 140, size: 28, color: "#00ffcc", strokeColor: "#000000", strokeWidth: 2, fontFamily: "monospace", layerPos: "front", applyStyle: true, applyPalette: true, align: "left", rotation: 0, anim: "none", speed: 1 },
      { id: 3, active: false, content: "TEXTO 3", x: 50, y: 220, size: 32, color: "#ff0055", strokeColor: "#000000", strokeWidth: 2, fontFamily: "Impact, sans-serif", layerPos: "back", applyStyle: false, applyPalette: false, align: "left", rotation: 0, anim: "none", speed: 1 }
    ]
    };

  function getPaletasKeys() { return Object.keys(window.BANCO_PALETAS); }
  function getPaletaNome(k) { return window.BANCO_PALETAS[k]?.nome || k; }
  function getPaletaRgb(k) {
    const p = window.BANCO_PALETAS[k];
    return (p && p.cores) ? p.cores.map(h => window.PaletaHelper.parseHex(h)) : null;
  }
  function getEstilosIds() { return window.BANCO_ESTILOS.map(e => e.id); }
  function getEstiloNome(id) {
    const e = window.BANCO_ESTILOS.find(x => x.id === id);
    return e ? e.nome : id;
  }
  function populatePaletaSelect(sel, selected) {
    sel.innerHTML = "";
    getPaletasKeys().forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = getPaletaNome(k);
      if (k === selected) opt.selected = true;
      sel.appendChild(opt);
    });
  }
  function populateEstiloSelect(sel, selected) {
    sel.innerHTML = "";
    getEstilosIds().forEach(id => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = getEstiloNome(id);
      if (id === selected) opt.selected = true;
      sel.appendChild(opt);
    });
  }
  function getActiveRgbPalette() {
    if (state.useCustomPalette && state.customPalette.length > 0)
      return state.customPalette.map(h => window.PaletaHelper.parseHex(h));
    return getPaletaRgb(state.paletteKey);
  }
  function atualizarPreviewPaleta() {
    palettePreview.innerHTML = "";
    const hex = state.useCustomPalette
      ? state.customPalette
      : (window.BANCO_PALETAS[state.paletteKey]?.cores || ["#ff4444","#44ff44","#4444ff","#ffff44"]);
    hex.forEach(c => { const d = document.createElement("div"); d.style.background = c; palettePreview.appendChild(d); });
  }

  // FUNÇÃO QUE ATUALIZA O TAMANHO DO CANVAS
  function setCanvasSize(w, h) {
    const maxDim = 960;
    let nw = w || 480, nh = h || 320;
    if (nw > maxDim || nh > maxDim) {
      const r = Math.min(maxDim/nw, maxDim/nh);
      nw = Math.round(nw*r); nh = Math.round(nh*r);
    }
    if (mainCanvas.width !== nw || mainCanvas.height !== nh) {
      mainCanvas.width = nw; mainCanvas.height = nh;
      offCanvas.width = nw; offCanvas.height = nh;
    }
    aplicarZoom(rangeZoom.value);
  }

  // LÓGICA DO ZOOM CENTRALIZADO E SEGURO (Não trava o vídeo)
  let currentZoomLevel = 1;
  function aplicarZoom(zoomVal) {
    currentZoomLevel = zoomVal / 100;
    document.getElementById("lblZoom").textContent = `${zoomVal}%`;
    rangeZoom.value = zoomVal;
    
    mainCanvas.style.transform = `scale(${currentZoomLevel})`;
    
    const rect = mainCanvas.getBoundingClientRect();
    canvasWrapper.style.width = Math.max(canvasArea.clientWidth, rect.width + 80) + "px";
    canvasWrapper.style.height = Math.max(canvasArea.clientHeight, rect.height + 80) + "px";
    
    // Se o vídeo estiver pausado e a imagem for atualizada, desenha um frame para não ficar em branco
    if (state.mediaType === "video" && videoEl.paused) {
      if (state.layersActive) renderLayersFrame();
      else renderRetroFrame();
    }
  }

  rangeZoom.addEventListener("input", (e) => {
    aplicarZoom(parseInt(e.target.value, 10));
  });

  canvasArea.addEventListener("wheel", (e) => {
    e.preventDefault();
    let step = Math.max(5, currentZoomLevel * 100 * 0.1);
    let newZoom = currentZoomLevel * 100;
    
    if (e.deltaY < 0) newZoom += step;
    else newZoom -= step;
    
    if (newZoom < 10) newZoom = 10;
    if (newZoom > 1000) newZoom = 1000;
    
    aplicarZoom(newZoom);
  }, { passive: false });

  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;

  function getCanvasCoords(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvasArea.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || state.activeEyedropper) return;

    const pos = getCanvasCoords(e);
    const pad = 8; // Margem de tolerância para facilitar clicar no texto

    // Verifica de trás para frente (Caixa 3 -> Caixa 1) se o clique atingiu algum texto ativo
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const txt = state.texts[i];
      if (!txt.active || !txt.content) continue;

      ctx.save();
      ctx.font = `bold ${txt.size}px ${txt.fontFamily}`;
      const metrics = ctx.measureText(txt.content);
      ctx.restore();

      const textW = metrics.width;
      const textH = txt.size * 1.2;

      if (
        pos.x >= txt.x - pad &&
        pos.x <= txt.x + textW + pad &&
        pos.y >= txt.y - pad &&
        pos.y <= txt.y + textH + pad
      ) {
        state.draggingTextIndex = i;
        state.dragOffset = { x: pos.x - txt.x, y: pos.y - txt.y };
        canvasArea.style.cursor = "move";
        return; // Bloqueia o arrasto do fundo enquanto move o texto
      }
    }

    // Se não clicou em nenhum texto, inicia o arrasto normal da área de visualização
    isDragging = true;
    canvasArea.style.cursor = "grabbing";
    startX = e.pageX - canvasArea.offsetLeft;
    startY = e.pageY - canvasArea.offsetTop;
    scrollLeft = canvasArea.scrollLeft;
    scrollTop = canvasArea.scrollTop;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    state.draggingTextIndex = null;
    canvasArea.style.cursor = "grab";
  });

  canvasArea.addEventListener("mousemove", (e) => {
    // 1. Movimento de arrastar o texto selecionado
    if (state.draggingTextIndex !== null) {
      e.preventDefault();
      const pos = getCanvasCoords(e);
      const txt = state.texts[state.draggingTextIndex];
      
      txt.x = Math.round(pos.x - state.dragOffset.x);
      txt.y = Math.round(pos.y - state.dragOffset.y);

      if (videoEl.paused || state.mediaType === "image" || state.mediaType === "demo") {
        state.layersActive ? renderLayersFrame() : renderRetroFrame();
      }
      return;
    }

    // 2. Movimento normal de arrastar a tela (Pan)
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - canvasArea.offsetLeft;
    const y = e.pageY - canvasArea.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    canvasArea.scrollLeft = scrollLeft - walkX;
    canvasArea.scrollTop = scrollTop - walkY;
  });



  function getGlobalOptions() {
    return {
      bloco: state.bloco,
      estilo: state.estiloKey,
      rgbPaleta: getActiveRgbPalette(),
      grade: state.grade,
      contorno: state.contorno,
      contornoForca: state.contornoForca,
      brilho: state.brilho,
      contraste: state.contraste,
      chromaAtivo: state.chromaAtivo,
      chromaRgb: window.PaletaHelper.parseHex(state.chromaHex),
      chromaTol: state.chromaTol
    };
  }

  function atualizarBarraFrames() {
    const bar = document.getElementById("framesBar");
    if (!bar) return;
    const temVarios = state.frames.length > 1;
    bar.style.display = temVarios ? "flex" : "none";
    document.getElementById("lblFrameAtual").textContent = `${state.currentFrameIndex + 1} / ${state.frames.length}`;
  }

  function irParaFrame(idx) {
    if (state.frames.length === 0) return;
    state.currentFrameIndex = Math.max(0, Math.min(state.frames.length - 1, idx));
    state.currentImg = state.frames[state.currentFrameIndex].img;
    state.mediaType = "image";
    setCanvasSize(state.currentImg.naturalWidth || state.currentImg.width, state.currentImg.naturalHeight || state.currentImg.height);
    atualizarBarraFrames();
    statusBadge.textContent = `Frame ${state.currentFrameIndex + 1} / ${state.frames.length}: ${state.frames[state.currentFrameIndex].name}`;
    if (state.layersActive) renderLayersFrame();
    else renderRetroFrame();
  }

  function adicionarFrames(files) {
    const promessas = [];
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const p = new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { state.frames.push({ img, name: file.name, url }); resolve(); };
        img.onerror = () => resolve();
        img.src = url;
      });
      promessas.push(p);
    });
    return Promise.all(promessas);
  }

  async function exportarTodosFramesZip() {
    if (state.frames.length === 0) { alert("Nenhuma imagem carregada."); return; }
    if (typeof JSZip === "undefined") { alert("JSZip não carregado."); return; }

    const totalImagens = state.frames.length;
    const zip = new JSZip();
    const nameBase = document.getElementById("fileName").value.trim() || "frame";
    const progressBar = document.getElementById("zipProgress");
    const fill = progressBar.querySelector("div");
    const zipStatus = document.getElementById("zipStatus");
    
    progressBar.classList.add("active");
    fill.style.width = "0%";

    const frameOriginal = state.currentFrameIndex;
    const mediaTypeOriginal = state.mediaType;
    const layersActiveOriginal = state.layersActive;

    try {
      for (let i = 0; i < totalImagens; i++) {
        state.currentFrameIndex = i;
        state.currentImg = state.frames[i].img;
        state.mediaType = "image";

        let canvasFrame = state.layersActive ? renderLayersFrameFullRes() : renderRetroFrameFullRes();
        const base64 = canvasFrame.toDataURL("image/png").split(",")[1];
        zip.file(`${nameBase}_${String(i + 1).padStart(4, "0")}.png`, base64, { base64: true });

        fill.style.width = `${((i + 1) / totalImagens) * 100}%`;
        zipStatus.textContent = `Exportando ${i + 1} / ${totalImagens}...`;

        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }

      zipStatus.textContent = "Compactando .zip...";
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nameBase}_${totalImagens}imagens.zip`;
      a.click();
      URL.revokeObjectURL(url);
      zipStatus.textContent = `✅ ${totalImagens} imagens exportadas!`;
    } catch (err) {
      console.error(err);
      zipStatus.textContent = "❌ Erro: " + err.message;
    } finally {
      state.layersActive = layersActiveOriginal;
      state.currentFrameIndex = frameOriginal;
      state.mediaType = mediaTypeOriginal;
      if (state.frames.length > 0) {
        state.currentImg = state.frames[frameOriginal].img;
        irParaFrame(frameOriginal);
      }
      setTimeout(() => { progressBar.classList.remove("active"); }, 2000);
    }
  }

  function initTextControls() {
    const container = document.getElementById("textBoxesContainer");
    if (!container) return;
    container.innerHTML = "";

    state.texts.forEach((txt, idx) => {
      const card = document.createElement("div");
      card.style.cssText = "background:#18181b; border:1px solid #3f3f46; padding:8px; border-radius:6px; display:flex; flex-direction:column; gap:6px;";
      
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label style="font-weight:bold; color:#00ffcc; cursor:pointer;">
            <input type="checkbox" id="txt_act_${idx}" ${txt.active ? "checked" : ""}> Caixa de Texto #${idx + 1}
          </label>
          <span style="font-size:10px; color:#a1a1aa;">Arraste no canvas</span>
        </div>
        <input type="text" id="txt_val_${idx}" value="${txt.content}" placeholder="Digite seu texto..." style="width:100%; padding:4px; background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:4px;">
        
        <div style="display:grid; grid-template-columns: 1fr 70px; gap:4px;">
          <select id="txt_font_${idx}" style="background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px;"></select>
          <input type="number" id="txt_size_${idx}" value="${txt.size}" min="8" max="200" title="Tamanho da Fonte" style="background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px;">
        </div>

        <div style="display:flex; gap:6px; align-items:center; font-size:11px;">
          <label>Cor: <input type="color" id="txt_col_${idx}" value="${txt.color}"></label>
          <label>Borda: <input type="color" id="txt_strk_${idx}" value="${txt.strokeColor}"></label>
          <select id="txt_pos_${idx}" style="flex:1; background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px;">
            <option value="front" ${txt.layerPos === "front" ? "selected" : ""}>Na Frente</option>
            <option value="back" ${txt.layerPos === "back" ? "selected" : ""}>Atrás (Requer Chroma)</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px; font-size:11px;">
          <select id="txt_align_${idx}" style="background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px;" title="Alinhamento">
            <option value="left" ${txt.align === "left" ? "selected" : ""}>⬅ Esquerda</option>
            <option value="center" ${txt.align === "center" ? "selected" : ""}>↔ Centro</option>
            <option value="right" ${txt.align === "right" ? "selected" : ""}>➡ Direita</option>
          </select>
          <select id="txt_anim_${idx}" style="background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:4px; padding:3px;" title="Animação">
            <option value="none" ${txt.anim === "none" ? "selected" : ""}>Sem Animação</option>
            <optgroup label="1. Clássicas e Modernas">
              <option value="fade" ${txt.anim === "fade" ? "selected" : ""}>1. Fade In / Fade Out</option>
              <option value="slide" ${txt.anim === "slide" ? "selected" : ""}>2. Slide Up (Máscara)</option>
              <option value="bounce" ${txt.anim === "bounce" ? "selected" : ""}>3. Bounce (Quique Elástico)</option>
              <option value="blur" ${txt.anim === "blur" ? "selected" : ""}>4. Tracking / Blur In</option>
              <option value="pop" ${txt.anim === "pop" ? "selected" : ""}>5. Pop / Scale Up</option>
            </optgroup>
            <optgroup label="2. Tipografia Cinética">
              <option value="kinetic" ${txt.anim === "kinetic" ? "selected" : ""}>6. Kinetic Typography</option>
              <option value="wave" ${txt.anim === "wave" ? "selected" : ""}>7. Staggered Wave (Onda)</option>
              <option value="slice" ${txt.anim === "slice" ? "selected" : ""}>8. Split / Slice Text</option>
              <option value="flip3d" ${txt.anim === "flip3d" ? "selected" : ""}>9. Roll / Flip 3D</option>
              <option value="marquee" ${txt.anim === "marquee" ? "selected" : ""}>10. Marquee (Faixa Contínua)</option>
            </optgroup>
            <optgroup label="3. Tech, Retrô e Digitais">
              <option value="typewriter" ${txt.anim === "typewriter" ? "selected" : ""}>11. Typewriter (Máquina)</option>
              <option value="glitch" ${txt.anim === "glitch" ? "selected" : ""}>12. Glitch (Falha RGB)</option>
              <option value="neon" ${txt.anim === "neon" ? "selected" : ""}>13. Neon Flicker (Luz Piscando)</option>
              <option value="scramble" ${txt.anim === "scramble" ? "selected" : ""}>14. Scramble / Decode</option>
              <option value="highlight" ${txt.anim === "highlight" ? "selected" : ""}>15. Highlight / Marca-Texto</option>
            </optgroup>
            <optgroup label="4. Orgânicas, Líquidas e 3D">
              <option value="liquid" ${txt.anim === "liquid" ? "selected" : ""}>16. Liquid Distortion</option>
              <option value="morph" ${txt.anim === "morph" ? "selected" : ""}>17. Morphing (Metamorfose)</option>
              <option value="handwritten" ${txt.anim === "handwritten" ? "selected" : ""}>18. Handwritten (Traço)</option>
              <option value="extrude3d" ${txt.anim === "extrude3d" ? "selected" : ""}>19. 3D Extrude & Inflate</option>
              <option value="particles" ${txt.anim === "particles" ? "selected" : ""}>20. Particle Dissolve</option>
            </optgroup>
          </select>
        </div>

        <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:#a1a1aa;">
          <span>Rot: <strong id="lbl_rot_${idx}">${txt.rotation}°</strong></span>
          <input type="range" id="txt_rot_${idx}" min="-180" max="180" value="${txt.rotation}" style="flex:1;">
          <select id="txt_spd_${idx}" style="width:72px; background:#09090b; color:#00ffcc; border:1px solid #3f3f46; border-radius:4px; padding:2px;" title="Velocidade da Animação">
            <option value="0.25" ${(txt.speed || 1) == 0.25 ? "selected" : ""}>0.25x</option>
            <option value="0.5" ${(txt.speed || 1) == 0.5 ? "selected" : ""}>0.5x</option>
            <option value="1" ${(txt.speed || 1) == 1 ? "selected" : ""}>1.0x</option>
            <option value="1.5" ${(txt.speed || 1) == 1.5 ? "selected" : ""}>1.5x</option>
            <option value="2" ${(txt.speed || 1) == 2 ? "selected" : ""}>2.0x</option>
            <option value="3" ${(txt.speed || 1) == 3 ? "selected" : ""}>3.0x</option>
          </select>
        </div>

        <div style="display:flex; gap:8px; font-size:11px; color:#e4e4e7; background:#27272a; padding:4px 6px; border-radius:4px;">
          <label style="cursor:pointer;"><input type="checkbox" id="txt_pal_${idx}" ${txt.applyPalette ? "checked" : ""}> Usar Paleta</label>
          <label style="cursor:pointer;"><input type="checkbox" id="txt_sty_${idx}" ${txt.applyStyle ? "checked" : ""}> Usar Estilo</label>
        </div>
      `;
      container.appendChild(card);

      const fontSel = document.getElementById(`txt_font_${idx}`);
      const updateFontOptions = () => {
        fontSel.innerHTML = "";
        state.customFonts.forEach(f => {
          const opt = document.createElement("option");
          opt.value = f.family;
          opt.textContent = f.name;
          if (f.family === txt.fontFamily) opt.selected = true;
          fontSel.appendChild(opt);
        });
      };
      updateFontOptions();
      txt.updateFontDropdown = updateFontOptions;

      const triggerRender = () => { if (videoEl.paused) { state.layersActive ? renderLayersFrame() : renderRetroFrame(); } };
      
      document.getElementById(`txt_act_${idx}`).addEventListener("change", e => { txt.active = e.target.checked; triggerRender(); });
      document.getElementById(`txt_val_${idx}`).addEventListener("input", e => { txt.content = e.target.value; triggerRender(); });
      fontSel.addEventListener("change", e => { txt.fontFamily = e.target.value; triggerRender(); });
      document.getElementById(`txt_size_${idx}`).addEventListener("input", e => { txt.size = parseInt(e.target.value, 10) || 20; triggerRender(); });
      document.getElementById(`txt_col_${idx}`).addEventListener("input", e => { txt.color = e.target.value; triggerRender(); });
      document.getElementById(`txt_strk_${idx}`).addEventListener("input", e => { txt.strokeColor = e.target.value; triggerRender(); });
      document.getElementById(`txt_pos_${idx}`).addEventListener("change", e => { txt.layerPos = e.target.value; triggerRender(); });
      document.getElementById(`txt_pal_${idx}`).addEventListener("change", e => { txt.applyPalette = e.target.checked; triggerRender(); });
      document.getElementById(`txt_sty_${idx}`).addEventListener("change", e => { txt.applyStyle = e.target.checked; triggerRender(); });

      document.getElementById(`txt_align_${idx}`).addEventListener("change", e => {
        txt.align = e.target.value;
        if (txt.align === "center") txt.x = Math.round(mainCanvas.width / 2);
        else if (txt.align === "right") txt.x = Math.round(mainCanvas.width - 20);
        else txt.x = 20;
        triggerRender();
      });
      document.getElementById(`txt_anim_${idx}`).addEventListener("change", e => { txt.anim = e.target.value; triggerRender(); });
      document.getElementById(`txt_rot_${idx}`).addEventListener("input", e => {
        txt.rotation = parseInt(e.target.value, 10) || 0;
        document.getElementById(`lbl_rot_${idx}`).textContent = `${txt.rotation}°`;
        triggerRender();
      });
      document.getElementById(`txt_spd_${idx}`).addEventListener("change", e => {
        txt.speed = parseFloat(e.target.value) || 1;
        triggerRender();
      });
    });
	

    const btnImportFont = document.getElementById("btnImportFont");
    const fontFileInput = document.getElementById("fontFileInput");
    if (btnImportFont && fontFileInput) {
      btnImportFont.addEventListener("click", () => fontFileInput.click());
      fontFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fontName = file.name.replace(/\.[^/.]+$/, "");
        const fontFamily = `CustomFont_${Date.now()}`;
        try {
          const buffer = await file.arrayBuffer();
          const fontFace = new FontFace(fontFamily, buffer);
          await fontFace.load();
          document.fonts.add(fontFace);
          state.customFonts.push({ name: fontName, family: fontFamily });
          state.texts.forEach(t => t.updateFontDropdown && t.updateFontDropdown());
          document.getElementById("loadedFontsList").textContent = `✅ Fonte "${fontName}" importada!`;
        } catch (err) {
          alert("Erro ao carregar fonte: " + err.message);
        }
        fontFileInput.value = "";
      });
    }
  }

    function initProjectSaveLoad() {
    const btnSave = document.getElementById("btnSaveProject");
    const btnLoad = document.getElementById("btnLoadProject");
    const fileProjInput = document.getElementById("projectFileInput");

    if (btnSave) {
      btnSave.addEventListener("click", () => {
        const projectData = {
          version: "2027.1",
          savedAt: new Date().toISOString(),
          globals: {
            bloco: state.bloco,
            paletteKey: state.paletteKey,
            estiloKey: state.estiloKey,
            grade: state.grade,
            contorno: state.contorno,
            contornoForca: state.contornoForca,
            brilho: state.brilho,
            contraste: state.contraste,
            chromaAtivo: state.chromaAtivo,
            chromaHex: state.chromaHex,
            chromaTol: state.chromaTol,
            customPalette: state.customPalette,
            useCustomPalette: state.useCustomPalette
          },
          texts: state.texts.map(({ updateFontDropdown, ...rest }) => rest),
          layersActive: state.layersActive,
          layers: state.layers
        };

        const name = (document.getElementById("fileName")?.value.trim() || "meu_projeto_pixel") + ".json";
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        statusBadge.textContent = `💾 Projeto "${name}" salvo!`;
      });
    }

    if (btnLoad && fileProjInput) {
      btnLoad.addEventListener("click", () => fileProjInput.click());
      fileProjInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          if (data.globals) {
            Object.assign(state, data.globals);
            document.getElementById("rangeBloco").value = state.bloco;
            document.getElementById("lblBloco").textContent = `${state.bloco} px`;
            selectPaleta.value = state.paletteKey;
            selectEstilo.value = state.estiloKey;
            document.getElementById("chkGrade").checked = state.grade;
            document.getElementById("chkContorno").checked = state.contorno;
            document.getElementById("rangeContornoForca").value = state.contornoForca;
            document.getElementById("lblContornoForca").textContent = state.contornoForca;
            document.getElementById("rangeBrilho").value = state.brilho;
            document.getElementById("lblBrilho").textContent = state.brilho;
            document.getElementById("rangeContraste").value = state.contraste;
            document.getElementById("lblContraste").textContent = state.contraste;
            document.getElementById("chkChroma").checked = state.chromaAtivo;
            document.getElementById("chromaColor").value = state.chromaHex;
            document.getElementById("rangeTol").value = state.chromaTol;
            document.getElementById("lblTol").textContent = state.chromaTol;
            atualizarPreviewPaleta();
          }

          if (Array.isArray(data.texts)) {
            state.texts = data.texts;
            initTextControls();
          }

          if (Array.isArray(data.layers) && data.layers.length > 0) {
            state.layers = data.layers;
            buildLayersUI();
          }

          state.layersActive = Boolean(data.layersActive);
          if (state.layersActive) renderLayersFrame();
          else renderRetroFrame();

          statusBadge.textContent = `✅ Projeto "${file.name}" carregado!`;
        } catch (err) {
          alert("Erro ao ler arquivo de projeto: " + err.message);
        }
        fileProjInput.value = "";
      });
    }
  }
  
  // Função que desenha um texto aplicando (ou não) Paleta e Estilo
  // Função que desenha um texto aplicando (ou não) Paleta, Estilo e as 20 Animações
  function drawSingleText(targetCtx, txt, w, h, scaleFactor = 1, customTime = null) {
    if (!txt.active || !txt.content) return;

    const rawTime = customTime !== null ? customTime : (state.mediaType === "video" ? videoEl.currentTime : state.synthTime);
    const t = rawTime * (txt.speed || 1);
    const anim = txt.anim || "none";
    const cycle = (t % 3.0) / 3.0;
    const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

    const scaledSize = Math.round(txt.size * scaleFactor);
    const scaledX = txt.x * scaleFactor;
    const scaledY = txt.y * scaleFactor;
    const rad = ((txt.rotation || 0) * Math.PI) / 180;

    const renderTransformedText = (ctxToDraw) => {
      ctxToDraw.save();
      ctxToDraw.translate(scaledX, scaledY);
      if (rad !== 0) ctxToDraw.rotate(rad);
      ctxToDraw.font = `bold ${scaledSize}px ${txt.fontFamily}`;
      ctxToDraw.textBaseline = "top";
      ctxToDraw.textAlign = txt.align || "left";

      const fullWidth = ctxToDraw.measureText(txt.content).width;
      const alignOffset = txt.align === "center" ? -fullWidth / 2 : txt.align === "right" ? -fullWidth : 0;

      const drawBaseText = (str, ox = 0, oy = 0, customFill = null, customStroke = null) => {
        if (txt.strokeWidth > 0) {
          ctxToDraw.strokeStyle = customStroke || txt.strokeColor;
          ctxToDraw.lineWidth = txt.strokeWidth * scaleFactor;
          ctxToDraw.lineJoin = "round";
          ctxToDraw.strokeText(str, ox, oy);
        }
        ctxToDraw.fillStyle = customFill || txt.color;
        ctxToDraw.fillText(str, ox, oy);
      };

      const drawPerChar = (fn) => {
        ctxToDraw.textAlign = "left";
        let curX = alignOffset;
        for (let i = 0; i < txt.content.length; i++) {
          const ch = txt.content[i];
          const cw = ctxToDraw.measureText(ch).width;
          ctxToDraw.save();
          fn(ch, curX, cw, i);
          ctxToDraw.restore();
          curX += cw;
        }
      };

      switch (anim) {
        case "fade": {
          ctxToDraw.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2.5);
          drawBaseText(txt.content);
          break;
        }
        case "slide": {
          const p = easeOut(Math.min(1, cycle * 2.2));
          ctxToDraw.beginPath();
          ctxToDraw.rect(alignOffset - 10, -4, fullWidth + 20, scaledSize * 1.25);
          ctxToDraw.clip();
          drawBaseText(txt.content, 0, (1 - p) * scaledSize * 1.2);
          break;
        }
        case "bounce": {
          const p = Math.min(1, cycle * 2.0);
          const c4 = (2 * Math.PI) / 3;
          const elastic = p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
          drawBaseText(txt.content, 0, (1 - elastic) * -45 * scaleFactor);
          break;
        }
        case "blur": {
          const p = easeOut(Math.min(1, cycle * 2.0));
          const spacing = (1 - p) * 18 * scaleFactor;
          ctxToDraw.globalAlpha = p;
          if ("filter" in ctxToDraw) ctxToDraw.filter = `blur(${((1 - p) * 6).toFixed(1)}px)`;
          drawPerChar((ch, cx, cw, i) => {
            const centerShift = (i - txt.content.length / 2) * spacing;
            drawBaseText(ch, cx + centerShift, 0);
          });
          break;
        }
        case "pop": {
          const beat = (t * 2.2) % 1;
          const sc = beat < 0.2 ? 0.6 + (beat / 0.2) * 0.55 : 1.15 - ((beat - 0.2) / 0.8) * 0.15;
          ctxToDraw.translate(alignOffset + fullWidth / 2, scaledSize * 0.5);
          ctxToDraw.scale(sc, sc);
          ctxToDraw.translate(-(alignOffset + fullWidth / 2), -scaledSize * 0.5);
          drawBaseText(txt.content);
          break;
        }
        case "kinetic": {
          const step = Math.floor(t * 4) % 4;
          const angles = [0, -0.14, 0.12, 0];
          const scales = [1.18, 0.92, 1.12, 1.0];
          ctxToDraw.translate(alignOffset + fullWidth / 2, scaledSize * 0.5);
          ctxToDraw.rotate(angles[step]);
          ctxToDraw.scale(scales[step], scales[step]);
          ctxToDraw.translate(-(alignOffset + fullWidth / 2), -scaledSize * 0.5);
          drawBaseText(txt.content);
          break;
        }
        case "wave": {
          drawPerChar((ch, cx, cw, i) => {
            const wy = Math.sin(t * 6 + i * 0.6) * 8 * scaleFactor;
            drawBaseText(ch, cx, wy);
          });
          break;
        }
        case "slice": {
          const p = easeOut(Math.min(1, cycle * 2.2));
          const offset = (1 - p) * 35 * scaleFactor;
          const halfH = scaledSize * 0.58;
          ctxToDraw.save();
          ctxToDraw.beginPath();
          ctxToDraw.rect(alignOffset - 100, -10, fullWidth + 200, halfH + 10);
          ctxToDraw.clip();
          drawBaseText(txt.content, -offset, 0);
          ctxToDraw.restore();

          ctxToDraw.save();
          ctxToDraw.beginPath();
          ctxToDraw.rect(alignOffset - 100, halfH, fullWidth + 200, scaledSize);
          ctxToDraw.clip();
          drawBaseText(txt.content, offset, 0);
          ctxToDraw.restore();
          break;
        }
        case "flip3d": {
          drawPerChar((ch, cx, cw, i) => {
            const phase = Math.max(0, Math.min(1, cycle * 2.5 - i * 0.08));
            const scaleY = Math.cos((1 - phase) * (Math.PI / 2));
            ctxToDraw.translate(cx, scaledSize * 0.55);
            ctxToDraw.scale(1, Math.max(0.05, scaleY));
            drawBaseText(ch, 0, -scaledSize * 0.55);
          });
          break;
        }
        case "marquee": {
          const span = fullWidth + 60 * scaleFactor;
          const shift = -((t * 90 * scaleFactor) % span);
          drawBaseText(txt.content, shift, 0);
          drawBaseText(txt.content, shift + span, 0);
          break;
        }
        case "typewriter": {
          const total = txt.content.length;
          const chars = Math.min(total, Math.floor((t * 9) % (total + 6)));
          const cursor = Math.floor(t * 4) % 2 === 0 ? "_" : "";
          drawBaseText(txt.content.slice(0, chars) + cursor);
          break;
        }
        case "glitch": {
          const activeGlitch = Math.sin(t * 17) > 0.45 || Math.cos(t * 29) > 0.75;
          if (activeGlitch) {
            const gx = (Math.sin(t * 91) * 6) * scaleFactor;
            const gy = (Math.cos(t * 73) * 2) * scaleFactor;
            ctxToDraw.globalCompositeOperation = "screen";
            drawBaseText(txt.content, gx, gy, "#ff0044", "transparent");
            drawBaseText(txt.content, -gx, -gy, "#00ffff", "transparent");
            ctxToDraw.globalCompositeOperation = "source-over";
          }
          drawBaseText(txt.content, activeGlitch ? Math.sin(t * 50) * 2 : 0, 0);
          break;
        }
        case "neon": {
          const flicker = Math.sin(t * 37) * Math.cos(t * 53) > -0.65;
          ctxToDraw.shadowColor = txt.color;
          ctxToDraw.shadowBlur = flicker ? 18 * scaleFactor : 2;
          ctxToDraw.globalAlpha = flicker ? 1 : 0.35;
          drawBaseText(txt.content);
          if (flicker) drawBaseText(txt.content, 0, 0, "#ffffff", "transparent");
          break;
        }
        case "scramble": {
          const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
          const reveal = Math.floor(easeOut(Math.min(1, cycle * 1.8)) * txt.content.length);
          let out = "";
          for (let i = 0; i < txt.content.length; i++) {
            if (txt.content[i] === " " || i < reveal) out += txt.content[i];
            else out += glyphs[Math.floor((t * 25 + i * 7) % glyphs.length)];
          }
          drawBaseText(out);
          break;
        }
        case "highlight": {
          const p = easeOut(Math.min(1, cycle * 2.2));
          ctxToDraw.fillStyle = txt.strokeColor === "#000000" ? "#ff0055" : txt.strokeColor;
          ctxToDraw.fillRect(alignOffset - 4, scaledSize * 0.1, (fullWidth + 8) * p, scaledSize * 0.95);
          drawBaseText(txt.content);
          break;
        }
        case "liquid": {
          const slices = 12;
          const sliceH = (scaledSize * 1.25) / slices;
          for (let s = 0; s < slices; s++) {
            ctxToDraw.save();
            ctxToDraw.beginPath();
            ctxToDraw.rect(alignOffset - 30, s * sliceH, fullWidth + 60, sliceH + 0.5);
            ctxToDraw.clip();
            const waveX = Math.sin(t * 5 + s * 0.7) * 5 * scaleFactor;
            drawBaseText(txt.content, waveX, 0);
            ctxToDraw.restore();
          }
          break;
        }
        case "morph": {
          const m = Math.sin(t * 3);
          const sx = 1 + m * 0.22;
          const sy = 1 - m * 0.18;
          ctxToDraw.translate(alignOffset + fullWidth / 2, scaledSize * 0.55);
          ctxToDraw.transform(sx, m * 0.15, -m * 0.15, sy, 0, 0);
          ctxToDraw.translate(-(alignOffset + fullWidth / 2), -scaledSize * 0.55);
          drawBaseText(txt.content);
          break;
        }
        case "handwritten": {
          const p = easeOut(Math.min(1, cycle * 1.6));
          ctxToDraw.save();
          ctxToDraw.beginPath();
          ctxToDraw.rect(alignOffset - 6, -6, (fullWidth + 12) * p, scaledSize * 1.35);
          ctxToDraw.clip();
          ctxToDraw.strokeStyle = txt.color;
          ctxToDraw.lineWidth = Math.max(1.5, 2 * scaleFactor);
          ctxToDraw.strokeText(txt.content, 0, 0);
          if (p > 0.65) {
            ctxToDraw.globalAlpha = (p - 0.65) / 0.35;
            drawBaseText(txt.content);
          }
          ctxToDraw.restore();
          break;
        }
        case "extrude3d": {
          const depth = Math.round(6 * scaleFactor);
          const floatY = Math.sin(t * 3.5) * 5 * scaleFactor;
          for (let d = depth; d >= 1; d--) {
            ctxToDraw.fillStyle = d === depth ? "#000000" : txt.strokeColor;
            ctxToDraw.fillText(txt.content, d, d + floatY);
          }
          drawBaseText(txt.content, 0, floatY);
          break;
        }
        case "particles": {
          const p = Math.max(0, (cycle - 0.35) / 0.65);
          if (p <= 0) {
            drawBaseText(txt.content);
          } else {
            ctxToDraw.globalAlpha = Math.max(0, 1 - p * 1.3);
            drawBaseText(txt.content, 0, -p * 10 * scaleFactor);
            ctxToDraw.globalAlpha = Math.max(0, 1 - p);
            const count = 28;
            for (let k = 0; k < count; k++) {
              const seed = k * 19.37;
              const px = alignOffset + ((k / count) * fullWidth) + Math.sin(seed) * p * 35 * scaleFactor;
              const py = (scaledSize * 0.5) + (Math.cos(seed) - 0.6) * p * 45 * scaleFactor;
              const sz = Math.max(2, (1 - p) * 4 * scaleFactor);
              ctxToDraw.fillStyle = k % 2 === 0 ? txt.color : txt.strokeColor;
              ctxToDraw.fillRect(px, py, sz, sz);
            }
          }
          break;
        }
        default: {
          drawBaseText(txt.content);
          break;
        }
      }

      if (ctxToDraw === targetCtx && state.texts[state.draggingTextIndex] === txt) {
        const boxX = txt.align === "center" ? -fullWidth / 2 : txt.align === "right" ? -fullWidth : 0;
        ctxToDraw.strokeStyle = "#00ffcc";
        ctxToDraw.lineWidth = 1.5 * scaleFactor;
        ctxToDraw.setLineDash([4, 4]);
        ctxToDraw.strokeRect(boxX - 4, -4, fullWidth + 8, scaledSize * 1.2 + 8);
      }
      ctxToDraw.restore();
    };

    if (!txt.applyStyle && !txt.applyPalette) {
      renderTransformedText(targetCtx);
      return;
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = w; tmpCanvas.height = h;
    renderTransformedText(tmpCanvas.getContext("2d", { willReadFrequently: true }));

    const outCanvas = document.createElement("canvas");
    outCanvas.width = w; outCanvas.height = h;
    const outCtx = outCanvas.getContext("2d");

    const opts = {
      ...getGlobalOptions(),
      bloco: txt.applyStyle ? Math.max(1, Math.round(state.bloco * scaleFactor)) : 1,
      estilo: txt.applyStyle ? state.estiloKey : "pixel_art",
      rgbPaleta: txt.applyPalette ? getActiveRgbPalette() : null,
      chromaAtivo: false,
      grade: false,
      contorno: false
    };

    const imgData = tmpCanvas.getContext("2d").getImageData(0, 0, w, h).data;
    window.EstiloRenderer.renderizar(outCtx, imgData, w, h, opts);
    targetCtx.drawImage(outCanvas, 0, 0);
  }

  // RENDERIZAÇÃO RETRÔ
  function renderRetroFrame() {
    if (state.layersActive) return;
    const w = mainCanvas.width, h = mainCanvas.height;

    if (state.mediaType === "image" && state.currentImg) {
      offCtx.clearRect(0,0,w,h); offCtx.drawImage(state.currentImg,0,0,w,h);
    } else if (state.mediaType === "video") {
      if (videoEl.readyState >= 2) { offCtx.clearRect(0,0,w,h); offCtx.drawImage(videoEl,0,0,w,h); }
      if (!isNaN(videoEl.duration) && videoEl.duration > 0) {
        document.getElementById("videoSeek").value = (videoEl.currentTime/videoEl.duration)*100;
        document.getElementById("videoTime").textContent = `${videoEl.currentTime.toFixed(1)}s / ${videoEl.duration.toFixed(1)}s`;
      }
    } else if (state.mediaType === "synth") {
      desenharAnimacaoTeste(offCtx, w, h, state.synthTime);
      document.getElementById("videoTime").textContent = `${(state.synthTime%25).toFixed(1)}s / 25.0s`;
      document.getElementById("videoSeek").value = ((state.synthTime%25)/25)*100;
    } else return;

    const imgData = offCtx.getImageData(0, 0, w, h).data;
    const opts = getGlobalOptions();

    ctx.clearRect(0, 0, w, h);

    // 1. Desenha os textos configurados para ficarem ATRÁS da imagem/vídeo
    state.texts
      .filter((t) => t.layerPos === "back")
      .forEach((t) => drawSingleText(ctx, t, w, h, 1));

    // 2. Renderiza a mídia pixelizada em um canvas auxiliar para manter o fundo transparente (Chroma Key)
    const layerCanvas = document.createElement("canvas");
    layerCanvas.width = w;
    layerCanvas.height = h;
    window.EstiloRenderer.renderizar(
      layerCanvas.getContext("2d"),
      imgData,
      w,
      h,
      opts
    );
    ctx.drawImage(layerCanvas, 0, 0);

    // 3. Desenha os textos configurados para ficarem NA FRENTE da imagem/vídeo
    state.texts
      .filter((t) => t.layerPos === "front")
      .forEach((t) => drawSingleText(ctx, t, w, h, 1));
  }

  function renderRetroFrameFullRes() {
    let W = (state.mediaType === "image" && state.currentImg) ? (state.currentImg.naturalWidth || state.currentImg.width) : (videoEl.videoWidth || mainCanvas.width);
    let H = (state.mediaType === "image" && state.currentImg) ? (state.currentImg.naturalHeight || state.currentImg.height) : (videoEl.videoHeight || mainCanvas.height);

    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = W; fullCanvas.height = H;
    const fullCtx = fullCanvas.getContext("2d", { willReadFrequently: true });
    const fullOffCanvas = document.createElement("canvas");
    fullOffCanvas.width = W; fullOffCanvas.height = H;
    const fullOffCtx = fullOffCanvas.getContext("2d", { willReadFrequently: true });

    if (state.mediaType === "image" && state.currentImg) {
      fullOffCtx.clearRect(0, 0, W, H); fullOffCtx.drawImage(state.currentImg, 0, 0, W, H);
    } else if (state.mediaType === "video") {
      fullOffCtx.clearRect(0, 0, W, H); fullOffCtx.drawImage(videoEl, 0, 0, W, H);
    } else if (state.mediaType === "synth") {
      desenharAnimacaoTeste(fullOffCtx, W, H, state.synthTime);
    }

    const scaleFactor = W / mainCanvas.width;
    const imgData = fullOffCtx.getImageData(0, 0, W, H).data;

    fullCtx.clearRect(0, 0, W, H);

    // 1. Desenha os textos configurados para ficarem ATRÁS em alta resolução
    state.texts
      .filter((t) => t.layerPos === "back")
      .forEach((t) => drawSingleText(fullCtx, t, W, H, scaleFactor));

    // 2. Renderiza a mídia pixelizada em um canvas auxiliar para manter transparência (Chroma Key)
    const layerCanvas = document.createElement("canvas");
    layerCanvas.width = W;
    layerCanvas.height = H;
    window.EstiloRenderer.renderizar(
      layerCanvas.getContext("2d"),
      imgData,
      W,
      H,
      getGlobalOptions()
    );
    fullCtx.drawImage(layerCanvas, 0, 0);

    // 3. Desenha os textos configurados para ficarem NA FRENTE em alta resolução
    state.texts
      .filter((t) => t.layerPos === "front")
      .forEach((t) => drawSingleText(fullCtx, t, W, H, scaleFactor));

    return fullCanvas;
  }

  function desenharAnimacaoTeste(c, w, h, t) {
    c.fillStyle = "#00ff00"; c.fillRect(0,0,w,h);
    const cx = w/2 + Math.cos(t*2)*(w*0.25);
    const cy = h/2 + Math.sin(t*3)*(h*0.2);
    const grad = c.createRadialGradient(cx-15,cy-15,5,cx,cy,60);
    grad.addColorStop(0,"#ffffff"); grad.addColorStop(0.4,"#ff0055"); grad.addColorStop(1,"#330022");
    c.fillStyle = grad; c.beginPath(); c.arc(cx,cy,55,0,Math.PI*2); c.fill();
    c.fillStyle = "#00ccff"; c.fillRect((t*120)%w, h-50, 70, 30);
  }

  function startRetroLoop() {
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
    let lastTime = performance.now();
    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (state.layersActive) return;

      const hasAnimatedText = state.texts.some(t => t.active && t.anim && t.anim !== "none");

      if (state.mediaType === "video") {
        if (!videoEl.paused && !videoEl.ended) renderRetroFrame();
        else if (hasAnimatedText) { state.synthTime += dt; renderRetroFrame(); }
      } else if (state.mediaType === "synth" && state.isPlaying) {
        state.synthTime += dt;
        renderRetroFrame();
      } else if (state.mediaType === "image" && hasAnimatedText) {
        state.synthTime += dt;
        renderRetroFrame();
      }

      state.animFrameId = requestAnimationFrame(loop);
    }
    state.animFrameId = requestAnimationFrame(loop);
  }

  function pararVideoAnterior() {
    if (state.animFrameId) { cancelAnimationFrame(state.animFrameId); state.animFrameId = null; }
    if (state.layersAnimFrameId) { cancelAnimationFrame(state.layersAnimFrameId); state.layersAnimFrameId = null; }
    videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load();
  }

  // CAMADAS
  const LAYER_DEFINITIONS = [
    { id: "hair", name: "1. Cabelo", defaultColor: "#3b2314", defaultPalette: "hair_anime", defaultStyle: "bayer4" },
    { id: "hair2", name: "2. Cabelo Secundário", defaultColor: "#9a3412", defaultPalette: "hair_anime", defaultStyle: "bayer2" },
    { id: "skin", name: "3. Pele / Rosto", defaultColor: "#f2b894", defaultPalette: "skin_tones", defaultStyle: "flat" },
    { id: "skin_shadow", name: "4. Sombra da Pele", defaultColor: "#c97b5d", defaultPalette: "skin_tones", defaultStyle: "flat" },
    { id: "eyes", name: "5. Olhos / Íris", defaultColor: "#10b981", defaultPalette: "cyberpunk", defaultStyle: "flat" },
    { id: "eyebrows", name: "6. Sobrancelhas", defaultColor: "#3b2314", defaultPalette: "hair_anime", defaultStyle: "flat" },
    { id: "mouth", name: "7. Boca / Lábios", defaultColor: "#b91c1c", defaultPalette: "sweetie16", defaultStyle: "flat" },
    { id: "top", name: "8. Roupa Superior", defaultColor: "#2563eb", defaultPalette: "pico8", defaultStyle: "bayer2" },
    { id: "top_detail", name: "9. Detalhe da Roupa", defaultColor: "#1e3a8a", defaultPalette: "cyberpunk", defaultStyle: "bevel" },
    { id: "bottom", name: "10. Roupa Inferior", defaultColor: "#1e293b", defaultPalette: "endesga32", defaultStyle: "checker" },
    { id: "belt", name: "11. Cinto / Faixa", defaultColor: "#eab308", defaultPalette: "gold_metal", defaultStyle: "bevel" },
    { id: "shoes", name: "12. Sapatos", defaultColor: "#dc2626", defaultPalette: "sweetie16", defaultStyle: "bevel" },
    { id: "gloves", name: "13. Luvas", defaultColor: "#4b5563", defaultPalette: "armor_steel", defaultStyle: "flat" },
    { id: "armor", name: "14. Armadura", defaultColor: "#6b7280", defaultPalette: "armor_steel", defaultStyle: "bevel" },
    { id: "cape", name: "15. Capa / Manto", defaultColor: "#7e22ce", defaultPalette: "cyberpunk", defaultStyle: "bayer4" },
    { id: "accessory", name: "16. Acessório", defaultColor: "#a855f7", defaultPalette: "gold_metal", defaultStyle: "bayer4" },
    { id: "weapon", name: "17. Arma", defaultColor: "#94a3b8", defaultPalette: "armor_steel", defaultStyle: "diagonal" },
    { id: "aura", name: "18. Aura / Magia", defaultColor: "#22d3ee", defaultPalette: "ice_frost", defaultStyle: "bayer8" },
    { id: "background", name: "19. Fundo", defaultColor: "#1e293b", defaultPalette: "none", defaultStyle: "flat" },
    { id: "extra", name: "20. Extra / Outro", defaultColor: "#f472b6", defaultPalette: "pastel_dream", defaultStyle: "bayer4" }
  ];

  const SLOTS_PER_LAYER = 8;

  function initLayers() {
    state.layers = LAYER_DEFINITIONS.map((def, idx) => {
      const colors = [];
      for (let i = 0; i < SLOTS_PER_LAYER; i++) {
        colors.push({ active: i === 0, hex: i === 0 ? def.defaultColor : "#888888" });
      }
      return { ...def, enabled: idx < 6, colors, tolerance: 45, palette: def.defaultPalette, style: def.defaultStyle };
    });
    buildLayersUI();
  }

  function buildLayersUI() {
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
          <input type="checkbox" id="layer_en_${layerIdx}" ${layer.enabled ? "checked" : ""}> ${layer.name}
        </label>
        <span style="font-size:11px; color:#a1a1aa;">Tol: <strong id="lbl_tol_${layerIdx}">${layer.tolerance}</strong></span>
      `;
      card.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "swatches-grid";
      layer.colors.forEach((slot, slotIdx) => {
        const box = document.createElement("div");
        box.className = "swatch-slot" + (slot.active ? "" : " disabled-slot");
        box.id = `slot_box_${layerIdx}_${slotIdx}`;
        box.innerHTML = `
          <div class="swatch-top" style="justify-content:space-between; gap:2px; width:100%;">
            <input type="checkbox" id="slot_chk_${layerIdx}_${slotIdx}" ${slot.active ? "checked" : ""} style="width:14px;height:14px;">
            <input type="color" id="slot_col_${layerIdx}_${slotIdx}" value="${slot.hex}" style="width:22px;height:20px;">
            <button class="btn-clear-slot" id="slot_clr_${layerIdx}_${slotIdx}" style="padding:2px 4px;">×</button>
          </div>
          <button class="btn-drop" id="slot_drop_${layerIdx}_${slotIdx}" title="Conta-gotas #${slotIdx + 1}">💧${slotIdx + 1}</button>
        `;
        grid.appendChild(box);
      });
      card.appendChild(grid);

      const controls = document.createElement("div");
      controls.style.cssText = "display:flex;flex-direction:column;gap:5px;";
      controls.innerHTML = `
        <input type="range" id="layer_tol_${layerIdx}" min="5" max="140" value="${layer.tolerance}">
        <div class="row">
          <select id="layer_pal_${layerIdx}"></select>
          <select id="layer_sty_${layerIdx}"></select>
        </div>
        <div class="row" style="font-size:10px; color:#a1a1aa; justify-content:space-between;">
          <span>Pixels: <strong id="layer_count_${layerIdx}">0</strong></span>
          <span>Cor: <span id="layer_prev_${layerIdx}" style="display:inline-block;width:14px;height:14px;background:${layer.colors[0].hex};border-radius:3px;border:1px solid #000;"></span></span>
        </div>
      `;
      card.appendChild(controls);
      container.appendChild(card);

      populatePaletaSelect(document.getElementById(`layer_pal_${layerIdx}`), layer.palette);
      populateEstiloSelect(document.getElementById(`layer_sty_${layerIdx}`), layer.style);

      // CORREÇÃO CRÍTICA: Se o vídeo estiver rodando, ele renderiza no próximo frame sem pausar
      document.getElementById(`layer_en_${layerIdx}`).addEventListener("change", (e) => { 
        layer.enabled = e.target.checked; 
        state.layersActive = true; 
        if (!videoEl.paused) return; // Se o vídeo já está rodando, a loop do vídeo atualiza sozinha
        renderLayersFrame(); 
      });
      document.getElementById(`layer_tol_${layerIdx}`).addEventListener("input", (e) => { 
        layer.tolerance = parseInt(e.target.value, 10); 
        document.getElementById(`lbl_tol_${layerIdx}`).textContent = layer.tolerance; 
        state.layersActive = true; 
        if (!videoEl.paused) return;
        renderLayersFrame(); 
      });
      document.getElementById(`layer_pal_${layerIdx}`).addEventListener("change", (e) => { 
        layer.palette = e.target.value; 
        state.layersActive = true; 
        if (!videoEl.paused) return;
        renderLayersFrame(); 
      });
      document.getElementById(`layer_sty_${layerIdx}`).addEventListener("change", (e) => { 
        layer.style = e.target.value; 
        state.layersActive = true; 
        if (!videoEl.paused) return;
        renderLayersFrame(); 
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
          if (slot.active) { layer.enabled = true; document.getElementById(`layer_en_${layerIdx}`).checked = true; }
          state.layersActive = true; 
          if (!videoEl.paused) return;
          renderLayersFrame();
        });
        colEl.addEventListener("input", (e) => {
          slot.hex = e.target.value; slot.active = true; chkEl.checked = true;
          boxEl.classList.remove("disabled-slot");
          layer.enabled = true; document.getElementById(`layer_en_${layerIdx}`).checked = true;
          if (slotIdx === 0) card.style.borderLeftColor = slot.hex;
          const prev = document.getElementById(`layer_prev_${layerIdx}`);
          if (prev) prev.style.background = slot.hex;
          state.layersActive = true;
          if (!videoEl.paused) return;
          renderLayersFrame();
        });
        clrEl.addEventListener("click", () => { 
          slot.active = false; chkEl.checked = false; boxEl.classList.add("disabled-slot"); 
          state.layersActive = true; 
          if (!videoEl.paused) return;
          renderLayersFrame(); 
        });
        dropEl.addEventListener("click", () => {
          const isSame = state.activeEyedropper && state.activeEyedropper.layerIndex === layerIdx && state.activeEyedropper.slotIndex === slotIdx;
          clearEyedropperState();
          if (!isSame) {
            state.activeEyedropper = { layerIndex: layerIdx, slotIndex: slotIdx };
            dropEl.classList.add("eyedropper-active");
            mainCanvas.classList.add("picking");
            statusBadge.textContent = `💧 Clique no personagem: ${layer.name} (#${slotIdx + 1})`;
            state.layersActive = true;
            renderLayersFrame(); // Força um frame estático só pra garantir
          }
        });
      });
    });
  }

  function clearEyedropperState() {
    state.activeEyedropper = null;
    document.querySelectorAll("#layersContainer .btn-drop").forEach(b => b.classList.remove("eyedropper-active"));
    mainCanvas.classList.remove("picking");
  }

  function drawDemoCharacter(c, w, h) {
    c.fillStyle = "#1e293b"; c.fillRect(0,0,w,h);
    c.fillStyle = "#3b2314"; c.fillRect(105,40,110,75);
    c.fillStyle = "#9a3412"; c.fillRect(175,45,35,65);
    c.fillStyle = "#f2b894"; c.fillRect(118,70,84,72);
    c.fillStyle = "#c97b5d"; c.fillRect(118,130,84,12);
    c.fillStyle = "#10b981"; c.fillRect(134,96,12,14); c.fillRect(174,96,12,14);
    c.fillStyle = "#064e3b"; c.fillRect(138,100,4,6); c.fillRect(178,100,4,6);
    c.fillStyle = "#2563eb"; c.fillRect(96,146,128,74);
    c.fillStyle = "#1e3a8a"; c.fillRect(96,146,128,8);
    c.fillStyle = "#eab308"; c.fillRect(96,212,128,12);
    c.fillStyle = "#1e293b"; c.fillRect(108,224,44,58); c.fillRect(168,224,44,58);
    c.fillStyle = "#dc2626"; c.fillRect(102,282,52,20); c.fillRect(166,282,52,20);
    c.fillStyle = "#7f1d1d"; c.fillRect(102,298,52,4); c.fillRect(166,298,52,4);
  }

  function renderLayersFrame() {
    const px = state.bloco;
    let srcW = 480, srcH = 320;
    if (state.mediaType === "image" && state.currentImg) { srcW = state.currentImg.naturalWidth; srcH = state.currentImg.naturalHeight; }
    else if (state.mediaType === "video" && videoEl.videoWidth > 0) { srcW = videoEl.videoWidth; srcH = videoEl.videoHeight; }

    const maxDim = 640;
    if (srcW > maxDim || srcH > maxDim) {
      const r = Math.min(maxDim/srcW, maxDim/srcH);
      srcW = Math.round(srcW*r); srcH = Math.round(srcH*r);
    }

    mainCanvas.width = srcW; mainCanvas.height = srcH;
    offCanvas.width = srcW; offCanvas.height = srcH;
    
    if (state.mediaType === "demo" || state.mediaType === "none") { drawDemoCharacter(offCtx, srcW, srcH); }
    else if (state.mediaType === "image" && state.currentImg) { offCtx.clearRect(0,0,srcW,srcH); offCtx.drawImage(state.currentImg,0,0,srcW,srcH); }
    else if (state.mediaType === "video") { offCtx.clearRect(0,0,srcW,srcH); offCtx.drawImage(videoEl,0,0,srcW,srcH); }

    const data = offCtx.getImageData(0, 0, srcW, srcH).data;
    const cols = Math.ceil(srcW / px), rows = Math.ceil(srcH / px);

    const activeLayers = state.layers.map((l, idx) => ({ ...l, idx })).filter(l => l.enabled).map(l => ({
      ...l, targets: l.colors.filter(c => c.active).map(c => window.PaletaHelper.parseHex(c.hex)), rgbPal: getPaletaRgb(l.palette)
    })).filter(l => l.targets.length > 0);

    const globalRgbPal = getActiveRgbPalette();
    const layerCounts = new Array(state.layers.length).fill(0);

    ctx.clearRect(0, 0, srcW, srcH);
    ctx.imageSmoothingEnabled = false;

    for (let by = 0; by < rows; by++) {
      for (let bx = 0; bx < cols; bx++) {
        const startX = bx * px, startY = by * px;
        const bw = Math.min(px, srcW - startX), bh = Math.min(px, srcH - startY);
        const sampleX = Math.min(srcW - 1, startX + Math.floor(px / 2));
        const sampleY = Math.min(srcH - 1, startY + Math.floor(px / 2));
        const idx = (sampleY * srcW + sampleX) * 4;
        
        let r = 0, g = 0, b = 0, count = 0;
        for (let y = startY; y < startY + bh; y++) {
          for (let x = startX; x < startX + bw; x++) {
            const i = (y * srcW + x) * 4;
            r += data[i]; g += data[i+1]; b += data[i+2]; count++;
          }
        }
        r /= count; g /= count; b /= count;
        const a = data[idx+3];
        if (a < 20) continue;

        let matchedLayer = null, bestDist = Infinity;
        for (let i = 0; i < activeLayers.length; i++) {
          const layer = activeLayers[i];
          for (let t = 0; t < layer.targets.length; t++) {
            const tg = layer.targets[t];
            const dr = r - tg[0], dg = g - tg[1], db = b - tg[2];
            const dist = Math.sqrt(dr*dr*0.3 + dg*dg*0.59 + db*db*0.11);
            if (dist <= layer.tolerance && dist < bestDist) { bestDist = dist; matchedLayer = layer; }
          }
        }
        if (matchedLayer) layerCounts[matchedLayer.idx]++;

        const targetStyle = matchedLayer ? matchedLayer.style : state.estiloKey;
        const targetPalette = matchedLayer ? matchedLayer.rgbPal : globalRgbPal;

        let finalRgb = [r, g, b];
        if (targetPalette && targetPalette.length > 0) finalRgb = window.PaletaHelper.corMaisProxima(r, g, b, targetPalette);

        if (state.contorno && bx > 0 && by > 0) {
          const leftIdx = (sampleY * srcW + Math.max(0, sampleX - px)) * 4;
          const diff = Math.abs(r - data[leftIdx]) + Math.abs(g - data[leftIdx+1]) + Math.abs(b - data[leftIdx+2]);
          if (diff > (255 - state.contornoForca)) {
            ctx.fillStyle = "#08080a"; ctx.fillRect(startX, startY, bw, bh); continue;
          }
        }

        window.EstiloRenderer.desenharBloco(ctx, targetStyle, startX, startY, bw, bh, finalRgb, bx, by, px);

        if (state.showDebug && matchedLayer) {
          ctx.strokeStyle = matchedLayer.colors[0].hex;
          ctx.lineWidth = 1;
          ctx.strokeRect(startX + 0.5, startY + 0.5, bw - 1, bh - 1);
        }
      }
    }

    // 1. Guarda o desenho das 20 camadas em um canvas temporário
    const layersSnapshot = document.createElement("canvas");
    layersSnapshot.width = srcW;
    layersSnapshot.height = srcH;
    layersSnapshot.getContext("2d").drawImage(mainCanvas, 0, 0);

    // 2. Limpa a tela e desenha na ordem certa: Texto Atrás -> Camadas -> Texto na Frente
    ctx.clearRect(0, 0, srcW, srcH);

    state.texts
      .filter((t) => t.layerPos === "back")
      .forEach((t) => drawSingleText(ctx, t, srcW, srcH, 1));

    ctx.drawImage(layersSnapshot, 0, 0);

    state.texts
      .filter((t) => t.layerPos === "front")
      .forEach((t) => drawSingleText(ctx, t, srcW, srcH, 1));

    state.layers.forEach((_, i) => {
      const el = document.getElementById(`layer_count_${i}`);
      if (el) el.textContent = layerCounts[i];
    });

    if (!state.layersAnimFrameId) startLayersVideoLoop();
  }

  function renderLayersFrameFullRes() {
    let W = (state.mediaType === "image" && state.currentImg) ? state.currentImg.naturalWidth : (videoEl.videoWidth || mainCanvas.width);
    let H = (state.mediaType === "image" && state.currentImg) ? state.currentImg.naturalHeight : (videoEl.videoHeight || mainCanvas.height);

    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = W; fullCanvas.height = H;
    const fullCtx = fullCanvas.getContext("2d", { willReadFrequently: true });
    const fullOffCanvas = document.createElement("canvas");
    fullOffCanvas.width = W; fullOffCanvas.height = H;
    const fullOffCtx = fullOffCanvas.getContext("2d", { willReadFrequently: true });

    if (state.mediaType === "demo" || state.mediaType === "none") {
      fullOffCtx.save(); const scale = Math.min(W / 320, H / 320);
      fullOffCtx.translate((W - 320 * scale) / 2, (H - 320 * scale) / 2);
      fullOffCtx.scale(scale, scale); drawDemoCharacter(fullOffCtx, 320, 320); fullOffCtx.restore();
    } else if (state.mediaType === "image" && state.currentImg) {
      fullOffCtx.clearRect(0, 0, W, H); fullOffCtx.drawImage(state.currentImg, 0, 0, W, H);
    } else if (state.mediaType === "video") {
      fullOffCtx.clearRect(0, 0, W, H); fullOffCtx.drawImage(videoEl, 0, 0, W, H);
    }

    const data = fullOffCtx.getImageData(0, 0, W, H).data;
    const px = state.bloco;
    const cols = Math.ceil(W / px), rows = Math.ceil(H / px);

    const activeLayers = state.layers.map((l, idx) => ({ ...l, idx })).filter(l => l.enabled).map(l => ({
      ...l, targets: l.colors.filter(c => c.active).map(c => window.PaletaHelper.parseHex(c.hex)), rgbPal: getPaletaRgb(l.palette)
    })).filter(l => l.targets.length > 0);
    const globalRgbPal = getActiveRgbPalette();

    fullCtx.clearRect(0, 0, W, H);
    fullCtx.imageSmoothingEnabled = false;

    for (let by = 0; by < rows; by++) {
      for (let bx = 0; bx < cols; bx++) {
        const startX = bx * px, startY = by * px;
        const bw = Math.min(px, W - startX), bh = Math.min(px, H - startY);
        const sampleX = Math.min(W - 1, startX + Math.floor(px / 2));
        const sampleY = Math.min(H - 1, startY + Math.floor(px / 2));
        const idx = (sampleY * W + sampleX) * 4;

        let r = 0, g = 0, b = 0, count = 0;
        for (let y = startY; y < startY + bh; y++) {
          for (let x = startX; x < startX + bw; x++) {
            const i = (y * W + x) * 4;
            r += data[i]; g += data[i+1]; b += data[i+2]; count++;
          }
        }
        r /= count; g /= count; b /= count;
        const a = data[idx+3];
        if (a < 20) continue;

        let matchedLayer = null, bestDist = Infinity;
        for (let i = 0; i < activeLayers.length; i++) {
          const layer = activeLayers[i];
          for (let t = 0; t < layer.targets.length; t++) {
            const tg = layer.targets[t];
            const dr = r - tg[0], dg = g - tg[1], db = b - tg[2];
            const dist = Math.sqrt(dr*dr*0.3 + dg*dg*0.59 + db*db*0.11);
            if (dist <= layer.tolerance && dist < bestDist) { bestDist = dist; matchedLayer = layer; }
          }
        }

        const targetStyle = matchedLayer ? matchedLayer.style : state.estiloKey;
        const targetPalette = matchedLayer ? matchedLayer.rgbPal : globalRgbPal;

        let finalRgb = [r, g, b];
        if (targetPalette && targetPalette.length > 0) finalRgb = window.PaletaHelper.corMaisProxima(r, g, b, targetPalette);

        if (state.contorno && bx > 0 && by > 0) {
          const leftIdx = (sampleY * W + Math.max(0, sampleX - px)) * 4;
          const diff = Math.abs(r - data[leftIdx]) + Math.abs(g - data[leftIdx+1]) + Math.abs(b - data[leftIdx+2]);
          if (diff > (255 - state.contornoForca)) {
            fullCtx.fillStyle = "#08080a"; fullCtx.fillRect(startX, startY, bw, bh); continue;
          }
        }

        window.EstiloRenderer.desenharBloco(fullCtx, targetStyle, startX, startY, bw, bh, finalRgb, bx, by, px);
      }
    }

    const scaleFactor = W / mainCanvas.width;
    const layersSnapshot = document.createElement("canvas");
    layersSnapshot.width = W;
    layersSnapshot.height = H;
    layersSnapshot.getContext("2d").drawImage(fullCanvas, 0, 0);

    fullCtx.clearRect(0, 0, W, H);
    state.texts
      .filter((t) => t.layerPos === "back")
      .forEach((t) => drawSingleText(fullCtx, t, W, H, scaleFactor));
    fullCtx.drawImage(layersSnapshot, 0, 0);
    state.texts
      .filter((t) => t.layerPos === "front")
      .forEach((t) => drawSingleText(fullCtx, t, W, H, scaleFactor));

    return fullCanvas;
  }

  function startLayersVideoLoop() {
    if (state.layersAnimFrameId) cancelAnimationFrame(state.layersAnimFrameId);
    let lastTime = performance.now();
    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!state.layersActive) { state.layersAnimFrameId = null; return; }

      const hasAnimatedText = state.texts.some(t => t.active && t.anim && t.anim !== "none");

      if (state.mediaType === "video" && !videoEl.paused && !videoEl.ended) {
        renderLayersFrame();
      } else if (hasAnimatedText) {
        state.synthTime += dt;
        renderLayersFrame();
      }

      state.layersAnimFrameId = requestAnimationFrame(loop);
    }
    state.layersAnimFrameId = requestAnimationFrame(loop);
  }

  mainCanvas.addEventListener("click", (e) => {
    if (!state.activeEyedropper) return;
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = offCanvas.width / rect.width;
    const scaleY = offCanvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    if (x < 0 || y < 0 || x >= offCanvas.width || y >= offCanvas.height) return;
    
    const pixel = offCtx.getImageData(x, y, 1, 1).data;
    const hex = "#" + [pixel[0],pixel[1],pixel[2]].map(v => v.toString(16).padStart(2,"0")).join("");
    
    const { layerIndex, slotIndex } = state.activeEyedropper;
    const layer = state.layers[layerIndex];
    const slot = layer.colors[slotIndex];
    slot.hex = hex; slot.active = true; layer.enabled = true;
    
    document.getElementById(`layer_en_${layerIndex}`).checked = true;
    document.getElementById(`slot_chk_${layerIndex}_${slotIndex}`).checked = true;
    document.getElementById(`slot_col_${layerIndex}_${slotIndex}`).value = hex;
    document.getElementById(`slot_box_${layerIndex}_${slotIndex}`).classList.remove("disabled-slot");
    
    const prev = document.getElementById(`layer_prev_${layerIndex}`);
    if (prev) prev.style.background = hex;
    
    clearEyedropperState();
    statusBadge.textContent = `✅ ${hex.toUpperCase()} salvo em ${layer.name} (#${slotIndex + 1})`;
    renderLayersFrame();
  });

  async function exportLayersZip() {
    if (state.mediaType !== "video" || !videoEl.duration) { alert("Carregue um vídeo primeiro."); return; }
    const fps = parseInt(document.getElementById("rangeFps").value, 10);
    const dur = parseInt(document.getElementById("rangeDur").value, 10);
    const totalFrames = fps * dur;
    const videoDuration = videoEl.duration;
    const name = document.getElementById("fileName").value.trim() || "pixel_sequence";

    const zip = new JSZip();
    const bar = document.getElementById("zipProgress");
    const fill = bar.querySelector("div");
    const statusEl = document.getElementById("zipStatus");
    bar.classList.add("active"); fill.style.width = "0%";

    const wasPlaying = !videoEl.paused;
    videoEl.pause();
    state.layersActive = true;

    function seekVideo(t) {
      return new Promise((resolve) => {
        const target = Math.max(0, Math.min(videoDuration - 0.001, t));
        if (Math.abs(videoEl.currentTime - target) < 0.005) { resolve(); return; }
        let done = false;
        videoEl.addEventListener("seeked", () => { if (!done) { done = true; setTimeout(resolve, 30); } }, { once: true });
        videoEl.currentTime = target;
        setTimeout(() => { if (!done) { done = true; resolve(); } }, 1000);
      });
    }

    try {
      for (let i = 0; i < totalFrames; i++) {
        const t = (i / fps) % videoDuration;
        await seekVideo(t);
        renderLayersFrame();
        zip.file(`frame_${String(i).padStart(4,"0")}.png`, mainCanvas.toDataURL("image/png").split(",")[1], { base64: true });
        fill.style.width = `${((i+1)/totalFrames)*100}%`;
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${name}_20camadas.zip`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      if (wasPlaying) { videoEl.play(); startLayersVideoLoop(); }
      setTimeout(() => { bar.classList.remove("active"); }, 2000);
    }
  }

  function init() {
    populatePaletaSelect(selectPaleta, "original");
    populateEstiloSelect(selectEstilo, "quadrado_media");
    document.getElementById("paletaCount").textContent = getPaletasKeys().length;
    document.getElementById("estiloCount").textContent = getEstilosIds().length;
       atualizarPreviewPaleta();
    initLayers();
    initTextControls();
	initProjectSaveLoad();

    // CORREÇÃO CRÍTICA AQUI: Se o vídeo estiver tocando, só atualiza os estados, deixa o loop cuidar de desenhar
    document.getElementById("rangeBloco").addEventListener("input", (e) => {
      state.bloco = parseInt(e.target.value, 10); document.getElementById("lblBloco").textContent = `${state.bloco} px`;
      if (!videoEl.paused) return; // Se o vídeo tá tocando, ele vai atualizar no próximo frame sozinho
      if (state.layersActive) renderLayersFrame(); else renderRetroFrame();
    });
    
    [selectPaleta, selectEstilo, document.getElementById("chkGrade"), document.getElementById("chkContorno"), document.getElementById("chkChroma"), document.getElementById("chromaColor")].forEach(el => {
      el.addEventListener("change", () => {
        if (el === selectPaleta) { state.paletteKey = el.value; state.useCustomPalette = false; atualizarPreviewPaleta(); }
        if (el === selectEstilo) state.estiloKey = el.value;
        if (el === document.getElementById("chkGrade")) state.grade = el.checked;
        if (el === document.getElementById("chkContorno")) state.contorno = el.checked;
        if (el === document.getElementById("chkChroma")) state.chromaAtivo = el.checked;
        if (el === document.getElementById("chromaColor")) state.chromaHex = el.value;
        
        if (!videoEl.paused) return;
        if (state.layersActive) renderLayersFrame(); else renderRetroFrame();
      });
    });
    
    document.getElementById("rangeContornoForca").addEventListener("input", (e) => { 
      state.contornoForca = parseInt(e.target.value, 10); document.getElementById("lblContornoForca").textContent = state.contornoForca; 
      if (!videoEl.paused) return;
      if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); 
    });
    document.getElementById("rangeBrilho").addEventListener("input", (e) => { 
      state.brilho = parseInt(e.target.value, 10); document.getElementById("lblBrilho").textContent = state.brilho; 
      if (!videoEl.paused) return;
      if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); 
    });
    document.getElementById("rangeContraste").addEventListener("input", (e) => { 
      state.contraste = parseInt(e.target.value, 10); document.getElementById("lblContraste").textContent = state.contraste; 
      if (!videoEl.paused) return;
      if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); 
    });
    document.getElementById("rangeTol").addEventListener("input", (e) => { 
      state.chromaTol = parseInt(e.target.value, 10); document.getElementById("lblTol").textContent = state.chromaTol; 
      if (!videoEl.paused) return;
      if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); 
    });

    document.getElementById("btnAddCustom").addEventListener("click", () => { state.customPalette.push(document.getElementById("customColor").value); state.useCustomPalette = true; atualizarPreviewPaleta(); if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); });
    document.getElementById("btnUseCustom").addEventListener("click", () => { state.useCustomPalette = true; atualizarPreviewPaleta(); if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); });
    document.getElementById("btnClearCustom").addEventListener("click", () => { state.customPalette = []; state.useCustomPalette = false; atualizarPreviewPaleta(); if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); });
    
    document.getElementById("btnCornerColor").addEventListener("click", () => {
      const p = offCtx.getImageData(0,0,1,1).data;
      state.chromaHex = "#" + [p[0],p[1],p[2]].map(v => v.toString(16).padStart(2,"0")).join("");
      document.getElementById("chromaColor").value = state.chromaHex; document.getElementById("chkChroma").checked = true; state.chromaAtivo = true;
      if (state.layersActive) renderLayersFrame(); else renderRetroFrame();
    });

    document.getElementById("btnUpload").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []); if (files.length === 0) return;
      const videoFile = files.find(f => f.type.startsWith("video/"));
      
      if (videoFile) {
        pararVideoAnterior(); state.frames = []; state.currentFrameIndex = 0; atualizarBarraFrames(); state.layersActive = false;
        const url = URL.createObjectURL(videoFile); state.mediaType = "video";
        videoEl.src = url; videoEl.muted = document.getElementById("chkMute").checked; videoEl.loop = document.getElementById("chkLoop").checked;
        
        videoEl.onloadeddata = () => {
          setCanvasSize(videoEl.videoWidth, videoEl.videoHeight); videoEl.currentTime = 0;
          videoEl.play().then(() => { 
            state.isPlaying = true; 
            document.getElementById("btnPlayPause").textContent = "⏸ Pausar"; 
            statusBadge.textContent = `Vídeo (${videoEl.videoWidth}x${videoEl.videoHeight})`; 
            if (state.layersActive) startLayersVideoLoop(); else startRetroLoop(); 
          }).catch(() => { statusBadge.textContent = "Clique em Play"; renderRetroFrame(); });
        };
        fileInput.value = ""; return;
      }

      pararVideoAnterior(); state.layersActive = false;
      const jaTemFrames = state.frames.length > 0;
      if (!jaTemFrames) { state.frames = []; state.currentFrameIndex = 0; }
      const iniciar = jaTemFrames ? state.frames.length : 0;

      adicionarFrames(files).then(() => {
        if (state.frames.length > 0) {
          state.currentFrameIndex = Math.min(iniciar, state.frames.length - 1);
          irParaFrame(state.currentFrameIndex);
          statusBadge.textContent = state.frames.length > 1 ? `${state.frames.length} imagens carregadas.` : `Imagem (${state.currentImg.naturalWidth}x${state.currentImg.naturalHeight})`;
        }
      });
      fileInput.value = "";
    });

    document.getElementById("btnTestImg").addEventListener("click", () => {
      pararVideoAnterior(); state.frames = []; state.currentFrameIndex = 0; atualizarBarraFrames();
      state.mediaType = "image"; state.layersActive = false; setCanvasSize(480, 320);
      const temp = document.createElement("canvas"); temp.width = 480; temp.height = 320;
      const tctx = temp.getContext("2d");
      const grad = tctx.createLinearGradient(0,0,0,320); grad.addColorStop(0,"#1a0b2e"); grad.addColorStop(0.6,"#c71585"); grad.addColorStop(1,"#ff8c00");
      tctx.fillStyle = grad; tctx.fillRect(0,0,480,320);
      tctx.fillStyle = "#ffdd00"; tctx.beginPath(); tctx.arc(240,170,65,0,Math.PI*2); tctx.fill();
      tctx.fillStyle = "#0d0618"; tctx.beginPath(); tctx.moveTo(0,250); tctx.lineTo(130,140); tctx.lineTo(260,250); tctx.moveTo(190,250); tctx.lineTo(340,120); tctx.lineTo(480,250); tctx.fill(); tctx.fillRect(0,248,480,72);
      const img = new Image(); img.onload = () => { state.currentImg = img; statusBadge.textContent = "Imagem Teste"; renderRetroFrame(); }; img.src = temp.toDataURL();
    });

    document.getElementById("btnTestVid").addEventListener("click", () => {
      pararVideoAnterior(); state.frames = []; state.currentFrameIndex = 0; atualizarBarraFrames();
      state.mediaType = "synth"; state.layersActive = false; state.synthTime = 0; state.isPlaying = true;
      setCanvasSize(480, 320); document.getElementById("btnPlayPause").textContent = "⏸ Pausar"; statusBadge.textContent = "Animação Teste"; startRetroLoop();
    });

    document.getElementById("btnLayersDemoChar").addEventListener("click", () => {
      state.frames = []; state.currentFrameIndex = 0; atualizarBarraFrames();
      state.layersActive = true; state.mediaType = "demo"; statusBadge.textContent = "7 Camadas: Personagem Exemplo"; renderLayersFrame();
    });

    document.getElementById("btnRenderNow").addEventListener("click", () => { if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); });

    document.getElementById("btnLayersToggleDebug").addEventListener("click", () => {
      state.showDebug = !state.showDebug;
      const b = document.getElementById("btnLayersToggleDebug");
      b.textContent = state.showDebug ? "Debug ON" : "Debug Visual";
      b.style.background = state.showDebug ? "#ff0066" : "";
      state.layersActive = true; renderLayersFrame();
    });

    document.getElementById("btnPlayPause").addEventListener("click", () => {
      if (state.mediaType === "video") {
        if (videoEl.paused) { 
          videoEl.play(); state.isPlaying = true; document.getElementById("btnPlayPause").textContent = "⏸ Pausar"; 
          if (state.layersActive) startLayersVideoLoop(); else startRetroLoop(); 
        }
        else { videoEl.pause(); state.isPlaying = false; document.getElementById("btnPlayPause").textContent = "▶ Continuar"; }
      } else if (state.mediaType === "synth") { state.isPlaying = !state.isPlaying; document.getElementById("btnPlayPause").textContent = state.isPlaying ? "⏸ Pausar" : "▶ Continuar"; }
    });
    
    document.getElementById("btnRestart").addEventListener("click", () => {
      if (state.mediaType === "video") { videoEl.currentTime = 0; if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); }
      else if (state.mediaType === "synth") { state.synthTime = 0; renderRetroFrame(); }
    });
    
    document.getElementById("videoSeek").addEventListener("input", (e) => {
      const pct = parseFloat(e.target.value)/100;
      if (state.mediaType === "video" && videoEl.duration) { videoEl.currentTime = pct*videoEl.duration; if (state.layersActive) renderLayersFrame(); else renderRetroFrame(); }
      else if (state.mediaType === "synth") { state.synthTime = pct*25; renderRetroFrame(); }
    });
    
    document.getElementById("chkLoop").addEventListener("change", (e) => { videoEl.loop = e.target.checked; });
    document.getElementById("chkMute").addEventListener("change", (e) => { videoEl.muted = e.target.checked; });

    document.getElementById("rangeFps").addEventListener("input", (e) => { document.getElementById("lblFps").textContent = e.target.value; });
    document.getElementById("rangeDur").addEventListener("input", (e) => { document.getElementById("lblDur").textContent = e.target.value; });
    document.getElementById("rangeGifFps").addEventListener("input", (e) => { document.getElementById("lblGifFps").textContent = e.target.value; });
    document.getElementById("rangeGifDur").addEventListener("input", (e) => { document.getElementById("lblGifDur").textContent = e.target.value; });
    document.getElementById("rangeGifQual").addEventListener("input", (e) => { document.getElementById("lblGifQual").textContent = e.target.value; });

    document.getElementById("btnDownloadImg").addEventListener("click", () => {
      const fmt = document.getElementById("exportFormat").value;
      const name = document.getElementById("fileName").value.trim() || "pixel_art";
      let canvasToExport = mainCanvas;
      try { canvasToExport = state.layersActive ? renderLayersFrameFullRes() : renderRetroFrameFullRes(); } catch (err) {}
      const link = document.createElement("a"); link.download = `${name}.${fmt === "jpeg" ? "jpg" : "png"}`; link.href = canvasToExport.toDataURL(`image/${fmt}`, 0.92); link.click();
      statusBadge.textContent = `Exportado ${canvasToExport.width}x${canvasToExport.height}`;
    });

    document.getElementById("btnRecordVideo").addEventListener("click", () => {
      const btn = document.getElementById("btnRecordVideo");
      if (state.mediaRecorder && state.mediaRecorder.state === "recording") { state.mediaRecorder.stop(); btn.textContent = "⏺ Gravar Vídeo (.WEBM)"; btn.classList.remove("danger"); return; }
      const stream = mainCanvas.captureStream(30);
      state.recordedChunks = [];
      state.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      state.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) state.recordedChunks.push(e.data); };
      state.mediaRecorder.onstop = () => {
        const blob = new Blob(state.recordedChunks, { type: "video/webm" }); const url = URL.createObjectURL(blob);
        const name = document.getElementById("fileName").value.trim() || "pixel_video"; const a = document.createElement("a"); a.href = url; a.download = `${name}.webm`; a.click();
        statusBadge.textContent = "Vídeo .WEBM exportado!";
      };
      state.mediaRecorder.start(); btn.textContent = "⏹ Parar & Salvar"; btn.classList.add("danger"); statusBadge.textContent = "Gravando vídeo...";
    });

    document.getElementById("btnExportZip").addEventListener("click", () => {
      if (state.mediaType === "image" && state.frames.length > 1) { exportarTodosFramesZip(); return; }
      if (state.layersActive) { exportLayersZip(); return; }
      if (state.mediaType === "none") { alert("Carregue uma imagem ou vídeo primeiro!"); return; }
      
      (async () => {
        const fps = parseInt(document.getElementById("rangeFps").value, 10), dur = parseInt(document.getElementById("rangeDur").value, 10);
        const totalFrames = fps * dur; const name = document.getElementById("fileName").value.trim() || "pixel_sequence";
        const zip = new JSZip(); const fill = document.getElementById("zipProgress").querySelector("div");
        document.getElementById("zipProgress").classList.add("active"); fill.style.width = "0%";
        const videoDuration = videoEl.duration || 0;

        function seekVideo(t) {
          return new Promise((resolve) => {
            const target = Math.max(0, Math.min(videoDuration - 0.001, t));
            if (Math.abs(videoEl.currentTime - target) < 0.005) { resolve(); return; }
            let done = false; videoEl.addEventListener("seeked", () => { if(!done){done=true;setTimeout(resolve,30);} }, {once:true});
            videoEl.currentTime = target; setTimeout(() => { if(!done){done=true;resolve();} }, 1000);
          });
        }

        try {
          for (let i = 0; i < totalFrames; i++) {
            let frameCanvas;
            if (state.mediaType === "video") { await seekVideo((i/fps)%videoDuration); frameCanvas = renderRetroFrameFullRes(); }
            else if (state.mediaType === "synth") { state.synthTime = (i/fps)%25; frameCanvas = renderRetroFrameFullRes(); }
            else { frameCanvas = renderRetroFrameFullRes(); }
            
            zip.file(`frame_${String(i).padStart(4,"0")}.png`, frameCanvas.toDataURL("image/png").split(",")[1], { base64: true });
            fill.style.width = `${((i+1)/totalFrames)*100}%`;
            if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
          }
          const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${name}.zip`; a.click();
        } catch (err) {} finally { setTimeout(() => { document.getElementById("zipProgress").classList.remove("active"); }, 2000); }
      })();
    });

    document.getElementById("btnExportGif").addEventListener("click", () => {
      if (typeof GIF === "undefined") { alert("gif.js não carregado."); return; }
      (async () => {
        const fps = parseInt(document.getElementById("rangeGifFps").value, 10), dur = parseInt(document.getElementById("rangeGifDur").value, 10), quality = parseInt(document.getElementById("rangeGifQual").value, 10);
        const delay = Math.round(1000 / fps); const name = document.getElementById("fileName").value.trim() || "pixel_gif";
        const totalFrames = (state.mediaType === "image" && state.frames.length > 1) ? state.frames.length : (fps * dur);
        const fill = document.getElementById("gifProgress").querySelector("div"); document.getElementById("gifProgress").classList.add("active"); fill.style.width = "0%";
        
        const gifCanvas = document.createElement("canvas"); gifCanvas.width = mainCanvas.width; gifCanvas.height = mainCanvas.height;
        const gifCtx = gifCanvas.getContext("2d", { willReadFrequently: true });
        const videoDuration = videoEl.duration || 0;

        function seekVideoGif(t) {
          return new Promise((resolve) => {
            const target = Math.max(0, Math.min(videoDuration - 0.001, t));
            if (Math.abs(videoEl.currentTime - target) < 0.005) { resolve(); return; }
            let done = false;
            videoEl.addEventListener("seeked", () => { if (!done) { done = true; setTimeout(resolve, 30); } }, { once: true });
            videoEl.currentTime = target;
            setTimeout(() => { if (!done) { done = true; resolve(); } }, 1000);
          });
        }
        
        try {
          const gif = new GIF({ workers: 2, quality: Math.max(1, 30 - quality), width: gifCanvas.width, height: gifCanvas.height, workerScript: "gif.worker.js", transparent: "rgba(0,0,0,0)" });
          gif.on("finished", (blob) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${name}.gif`; a.click(); setTimeout(() => { document.getElementById("gifProgress").classList.remove("active"); }, 2000); });
          
          for (let i = 0; i < totalFrames; i++) {
            const frameTime = i / fps;
            gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height);

			
            // 1. Textos ATRÁS (com tempo da animação sincronizado)
            state.texts.filter(t => t.layerPos === "back").forEach(t => drawSingleText(gifCtx, t, gifCanvas.width, gifCanvas.height, 1, frameTime));

            // 2. Renderiza a mídia (Várias Imagens, Vídeo, Synth ou Imagem Única)
            const layerCanvas = document.createElement("canvas");
            layerCanvas.width = gifCanvas.width; layerCanvas.height = gifCanvas.height;
            const layerCtx = layerCanvas.getContext("2d");

            if (state.frames.length > 1 && state.mediaType === "image") {
              state.currentFrameIndex = i; state.currentImg = state.frames[i].img;
              if (state.layersActive) { renderLayersFrame(); layerCtx.drawImage(mainCanvas, 0, 0); }
              else { offCtx.drawImage(state.currentImg, 0, 0, gifCanvas.width, gifCanvas.height); window.EstiloRenderer.renderizar(layerCtx, offCtx.getImageData(0,0,gifCanvas.width, gifCanvas.height).data, gifCanvas.width, gifCanvas.height, getGlobalOptions()); }
            } else if (state.mediaType === "video" && videoDuration > 0) {
              await seekVideoGif(frameTime % videoDuration);
              if (state.layersActive) { renderLayersFrame(); layerCtx.drawImage(mainCanvas, 0, 0); }
              else { offCtx.drawImage(videoEl, 0, 0, gifCanvas.width, gifCanvas.height); window.EstiloRenderer.renderizar(layerCtx, offCtx.getImageData(0,0,gifCanvas.width, gifCanvas.height).data, gifCanvas.width, gifCanvas.height, getGlobalOptions()); }
            } else if (state.mediaType === "synth") {
              desenharAnimacaoTeste(offCtx, gifCanvas.width, gifCanvas.height, frameTime);
              window.EstiloRenderer.renderizar(layerCtx, offCtx.getImageData(0,0,gifCanvas.width, gifCanvas.height).data, gifCanvas.width, gifCanvas.height, getGlobalOptions());
            } else {
              if (state.layersActive) { renderLayersFrame(); layerCtx.drawImage(mainCanvas, 0, 0); }
              else {
                if (state.mediaType === "image" && state.currentImg) offCtx.drawImage(state.currentImg, 0, 0, gifCanvas.width, gifCanvas.height);
                window.EstiloRenderer.renderizar(layerCtx, offCtx.getImageData(0,0,gifCanvas.width, gifCanvas.height).data, gifCanvas.width, gifCanvas.height, getGlobalOptions());
              }
            }

            gifCtx.drawImage(layerCanvas, 0, 0);

            // 3. Textos NA FRENTE (com tempo da animação sincronizado)
            state.texts.filter(t => t.layerPos === "front").forEach(t => drawSingleText(gifCtx, t, gifCanvas.width, gifCanvas.height, 1, frameTime));

            gif.addFrame(gifCtx, { copy: true, delay }); fill.style.width = `${((i+1)/totalFrames)*100}%`; if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
          }
          gif.render();
        } catch (err) { console.error(err); }
      })();
    });
    document.getElementById("btnPlayFrames").addEventListener("click", () => {
      const btn = document.getElementById("btnPlayFrames");
      if (state.isPlayingFrames) { clearInterval(state.playFramesInterval); state.isPlayingFrames = false; btn.textContent = "▶ Play"; btn.classList.replace("danger", "primary"); }
      else {
        if (state.frames.length <= 1) return;
        state.isPlayingFrames = true; btn.textContent = "⏸ Pause"; btn.classList.replace("primary", "danger");
        const msPerFrame = 1000 / (parseInt(document.getElementById("rangeFps").value, 10) || 12);
        state.playFramesInterval = setInterval(() => { irParaFrame(state.currentFrameIndex + 1 >= state.frames.length ? 0 : state.currentFrameIndex + 1); }, msPerFrame);
      }
    });

    if (document.getElementById("btnPrevFrame")) document.getElementById("btnPrevFrame").addEventListener("click", () => irParaFrame(state.currentFrameIndex - 1));
    if (document.getElementById("btnNextFrame")) document.getElementById("btnNextFrame").addEventListener("click", () => irParaFrame(state.currentFrameIndex + 1));
    if (document.getElementById("btnExportAllFrames")) document.getElementById("btnExportAllFrames").addEventListener("click", exportarTodosFramesZip);
    document.addEventListener("keydown", (e) => { if (state.frames.length > 1 && e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT") { if (e.key === "ArrowLeft") irParaFrame(state.currentFrameIndex - 1); if (e.key === "ArrowRight") irParaFrame(state.currentFrameIndex + 1); } });

    document.getElementById("btnTestImg").click();
	    document.getElementById("btnTestImg").click();
    startRetroLoop();
  }

  init();
})();