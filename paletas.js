window.BANCO_PALETAS = {
  // ===== ORIGINAIS =====
  "original": { nome: "00. Cores Originais", cores: null },
  "gameboy": { nome: "01. Game Boy Clássico", cores: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] },
  "gb_pocket": { nome: "02. Game Boy Pocket", cores: ["#1c1c1c", "#595959", "#a6a6a6", "#e8e8e8"] },
  "virtual_boy": { nome: "03. Virtual Boy Red", cores: ["#000000", "#550000", "#aa0000", "#ff0000"] },
  "cga_1": { nome: "04. IBM CGA Paleta 1", cores: ["#000000", "#55ffff", "#ff55ff", "#ffffff"] },
  "cga_2": { nome: "05. IBM CGA Paleta 2", cores: ["#000000", "#55ff55", "#ff5555", "#ffff55"] },
  "pico8": { nome: "06. PICO-8 (16 cores)", cores: ["#000000","#1d2b53","#7e2553","#008751","#ab5236","#5f574f","#c2c3c7","#fff1e8","#ff004d","#ffa300","#ffec27","#00e436","#29adff","#83769c","#ff77a8","#ffccaa"] },
  "c64": { nome: "07. Commodore 64 (16 cores)", cores: ["#000000","#ffffff","#880000","#aaffee","#cc44cc","#00cc55","#0000aa","#eeee77","#dd8855","#664400","#ff7777","#333333","#777777","#aaff66","#0088ff","#bbbbbb"] },
  "zx_spectrum": { nome: "08. ZX Spectrum", cores: ["#000000","#0000d7","#d70000","#d700d7","#00d700","#00d7d7","#d7d700","#d7d7d7","#0000ff","#ff0000","#ff00ff","#00ff00","#00ffff","#ffff00","#ffffff"] },
  "msx": { nome: "09. MSX Classic", cores: ["#000000","#21c842","#5edc78","#5455ed","#7d76fc","#d4524d","#42ebf5","#fc5554","#ff7978","#d4c154","#e6ce80","#21b03b","#c95bba","#cccccc","#ffffff"] },
  "nes": { nome: "10. Nintendo NES (24 cores)", cores: ["#000000","#fcfcfc","#f8f8f8","#bcbcbc","#7c7c7c","#a4e4fc","#3cbcfc","#0078f8","#0000fc","#b8b8f8","#6888fc","#0058f8","#0000bc","#d8b8f8","#9878f8","#6844fc","#4428bc","#f8b8f8","#f878f8","#d800cc","#940084","#f8a4c0","#f85898","#e40058"] },
  "endesga32": { nome: "11. Endesga 32 Pro", cores: ["#be4a2f","#d77643","#ead4aa","#e4a672","#b86f50","#733e39","#3e2731","#a22633","#e43b44","#f77622","#feae34","#fee761","#63c74d","#3e8948","#265c42","#193c3e","#124e89","#0099db","#2ce8f5","#ffffff","#c0cbdc","#8b9bb4","#5a6988","#3a4466","#262b44","#181425","#ff0044","#68386c","#b55088","#f6757a","#e8b796","#c28569"] },
  "cyberpunk": { nome: "12. Cyberpunk Neon", cores: ["#090a14","#1b112c","#511845","#900c3f","#c70039","#ff5733","#00f5d4","#fee440"] },
  "vaporwave": { nome: "13. Vaporwave Sunset", cores: ["#2b0f54","#ab1f65","#ff4f69","#fff7f8","#ff8142","#ffda45","#3368dc","#49e7ec"] },
  "synthwave": { nome: "14. Synthwave 80s", cores: ["#140526","#3d0c59","#9b1b7a","#f72585","#4cc9f0","#f8f9fa"] },
  "matrix": { nome: "15. Terminal Matrix", cores: ["#000800","#003300","#007700","#00cc00","#66ff66"] },
  "amber_crt": { nome: "16. Monitor Âmbar", cores: ["#140a00","#5c2d00","#b85c00","#ffb000"] },
  "sepia": { nome: "17. Sépia Antiga", cores: ["#1e140a","#4a3520","#7c5c3c","#b58d63","#e6cca8"] },
  "noir": { nome: "18. Cinema Noir P&B", cores: ["#080808","#383838","#757575","#b8b8b8","#f5f5f5"] },
  "dracula": { nome: "19. Dracula Theme", cores: ["#282a36","#44475a","#f8f8f2","#6272a4","#8be9fd","#50fa7b","#ffb86c","#ff79c6"] },
  "nord": { nome: "20. Nord Ártico", cores: ["#2e3440","#3b4252","#4c566a","#d8dee9","#88c0d0","#81a1c1","#a3be8c","#bf616a"] },
  "solarized": { nome: "21. Solarized", cores: ["#002b36","#073642","#586e75","#93a1a1","#eee8d5","#b58900","#cb4b16","#2aa198"] },
  "pastel": { nome: "22. Pastel Kawaii", cores: ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff"] },
  "gameboy_color": { nome: "23. GBC Pokémon", cores: ["#081820","#346856","#88c070","#e0f8d0","#d03838","#f89038","#3870d0","#f8e858"] },
  "autumn": { nome: "24. Outono Dourado", cores: ["#2d1606","#6b2c0c","#a84312","#d96b1c","#f2a33a","#fae09e"] },
  "ocean": { nome: "25. Oceano Profundo", cores: ["#03045e","#023e8a","#0077b6","#00b4d8","#90e0ef","#caf0f8"] },

  // ===== NOVAS PALETAS =====
  "snes": { nome: "26. Super Nintendo", cores: ["#000000","#ffffff","#7c7c7c","#0058f8","#0000bc","#6800b4","#4400a8","#f83800","#d80000","#a80000","#f8b800","#f87800","#f8d878","#008800","#00a800","#00e800"] },
  "sega_genesis": { nome: "27. Sega Genesis", cores: ["#000000","#ffffff","#880000","#aa00aa","#00aa00","#00aaaa","#aaaa00","#aaaaaa","#0000aa","#ff0000","#ff00ff","#00ff00","#00ffff","#ffff00","#ff8800","#888888"] },
  "cpc": { nome: "28. Amstrad CPC (27 cores)", cores: ["#000000","#000080","#0000ff","#008000","#008080","#0080ff","#00ff00","#00ff80","#00ffff","#800000","#800080","#8000ff","#808000","#808080","#8080ff","#80ff00","#80ff80","#80ffff","#ff0000","#ff0080","#ff00ff","#ff8000","#ff8080","#ff80ff","#ffff00","#ffff80","#ffffff"] },
  "atari2600": { nome: "29. Atari 2600", cores: ["#000000","#404040","#6c6c6c","#909090","#b0b0b0","#c8c8c8","#dcdcdc","#ececec","#444400","#646410","#848424","#a0a034","#b8b840","#d0d050","#e8e85c","#fcfc68"] },
  "apple2": { nome: "30. Apple II", cores: ["#000000","#722640","#40318a","#e434af","#0e5944","#ffffff","#808080","#ff6a3d","#a4a4a4","#ff44ff","#57b4f0","#a4e4a4","#ffef8b","#5ee05e","#ff9c9c","#c4c4ff"] },
  "amiga": { nome: "31. Amiga 500", cores: ["#000000","#ffffff","#d06c6c","#a8d0a8","#7c7ca8","#e0b0e0","#a0a0a0","#f0f0a0","#b0b0d0","#c08060","#80c0e0","#90e090","#f0a0a0","#a0a0f0","#d0d0d0","#f0f0f0"] },
  "teletext": { nome: "32. Teletext", cores: ["#000000","#ff0000","#00ff00","#ffff00","#0000ff","#ff00ff","#00ffff","#ffffff"] },
  "cga_gray": { nome: "33. CGA Monocromático", cores: ["#000000","#555555","#aaaaaa","#ffffff"] },
  "heresy_16": { nome: "34. Heresy 16", cores: ["#1a1c2c","#5d275d","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179","#29366f","#3b5dc9","#41a6f6","#73eff7","#f4f4f4","#94b0c2","#566c86","#333c57"] },
  "resurrect64": { nome: "35. Resurrect 64", cores: ["#2e222f","#3e3546","#625565","#966c6c","#ab947a","#694f62","#7f708a","#9babb2","#c7dcd0","#ffffff","#6e2727","#b33831","#ea4f36","#f57d4a","#ae2334","#e83b3b","#fb6b1d","#f79617","#f9c22b","#7a3045","#9e4539","#cd683d","#e6904e","#fbb954","#4c3e24","#676633","#a2a947","#d5e04b","#fbff86","#165a4c","#239063","#1ebc73","#91db69","#cddf6c","#313638","#374e4a","#547e64","#92a984","#b2ba90","#0b5e65","#0b8a8f","#0eaf9b","#30e1b9","#8ff8e2","#323353","#484a77","#4d65b4","#4d9be6","#8fd3ff","#45293f","#6b3e75","#905ea9","#a884f3","#eaaded","#753c54","#a24b6f","#cf657f","#ed8099","#831c5d","#c32454","#f04f78","#f68181","#fca790","#fdcbb0"] },
  "monochrome_red": { nome: "36. Monocromático Vermelho", cores: ["#0a0000","#330000","#660000","#990000","#cc0000","#ff0000"] },
  "monochrome_cyan": { nome: "37. Monocromático Ciano", cores: ["#000a0a","#003333","#006666","#009999","#00cccc","#00ffff"] },
  "monochrome_green": { nome: "38. Monocromático Verde", cores: ["#000a00","#003300","#006600","#009900","#00cc00","#00ff00"] },
  "terminal_amber": { nome: "39. Terminal Âmbar", cores: ["#000000","#1a0e00","#331c00","#4d2a00","#663800","#804600","#b36600","#ffaa00"] },
  "blueprint": { nome: "40. Blueprint", cores: ["#0a1a2f","#1c3d5a","#3a6ea5","#6ba3d6","#a8d4f0","#ffffff"] },
  "newspaper": { nome: "41. Jornal Impresso", cores: ["#111111","#3a3a3a","#6e6e6e","#a8a8a8","#e8e8e8"] },
  "neon_city": { nome: "42. Neon City", cores: ["#0d0221","#261447","#3d1e6d","#7b2cbf","#c77dff","#e0aaff","#ff006e","#ffbe0b","#3a86ff","#ffffff"] },
  "lava": { nome: "43. Lava Vulcânica", cores: ["#0a0000","#3d0000","#7a0000","#c41e00","#ff6b00","#ffcc00"] },
  "forest": { nome: "44. Floresta Densa", cores: ["#0b1a0e","#1e3a1e","#2e5a2e","#4a7a3a","#6b9a4a","#9abe5a","#c8d97a","#e8f0b0"] },
  "desert": { nome: "45. Deserto Árido", cores: ["#2e1a0e","#5a3418","#8a5228","#b87a3a","#d9a35a","#ecc88a","#f5e0b8","#fff8e8"] },
  "arctic": { nome: "46. Ártico Gélido", cores: ["#0a1420","#1a2e42","#2e4a66","#4a6e8a","#7aa8c8","#aad0e8","#d8eaf5","#ffffff"] },
  "sunset": { nome: "47. Pôr do Sol", cores: ["#1a0a1e","#3d1a3d","#7a2e5a","#c44a6e","#f57a5a","#ffb85a","#ffd97a","#fff0c0"] },
  "night_sky": { nome: "48. Céu Noturno", cores: ["#050514","#0e0e2e","#1a1a4e","#2e2e6e","#4a4a9a","#7a7ac8","#aaaae8","#e8e8ff"] },
  "candy": { nome: "49. Doces Candy", cores: ["#ff6ba8","#ff8dc8","#ffb0d8","#ffd8e8","#a8e8ff","#7ad4ff","#4ac0ff","#1aa8e8"] },
  "retro_80s": { nome: "50. Retro 80s", cores: ["#1a0033","#4a0080","#8000c0","#c000ff","#ff00aa","#ff0066","#ff4400","#ffaa00"] },
  "steampunk": { nome: "51. Steampunk", cores: ["#1a1208","#3d2a14","#6b4a28","#9a6e3a","#c89a5a","#e8c88a","#f5e0b0","#fff8e0"] },
  "grayscale_16": { nome: "52. Escala de Cinza (16)", cores: ["#000000","#111111","#222222","#333333","#444444","#555555","#666666","#777777","#888888","#999999","#aaaaaa","#bbbbbb","#cccccc","#dddddd","#eeeeee","#ffffff"] },
  "web_safe": { nome: "53. Web Safe (36)", cores: ["#000000","#000033","#000066","#000099","#0000cc","#0000ff","#003300","#003333","#003366","#003399","#0033cc","#0033ff","#006600","#006633","#006666","#006699","#0066cc","#0066ff","#009900","#009933","#009966","#009999","#0099cc","#0099ff","#00cc00","#00cc33","#00cc66","#00cc99","#00cccc","#00ccff","#00ff00","#00ff33","#00ff66","#00ff99","#00ffcc","#00ffff"] },

  // ===== ULTRA NOVAS =====
  "monochrome_blue": { nome: "54. Monocromático Azul", cores: ["#00000a","#000033","#000066","#000099","#0000cc","#0000ff"] },
  "monochrome_yellow": { nome: "55. Monocromático Amarelo", cores: ["#0a0a00","#333300","#666600","#999900","#cccc00","#ffff00"] },
  "monochrome_magenta": { nome: "56. Monocromático Magenta", cores: ["#0a000a","#330033","#660066","#990099","#cc00cc","#ff00ff"] },
  "monochrome_pink": { nome: "57. Monocromático Rosa", cores: ["#0a0005","#330022","#660044","#990066","#cc0088","#ff00aa"] },
  "gold": { nome: "58. Ouro Puro", cores: ["#1a1400","#4d3d00","#806600","#b38f00","#e6b800","#ffd700"] },
  "silver": { nome: "59. Prata Metálica", cores: ["#0a0a0a","#2d2d2d","#555555","#808080","#b0b0b0","#e0e0e0"] },
  "bronze": { nome: "60. Bronze Envelhecido", cores: ["#1a0e05","#3d2210","#6b3d1e","#9a5c2e","#c08040","#e6a660"] },
  "rust": { nome: "61. Ferrugem", cores: ["#1a0a05","#3d1a0a","#6b2d12","#8a4520","#b85a30","#d97a50"] },
  "moss": { nome: "62. Musgo", cores: ["#0a1205","#1a2d0a","#2e4a12","#4a6b1e","#6b8a2e","#8aaa45"] },
  "rose": { nome: "63. Rosa Antiga", cores: ["#1a0510","#3d0a20","#6b1235","#9a1e50","#c73270","#e66090"] },
  "ice": { nome: "64. Gelo Cristalino", cores: ["#051020","#0a2540","#105080","#2070b0","#50a0e0","#a0d8ff"] },
  "sand": { nome: "65. Areia da Praia", cores: ["#1a1408","#3d3010","#6b5520","#9a7d30","#c8a850","#e6cc80"] },
  "sky": { nome: "66. Céu Azul", cores: ["#0a1420","#1a3a5a","#2e608a","#5a90c0","#90c0e8","#d0e8ff"] },
  "grass": { nome: "67. Grama Verde", cores: ["#0a1a05","#1a3d0a","#306012","#4a8a20","#70b840","#a0e070"] },
  "blood": { nome: "68. Sangue", cores: ["#0a0000","#330000","#660000","#990000","#cc0000","#ff1a1a"] },
  "purple_rain": { nome: "69. Purple Rain", cores: ["#0a0010","#2a0040","#4a0070","#7a00a0","#a800d0","#d040ff"] },
  "toxic": { nome: "70. Tóxico Radioativo", cores: ["#0a1200","#1a2d00","#306000","#4a8a00","#70c000","#aaff00"] },
  "volcano": { nome: "71. Vulcão", cores: ["#0a0000","#3d0000","#7a0a00","#b81a00","#e64000","#ff8000"] },
  "coral_reef": { nome: "72. Recife de Coral", cores: ["#0a1a2a","#1a3a5a","#ff6b9d","#ffa07a","#ffcc66","#66e0e0"] },
  "aurora": { nome: "73. Aurora Boreal", cores: ["#051025","#0a2a4a","#1a5a70","#2ea090","#6ee0a0","#c0f8d0"] },
  "galaxy": { nome: "74. Galáxia", cores: ["#0a0010","#1a0a2a","#3a1a5a","#5a3a8a","#8a6aba","#c0a0e8"] },
  "nebula": { nome: "75. Nebulosa", cores: ["#0a0010","#2a0a3a","#5a1a6a","#9a3aaa","#d06ae0","#f0a0ff"] },
  "deep_space": { nome: "76. Espaço Profundo", cores: ["#000000","#050520","#0a0a40","#151570","#2525a0","#4545d0"] },
  "copper": { nome: "77. Cobre Polido", cores: ["#1a0800","#3d1405","#6b2810","#9a4018","#c86020","#e88840"] },
  "jade": { nome: "78. Jade Oriental", cores: ["#0a1a10","#1a3a20","#2e5a30","#4a8a48","#6eb868","#a0e098"] },
  "ruby": { nome: "79. Rubi", cores: ["#1a0008","#3d0010","#6b0020","#9a0030","#c80040","#ff0050"] },
  "sapphire": { nome: "80. Safira", cores: ["#00051a","#000d3d","#001a6b","#00309a","#0050c8","#0080ff"] },
  "emerald": { nome: "81. Esmeralda", cores: ["#001a08","#003d10","#006b20","#009a30","#00c840","#00ff50"] },
  "topaz": { nome: "82. Topázio", cores: ["#1a1000","#3d2800","#6b4a00","#9a6e00","#c89800","#ffcc00"] },
  "amethyst": { nome: "83. Ametista", cores: ["#10001a","#20003d","#40006b","#60009a","#8000c8","#a000ff"] },
  "obsidian": { nome: "84. Obsidiana", cores: ["#000000","#0a0a15","#151525","#202035","#303045","#505060"] },
  "pearl": { nome: "85. Pérola", cores: ["#1a1a20","#3d3d45","#70707a","#a0a0aa","#d0d0d8","#f8f8ff"] }
};

window.PaletaHelper = {
  parseHex(hex) {
    const clean = hex.replace('#', '');
    return [parseInt(clean.substring(0,2),16), parseInt(clean.substring(2,4),16), parseInt(clean.substring(4,6),16)];
  },
  corMaisProxima(r, g, b, rgbList) {
    if (!rgbList || rgbList.length === 0) return [r, g, b];
    let minDist = Infinity, best = rgbList[0];
    for (let i = 0; i < rgbList.length; i++) {
      const c = rgbList[i];
      const dr = r - c[0], dg = g - c[1], db = b - c[2];
      const dist = dr*dr*0.3 + dg*dg*0.59 + db*db*0.11;
      if (dist < minDist) { minDist = dist; best = c; }
    }
    return best;
  }
};