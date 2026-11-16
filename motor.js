(() => {
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

  let mediaType = "none";
  let currentImg = null;
  let customPalette = ["#ff0055", "#00ffcc", "#ffff00", "#111122"];
  let useCustomPalette = false;
  let animFrameId = null;
  let synthTime = 0;
  let isPlaying = true;
  let mediaRecorder = null;
  let recordedChunks = [];

  function initMenus() {
    const keys = Object.keys(window.BANCO_PALETAS);
    document.getElementById("paletaCount").textContent = keys.length;
    keys.forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = window.BANCO_PALETAS[k].nome;
      selectPaleta.appendChild(opt);
    });
    document.getElementById("estiloCount").textContent = window.BANCO_ESTILOS.length;
    window.BANCO_ESTILOS.forEach(est => {
      const opt = document.createElement("option");
      opt.value = est.id;
      opt.textContent = est.nome;
      selectEstilo.appendChild(opt);
    });
    atualizarPreviewPaleta();
  }

  function getActiveRgbPalette() {
    let hexList = null;
    if (useCustomPalette && customPalette.length > 0) hexList = customPalette;
    else { const p = window.BANCO_PALETAS[selectPaleta.value]; hexList = p ? p.cores : null; }
    if (!hexList) return null;
    return hexList.map(h => window.PaletaHelper.parseHex(h));
  }

  function atualizarPreviewPaleta() {
    palettePreview.innerHTML = "";
    const hexList = useCustomPalette ? customPalette : (window.BANCO_PALETAS[selectPaleta.value]?.cores || ["#ff4444","#44ff44","#4444ff","#ffff44"]);
    hexList.forEach(c => { const d = document.createElement("div"); d.style.background = c; palettePreview.appendChild(d); });
  }

  function setCanvasSize(w, h) {
    const maxDim = 960; // limite apenas para preview
    let nw = w || 480, nh = h || 320;
    if (nw > maxDim || nh > maxDim) { const r = Math.min(maxDim/nw, maxDim/nh); nw = Math.round(nw*r); nh = Math.round(nh*r); }
    if (mainCanvas.width !== nw || mainCanvas.height !== nh) {
      mainCanvas.width = nw; mainCanvas.height = nh;
      offCanvas.width = nw; offCanvas.height = nh;
    }
  }

  function getOptions() {
    return {
      bloco: parseInt(document.getElementById("rangeBloco").value, 10),
      estilo: selectEstilo.value,
      rgbPaleta: getActiveRgbPalette(),
      grade: document.getElementById("chkGrade").checked,
      contorno: document.getElementById("chkContorno").checked,
      brilho: parseInt(document.getElementById("rangeBrilho").value, 10),
      contraste: parseInt(document.getElementById("rangeContraste").value, 10),
      chromaAtivo: document.getElementById("chkChroma").checked,
      chromaRgb: window.PaletaHelper.parseHex(document.getElementById("chromaColor").value),
      chromaTol: parseInt(document.getElementById("rangeTol").value, 10)
    };
  }

  function renderFrame() {
    const w = mainCanvas.width, h = mainCanvas.height;
    if (mediaType === "image" && currentImg) { offCtx.clearRect(0,0,w,h); offCtx.drawImage(currentImg,0,0,w,h); }
    else if (mediaType === "video") {
      if (videoEl.readyState >= 2) { offCtx.clearRect(0,0,w,h); offCtx.drawImage(videoEl,0,0,w,h); }
      if (!isNaN(videoEl.duration) && videoEl.duration > 0) {
        document.getElementById("videoSeek").value = (videoEl.currentTime/videoEl.duration)*100;
        document.getElementById("videoTime").textContent = `${videoEl.currentTime.toFixed(1)}s / ${videoEl.duration.toFixed(1)}s`;
      }
    } else if (mediaType === "synth") {
      desenharAnimacaoTeste(offCtx, w, h, synthTime);
      document.getElementById("videoTime").textContent = `${(synthTime%25).toFixed(1)}s / 25.0s`;
      document.getElementById("videoSeek").value = ((synthTime%25)/25)*100;
    } else return;
    const imgData = offCtx.getImageData(0, 0, w, h).data;
    window.EstiloRenderer.renderizar(ctx, imgData, w, h, getOptions());
  }

  // ===== RENDER EM ALTA RESOLUÇÃO (download) =====
  function renderFrameFullRes() {
    let W, H;
    if (mediaType === "image" && currentImg) {
      W = currentImg.naturalWidth || currentImg.width;
      H = currentImg.naturalHeight || currentImg.height;
    } else if (mediaType === "video") {
      W = videoEl.videoWidth || mainCanvas.width;
      H = videoEl.videoHeight || mainCanvas.height;
    } else {
      W = mainCanvas.width;
      H = mainCanvas.height;
    }

    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = W;
    fullCanvas.height = H;
    const fullCtx = fullCanvas.getContext("2d", { willReadFrequently: true });

    const fullOffCanvas = document.createElement("canvas");
    fullOffCanvas.width = W;
    fullOffCanvas.height = H;
    const fullOffCtx = fullOffCanvas.getContext("2d", { willReadFrequently: true });

    if (mediaType === "image" && currentImg) {
      fullOffCtx.clearRect(0, 0, W, H);
      fullOffCtx.drawImage(currentImg, 0, 0, W, H);
    } else if (mediaType === "video") {
      fullOffCtx.clearRect(0, 0, W, H);
      fullOffCtx.drawImage(videoEl, 0, 0, W, H);
    } else if (mediaType === "synth") {
      desenharAnimacaoTeste(fullOffCtx, W, H, synthTime);
    }

    const imgData = fullOffCtx.getImageData(0, 0, W, H).data;
    window.EstiloRenderer.renderizar(fullCtx, imgData, W, H, getOptions());

    return fullCanvas;
  }

  function startLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    let lastTime = performance.now();
    function loop(now) {
      const dt = (now - lastTime)/1000; lastTime = now;
      if (mediaType === "video") { if (!videoEl.paused && !videoEl.ended) renderFrame(); }
      else if (mediaType === "synth" && isPlaying) { synthTime += dt; renderFrame(); }
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
  }

  function pararVideoAnterior() {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load();
  }

  document.getElementById("btnUpload").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const url = URL.createObjectURL(file); pararVideoAnterior();
    if (file.type.startsWith("video/")) {
      mediaType = "video"; statusBadge.textContent = "Carregando vídeo...";
      videoEl.src = url; videoEl.muted = document.getElementById("chkMute").checked; videoEl.loop = document.getElementById("chkLoop").checked;
      videoEl.onloadeddata = () => {
        setCanvasSize(videoEl.videoWidth, videoEl.videoHeight);
        videoEl.currentTime = 0;
        videoEl.play().then(() => { isPlaying = true; document.getElementById("btnPlayPause").textContent = "⏸ Pausar"; statusBadge.textContent = `Vídeo (${videoEl.videoWidth}x${videoEl.videoHeight})`; renderFrame(); startLoop(); })
          .catch(() => { statusBadge.textContent = "Clique em Play"; renderFrame(); });
      };
      videoEl.onerror = () => { statusBadge.textContent = "Erro ao abrir vídeo"; };
    } else if (file.type.startsWith("image/")) {
      mediaType = "image";
      const img = new Image();
      img.onload = () => { currentImg = img; setCanvasSize(img.width, img.height); statusBadge.textContent = `Imagem (${img.width}x${img.height})`; renderFrame(); };
      img.src = url;
    }
    fileInput.value = "";
  });

  document.getElementById("btnTestImg").addEventListener("click", () => {
    pararVideoAnterior(); mediaType = "image"; setCanvasSize(480, 320);
    const temp = document.createElement("canvas"); temp.width = 480; temp.height = 320;
    const tctx = temp.getContext("2d");
    const grad = tctx.createLinearGradient(0,0,0,320);
    grad.addColorStop(0,"#1a0b2e"); grad.addColorStop(0.6,"#c71585"); grad.addColorStop(1,"#ff8c00");
    tctx.fillStyle = grad; tctx.fillRect(0,0,480,320);
    tctx.fillStyle = "#ffdd00"; tctx.beginPath(); tctx.arc(240,170,65,0,Math.PI*2); tctx.fill();
    tctx.fillStyle = "#0d0618"; tctx.beginPath();
    tctx.moveTo(0,250); tctx.lineTo(130,140); tctx.lineTo(260,250);
    tctx.moveTo(190,250); tctx.lineTo(340,120); tctx.lineTo(480,250); tctx.fill();
    tctx.fillRect(0,248,480,72);
    const img = new Image();
    img.onload = () => { currentImg = img; statusBadge.textContent = "Imagem Teste"; renderFrame(); };
    img.src = temp.toDataURL();
  });

  function desenharAnimacaoTeste(c, w, h, t) {
    c.fillStyle = "#00ff00"; c.fillRect(0,0,w,h);
    const cx = w/2 + Math.cos(t*2)*(w*0.25);
    const cy = h/2 + Math.sin(t*3)*(h*0.2);
    const grad = c.createRadialGradient(cx-15,cy-15,5,cx,cy,60);
    grad.addColorStop(0,"#ffffff"); grad.addColorStop(0.4,"#ff0055"); grad.addColorStop(1,"#330022");
    c.fillStyle = grad; c.beginPath(); c.arc(cx,cy,55,0,Math.PI*2); c.fill();
    c.fillStyle = "#00ccff"; c.fillRect((t*120)%w, h-50, 70, 30);
  }

  document.getElementById("btnTestVid").addEventListener("click", () => {
    pararVideoAnterior(); mediaType = "synth"; synthTime = 0; isPlaying = true;
    setCanvasSize(480, 320); document.getElementById("btnPlayPause").textContent = "⏸ Pausar";
    statusBadge.textContent = "Animação Teste"; startLoop();
  });

  document.getElementById("btnPlayPause").addEventListener("click", () => {
    if (mediaType === "video") {
      if (videoEl.paused) { videoEl.play(); isPlaying = true; document.getElementById("btnPlayPause").textContent = "⏸ Pausar"; }
      else { videoEl.pause(); isPlaying = false; document.getElementById("btnPlayPause").textContent = "▶ Continuar"; }
    } else if (mediaType === "synth") {
      isPlaying = !isPlaying; document.getElementById("btnPlayPause").textContent = isPlaying ? "⏸ Pausar" : "▶ Continuar";
    }
  });

  document.getElementById("btnRestart").addEventListener("click", () => {
    if (mediaType === "video") { videoEl.currentTime = 0; renderFrame(); }
    else if (mediaType === "synth") { synthTime = 0; renderFrame(); }
  });

  document.getElementById("videoSeek").addEventListener("input", (e) => {
    const pct = parseFloat(e.target.value)/100;
    if (mediaType === "video" && videoEl.duration) { videoEl.currentTime = pct*videoEl.duration; renderFrame(); }
    else if (mediaType === "synth") { synthTime = pct*25; renderFrame(); }
  });

  document.getElementById("chkLoop").addEventListener("change", (e) => { videoEl.loop = e.target.checked; });
  document.getElementById("chkMute").addEventListener("change", (e) => { videoEl.muted = e.target.checked; });

  [selectPaleta, selectEstilo, document.getElementById("chkGrade"), document.getElementById("chkContorno"), document.getElementById("chkChroma"), document.getElementById("chromaColor")].forEach(el => {
    el.addEventListener("change", () => {
      if (el === selectPaleta) { useCustomPalette = false; atualizarPreviewPaleta(); }
      renderFrame();
    });
  });

  document.getElementById("rangeBloco").addEventListener("input", (e) => { document.getElementById("lblBloco").textContent = e.target.value; renderFrame(); });
  document.getElementById("rangeBrilho").addEventListener("input", (e) => { document.getElementById("lblBrilho").textContent = e.target.value; renderFrame(); });
  document.getElementById("rangeContraste").addEventListener("input", (e) => { document.getElementById("lblContraste").textContent = e.target.value; renderFrame(); });
  document.getElementById("rangeTol").addEventListener("input", (e) => { document.getElementById("lblTol").textContent = e.target.value; renderFrame(); });
  document.getElementById("rangeZoom").addEventListener("input", (e) => {
    const z = parseInt(e.target.value, 10);
    document.getElementById("lblZoom").textContent = `${z}%`;
    mainCanvas.style.width = `${Math.round(mainCanvas.width*(z/100))}px`;
    mainCanvas.style.height = `${Math.round(mainCanvas.height*(z/100))}px`;
  });
  document.getElementById("rangeFps").addEventListener("input", (e) => { document.getElementById("lblFps").textContent = e.target.value; });
  document.getElementById("rangeDur").addEventListener("input", (e) => { document.getElementById("lblDur").textContent = e.target.value; });
  document.getElementById("btnRenderNow").addEventListener("click", renderFrame);

  document.getElementById("btnAddCustom").addEventListener("click", () => {
    customPalette.push(document.getElementById("customColor").value);
    useCustomPalette = true; atualizarPreviewPaleta(); renderFrame();
  });
  document.getElementById("btnUseCustom").addEventListener("click", () => { useCustomPalette = true; atualizarPreviewPaleta(); renderFrame(); });
  document.getElementById("btnClearCustom").addEventListener("click", () => { customPalette = []; useCustomPalette = false; atualizarPreviewPaleta(); renderFrame(); });

  document.getElementById("btnCornerColor").addEventListener("click", () => {
    const p = offCtx.getImageData(0,0,1,1).data;
    const hex = "#" + [p[0],p[1],p[2]].map(v => v.toString(16).padStart(2,"0")).join("");
    document.getElementById("chromaColor").value = hex;
    document.getElementById("chkChroma").checked = true;
    renderFrame();
  });

  // ===== DOWNLOAD EM TAMANHO ORIGINAL =====
  document.getElementById("btnDownloadImg").addEventListener("click", () => {
    const fmt = document.getElementById("exportFormat").value;
    const name = document.getElementById("fileName").value.trim() || "pixel_art";
    let canvasToExport = mainCanvas;

    if (mediaType === "image" || mediaType === "video") {
      try {
        canvasToExport = renderFrameFullRes();
      } catch (err) {
        console.warn("Falha ao gerar alta resolução, usando canvas atual:", err);
        canvasToExport = mainCanvas;
      }
    }

    const link = document.createElement("a");
    link.download = `${name}.${fmt === "jpeg" ? "jpg" : "png"}`;
    link.href = canvasToExport.toDataURL(`image/${fmt}`, 0.92);
    link.click();
    statusBadge.textContent = `Exportado ${canvasToExport.width}x${canvasToExport.height}`;
  });

  const btnRecord = document.getElementById("btnRecordVideo");
  btnRecord.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop(); btnRecord.textContent = "⏺ Gravar Vídeo (.WEBM)"; btnRecord.classList.remove("danger"); return;
    }
    const stream = mainCanvas.captureStream(30);
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const name = document.getElementById("fileName").value.trim() || "pixel_video";
      const a = document.createElement("a"); a.href = url; a.download = `${name}.webm`; a.click();
      statusBadge.textContent = "Vídeo .WEBM exportado!";
    };
    mediaRecorder.start(); btnRecord.textContent = "⏹ Parar & Salvar Vídeo"; btnRecord.classList.add("danger");
    statusBadge.textContent = "Gravando vídeo...";
  });

  // ===== EXPORTAR SEQUÊNCIA PNG EM ZIP (TAMANHO ORIGINAL) =====
  document.getElementById("btnExportZip").addEventListener("click", async () => {
    if (mediaType === "none") { alert("Carregue uma imagem ou vídeo primeiro!"); return; }
    if (typeof JSZip === "undefined") { alert("JSZip não carregado. Verifique jszip.min.js."); return; }

    const fps = parseInt(document.getElementById("rangeFps").value, 10);
    const dur = parseInt(document.getElementById("rangeDur").value, 10);
    const totalFrames = fps * dur;
    const name = document.getElementById("fileName").value.trim() || "pixel_sequence";
    const zip = new JSZip();
    const progressBar = document.getElementById("zipProgress");
    const progressFill = progressBar.querySelector("div");
    const zipStatus = document.getElementById("zipStatus");
    const btn = document.getElementById("btnExportZip");

    btn.disabled = true; btn.textContent = "⏳ Gerando...";
    progressBar.classList.add("active"); progressFill.style.width = "0%";
    zipStatus.textContent = `0 / ${totalFrames} frames`;

    const opts = getOptions();
    const savedTime = synthTime, savedVidTime = videoEl.currentTime, wasPlaying = isPlaying;
    const savedPaused = videoEl.paused;
    videoEl.pause();

    try {
      for (let i = 0; i < totalFrames; i++) {
        const t = i / fps;
        let frameCanvas;

        if (mediaType === "image" && currentImg) {
          frameCanvas = renderFrameFullRes();
        } else if (mediaType === "video") {
          await new Promise((resolve) => {
            const target = Math.min(t, videoEl.duration || t);
            if (Math.abs(videoEl.currentTime - target) < 0.01) { resolve(); return; }
            videoEl.currentTime = target;
            const onSeeked = () => { videoEl.removeEventListener("seeked", onSeeked); resolve(); };
            videoEl.addEventListener("seeked", onSeeked);
            setTimeout(resolve, 500);
          });
          frameCanvas = renderFrameFullRes();
        } else if (mediaType === "synth") {
          frameCanvas = renderFrameFullRes();
        }

        const dataUrl = frameCanvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        zip.file(`frame_${String(i).padStart(4,"0")}.png`, base64, { base64: true });
        const pct = ((i+1)/totalFrames)*100;
        progressFill.style.width = `${pct}%`;
        zipStatus.textContent = `${i+1} / ${totalFrames} frames (${frameCanvas.width}x${frameCanvas.height})`;
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }
      zipStatus.textContent = "Compactando .zip...";
      await new Promise(r => setTimeout(r, 50));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${name}.zip`; a.click();
      URL.revokeObjectURL(url);
      zipStatus.textContent = `✅ Pronto! ${totalFrames} frames exportados.`;
      statusBadge.textContent = "Sequência .ZIP exportada!";
    } catch (err) {
      console.error(err);
      zipStatus.textContent = "❌ Erro: " + err.message;
    } finally {
      if (mediaType === "synth") synthTime = savedTime;
      if (mediaType === "video") { videoEl.currentTime = savedVidTime; if (!savedPaused && wasPlaying) videoEl.play(); }
      isPlaying = wasPlaying;
      btn.disabled = false; btn.textContent = "📦 Exportar .ZIP (PNG)";
      setTimeout(() => { progressBar.classList.remove("active"); }, 2000);
    }
  });

  // ===== EXPORTAR GIF ANIMADO =====
  document.getElementById("rangeGifFps").addEventListener("input", (e) => {
    document.getElementById("lblGifFps").textContent = e.target.value;
  });
  document.getElementById("rangeGifDur").addEventListener("input", (e) => {
    document.getElementById("lblGifDur").textContent = e.target.value;
  });
  document.getElementById("rangeGifQual").addEventListener("input", (e) => {
    document.getElementById("lblGifQual").textContent = e.target.value;
  });

  document.getElementById("btnExportGif").addEventListener("click", async () => {
    if (mediaType === "none") { alert("Carregue uma imagem ou vídeo primeiro!"); return; }
    if (typeof GIF === "undefined") { alert("gif.js não carregado."); return; }

    const fps = parseInt(document.getElementById("rangeGifFps").value, 10);
    const dur = parseInt(document.getElementById("rangeGifDur").value, 10);
    const quality = parseInt(document.getElementById("rangeGifQual").value, 10);
    const totalFrames = fps * dur;
    const delay = Math.round(1000 / fps);
    const name = document.getElementById("fileName").value.trim() || "pixel_gif";
    const progressBar = document.getElementById("gifProgress");
    const progressFill = progressBar.querySelector("div");
    const gifStatus = document.getElementById("gifStatus");
    const btn = document.getElementById("btnExportGif");

    btn.disabled = true;
    btn.textContent = "⏳ Gerando GIF...";
    progressBar.classList.add("active");
    progressFill.style.width = "0%";
    gifStatus.textContent = `0 / ${totalFrames} frames`;

    const opts = getOptions();
    const savedTime = synthTime;
    const savedVidTime = videoEl.currentTime;
    const wasPlaying = isPlaying;
    const wasPaused = videoEl.paused;
    videoEl.pause();

    // Tamanho do GIF: usa o canvas do preview (GIFs gigantes ficam pesados)
    const w = mainCanvas.width, h = mainCanvas.height;

    const workerScript = (typeof window.GIF_WORKER_SCRIPT !== "undefined")
      ? window.GIF_WORKER_SCRIPT
      : "gif.worker.js";

    try {
      const gif = new GIF({
        workers: 2,
        quality: Math.max(1, 30 - quality),
        width: w,
        height: h,
        workerScript: workerScript,
        transparent: "rgba(0,0,0,0)"
      });

      gif.on("progress", (p) => {
        const pct = p * 100;
        progressFill.style.width = `${pct}%`;
        gifStatus.textContent = `Codificando GIF... ${Math.round(pct)}%`;
      });

      gif.on("finished", (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.gif`;
        a.click();
        URL.revokeObjectURL(url);
        gifStatus.textContent = `✅ GIF pronto! (${totalFrames} frames)`;
        statusBadge.textContent = "GIF exportado!";
        btn.disabled = false;
        btn.textContent = "🎞️ Exportar GIF";
        setTimeout(() => { progressBar.classList.remove("active"); }, 2000);
      });

      gif.on("abort", () => {
        gifStatus.textContent = "❌ Geração cancelada.";
        btn.disabled = false;
        btn.textContent = "🎞️ Exportar GIF";
        progressBar.classList.remove("active");
      });

      for (let i = 0; i < totalFrames; i++) {
        const t = i / fps;
        if (mediaType === "image" && currentImg) {
          offCtx.clearRect(0,0,w,h); offCtx.drawImage(currentImg,0,0,w,h);
        } else if (mediaType === "video") {
          await new Promise((resolve) => {
            const target = Math.min(t, videoEl.duration || t);
            if (Math.abs(videoEl.currentTime - target) < 0.01) { resolve(); return; }
            videoEl.currentTime = target;
            const onSeeked = () => { videoEl.removeEventListener("seeked", onSeeked); resolve(); };
            videoEl.addEventListener("seeked", onSeeked);
            setTimeout(resolve, 500);
          });
          offCtx.clearRect(0,0,w,h); offCtx.drawImage(videoEl,0,0,w,h);
        } else if (mediaType === "synth") {
          desenharAnimacaoTeste(offCtx, w, h, t);
        }
        const imgData = offCtx.getImageData(0,0,w,h).data;
        window.EstiloRenderer.renderizar(ctx, imgData, w, h, opts);

        gif.addFrame(ctx, { copy: true, delay: delay });

        const pct = ((i+1)/totalFrames)*100;
        progressFill.style.width = `${pct}%`;
        gifStatus.textContent = `Gerando frames... ${i+1} / ${totalFrames}`;
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }

      gifStatus.textContent = "Codificando GIF final...";
      gif.render();
    } catch (err) {
      console.error(err);
      gifStatus.textContent = "❌ Erro: " + err.message;
      alert("Erro ao gerar GIF: " + err.message);
      btn.disabled = false;
      btn.textContent = "🎞️ Exportar GIF";
      progressBar.classList.remove("active");
    } finally {
      if (mediaType === "synth") synthTime = savedTime;
      if (mediaType === "video") {
        videoEl.currentTime = savedVidTime;
        if (!wasPaused && wasPlaying) videoEl.play();
      }
      isPlaying = wasPlaying;
    }
  });

  initMenus();
  document.getElementById("btnTestImg").click();
})();