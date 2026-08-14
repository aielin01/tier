"use strict";
/* ═══════════════════════════════════════════════════════════
   幸逢 · 状态栏系统 (statusbar.js)
   ---------------------------------------------------------------
   独立模块，依赖 app.js 中已存在的全局绑定：
   dbGet / dbSet / cards / imgs / modal / closeModal / toast /
   escapeHtml / escapeAttr / openApp / closeApp
   本文件必须在 app.js 之后加载（同一文档内的顶层 let/function
   在多个经典 <script> 之间是共享可见的，无需挂到 window 上）。
   ═══════════════════════════════════════════════════════════ */

// ─── 内置模板（用户可在编辑器内"恢复内置模板"随时取回） ───
const SB_SELF_BUILTIN_HTML = "<!DOCTYPE HTML>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">\n    <title>高级个体机能档案 · 幸逢状态栏终端</title>\n    <style>\n        @import url(\"https://fontsapi.zeoseven.com/310/main/result.css\");\n        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700&family=Share+Tech+Mono&display=swap');\n\n        :root {\n            --mainFontFamily: \"NanoFullSong\", sans-serif;\n            --englishFont: \"Orbitron\", sans-serif;\n            --englishSecondary: \"Rajdhani\", sans-serif;\n            --codeFont: \"Share Tech Mono\", monospace;\n            \n            --color-white: #ffffff;\n            --color-silver: #d1d1d1;\n            --color-dim: rgba(255, 255, 255, 0.2);\n            --color-dark: rgba(0, 0, 0, 0.8);\n        }\n\n        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\n\n        body {\n            background: transparent;\n            color: var(--color-white);\n            font-family: var(--mainFontFamily);\n            overflow-x: hidden;\n            min-height: 100vh;\n            padding: 3vw;\n        }\n\n        /* 强制左右结构 - 移动端也绝对生效 */\n        .hud-container {\n            display: grid;\n            grid-template-columns: 50% 46%;\n            justify-content: space-between;\n            width: 100%;\n            max-width: 1400px;\n            margin: 0 auto;\n            align-items: stretch;\n            perspective: 2000px; /* 为右侧3D倾斜提供视场 */\n        }\n\n        /* ==================== 左侧：绝对核心 ==================== */\n        .left-column {\n            display: flex;\n            flex-direction: column;\n            gap: 2rem;\n            position: relative;\n            z-index: 10;\n        }\n\n        /* --- 图片核心重构 --- */\n        .image-core {\n            position: relative;\n            width: 100%;\n            aspect-ratio: 3.5/5;\n        }\n\n        .img-clipper {\n            position: absolute; inset: 0;\n            clip-path: polygon(0 0, calc(100% - 15%) 0, 100% 12%, 100% 100%, 15% 100%, 0 calc(100% - 12%));\n            background: rgba(20,20,20,0.9);\n            cursor: pointer;\n            overflow: hidden;\n        }\n\n        .character-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.85; filter: grayscale(50%) contrast(1.2); }\n        \n        .upload-ui {\n            position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;\n            background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); opacity: 0; transition: 0.3s;\n        }\n        .img-clipper:hover .upload-ui { opacity: 1; }\n\n        .img-svg-border {\n            position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;\n        }\n\n        /* 加粗直角边 */\n        .bracket { position: absolute; border: 5px solid var(--color-white); width: 15%; aspect-ratio: 1; z-index: 3; }\n        .bracket.tl { top: 3%; left: 3%; border-right: none; border-bottom: none; }\n        .bracket.br { bottom: 3%; right: 3%; border-left: none; border-top: none; }\n\n        /* 呼吸梯形 */\n        .tz { position: absolute; background: var(--color-silver); height: 1.5%; z-index: 1; }\n        .tz.r1 { top: 20%; right: -4%; width: 20%; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); }\n        .tz.r2 { top: 23%; right: -6%; width: 25%; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); opacity: 0.4; }\n        .tz.l1 { bottom: 15%; left: -6%; width: 30%; clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); }\n        .tz.l2 { bottom: 18%; left: -8%; width: 35%; clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); opacity: 0.4; }\n\n        /* 左上平行四边形阵列 */\n        .para-list { position: absolute; top: 12%; left: 5%; display: flex; flex-direction: column; gap: 6px; z-index: 4; }\n        .para { width: 3vw; max-width: 30px; height: 6px; background: var(--color-white); transform: skewX(-30deg); opacity: 0.8; }\n\n        /* 左下角英文装饰 */\n        .bottom-label { position: absolute; bottom: 6%; left: 5%; z-index: 5; }\n        .label-rect { background: var(--color-white); color: #000; font-family: var(--englishFont); font-weight: 900; font-size: clamp(8px, 1.5vw, 12px); padding: 2px 10px; display: inline-block; margin-bottom: 5px; }\n        .label-text { font-family: var(--englishFont); font-size: clamp(14px, 2.5vw, 24px); font-weight: 700; text-shadow: 2px 2px 0 rgba(0,0,0,0.8); }\n\n        /* 浮动磨砂矩形 */\n        .f-rect { position: absolute; background: rgba(255,255,255,0.05); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.3); animation: float 3s infinite alternate ease-in-out; z-index: 6; }\n\n        /* --- 心情与想法（重组排列，非实框，SVG修饰） --- */\n        .sub-modules {\n            display: flex; gap: 1rem; width: 100%;\n        }\n        .hud-module {\n            flex: 1; position: relative; padding: 1rem 0;\n            display: flex; flex-direction: column; gap: 5px;\n        }\n        .module-mood { border-top: 1px dashed var(--color-dim); border-bottom: 1px dashed var(--color-dim); }\n        .module-thought {\n            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent);\n        }\n        .module-thought::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--color-white); }\n        \n        .mod-eng { font-family: var(--englishSecondary); font-size: 10px; color: var(--color-dim); letter-spacing: 1px; }\n        .mod-val { font-size: clamp(14px, 2.5vw, 18px); color: var(--color-white); }\n\n        /* ==================== 右侧：三层立体 + 星系节点 ==================== */\n        .right-column {\n            display: flex; flex-direction: column; gap: 3vw;\n            /* 向左内侧倾斜的立体感 */\n            transform-style: preserve-3d;\n            transform: rotateY(-12deg) translateZ(0);\n        }\n\n        /* --- 3层立体基类 --- */\n        .layer-box {\n            position: relative;\n            transform-style: preserve-3d;\n        }\n        /* 第一层：白色线框层（最上） */\n        .layer-box::after {\n            content: ''; position: absolute; inset: -5px; border: 1px solid rgba(255,255,255,0.5);\n            transform: translateZ(20px); pointer-events: none;\n        }\n        /* 第二层：淡灰图层（中间） */\n        .layer-box::before {\n            content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.03);\n            transform: translateZ(10px); pointer-events: none; backdrop-filter: blur(2px);\n        }\n\n        /* --- 基本情报：可翻转 --- */\n        .flip-container {\n            width: 100%; min-height: 120px;\n            perspective: 1000px;\n            cursor: pointer;\n        }\n        .flip-inner {\n            position: relative; width: 100%; height: 100%;\n            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);\n            transform-style: preserve-3d;\n        }\n        .flip-container.flipped .flip-inner { transform: rotateX(180deg); }\n        \n        .flip-front, .flip-back {\n            position: absolute; inset: 0; backface-visibility: hidden;\n            display: flex; flex-direction: column; justify-content: center;\n            border-left: 3px solid var(--color-white); padding: 1rem 1.5rem;\n        }\n        .flip-front { background: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 10px); }\n        .flip-front-text { font-family: var(--englishFont); font-size: clamp(16px, 3vw, 24px); letter-spacing: 4px; }\n        \n        .flip-back {\n            transform: rotateX(180deg);\n            background: rgba(0,0,0,0.4);\n            display: grid; grid-template-columns: 1fr 1fr; gap: 10px;\n        }\n        .flip-back .name-row { grid-column: 1 / -1; font-family: var(--englishFont); font-size: clamp(24px, 4vw, 36px); font-weight: 900; margin-bottom: 5px; border-bottom: 1px solid var(--color-dim); }\n        .info-pair { display: flex; flex-direction: column; }\n        .info-pair span:nth-child(1) { font-size: 10px; color: var(--color-silver); font-family: var(--englishSecondary); }\n        .info-pair span:nth-child(2) { font-size: clamp(12px, 2vw, 16px); }\n\n        /* --- 星系节点融合面板 (替代原有的呆板列表) --- */\n        .galaxy-node-map {\n            position: relative;\n            width: 100%;\n            aspect-ratio: 1/1.2;\n            background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);\n            display: flex; align-items: center; justify-content: center;\n        }\n\n        /* 中心星系 SVG */\n        .galaxy-svg {\n            position: absolute; width: 120%; height: 120%;\n            pointer-events: none;\n        }\n\n        /* 四个悬浮数据节点（现居地、位置、季节、天气） */\n        .data-node {\n            position: absolute;\n            display: flex; align-items: center; gap: 8px;\n            transform: translateZ(30px); /* 悬浮最高层 */\n        }\n        .node-dot { width: 6px; height: 6px; background: var(--color-white); border-radius: 50%; box-shadow: 0 0 10px #fff; }\n        .node-line { position: absolute; background: rgba(255,255,255,0.3); height: 1px; width: 40px; }\n        .node-content { display: flex; flex-direction: column; background: rgba(0,0,0,0.6); padding: 4px 8px; border: 1px solid var(--color-dim); }\n        .node-label { font-family: var(--englishSecondary); font-size: 10px; letter-spacing: 1px; color: #aaa; }\n        .node-val { font-size: clamp(12px, 2vw, 14px); white-space: nowrap; }\n\n        /* 节点分布 */\n        .dn-1 { top: 15%; left: 5%; }\n        .dn-1 .node-line { left: 100%; top: 50%; transform: rotate(20deg); transform-origin: left; }\n        \n        .dn-2 { top: 35%; right: -5%; flex-direction: row-reverse; text-align: right; }\n        .dn-2 .node-line { right: 100%; top: 50%; transform: rotate(-15deg); transform-origin: right; }\n        \n        .dn-3 { bottom: 35%; left: 0%; }\n        .dn-3 .node-line { left: 100%; top: 50%; transform: rotate(-30deg); transform-origin: left; }\n        \n        .dn-4 { bottom: 15%; right: 5%; flex-direction: row-reverse; text-align: right; }\n        .dn-4 .node-line { right: 100%; top: 50%; transform: rotate(10deg); transform-origin: right; }\n\n\n        @keyframes float { 100% { transform: translateY(-10px); } }\n        @keyframes orbit { 100% { transform: rotate(360deg); } }\n    </style>\n</head>\n<body>\n\n    <div class=\"hud-container\">\n        \n        <!-- 左侧核心 (2D平面但在三维视场内) -->\n        <div class=\"left-column\">\n            \n            <div class=\"image-core\">\n                <div class=\"img-clipper\" onclick=\"document.getElementById('fileUpload').click()\">\n                    <img id=\"mainImage\" class=\"character-img\" src=\"{{avatar}}\" style=\"display:none;\" onload=\"this.style.display='block'\" onerror=\"this.style.display='none'\">\n                    <div class=\"upload-ui\">\n                        <span style=\"font-family:var(--codeFont); font-size:12px;\">UPLOAD_IMG.exe</span>\n                    </div>\n                    <input type=\"file\" id=\"fileUpload\" accept=\"image/*\" style=\"display:none;\">\n                </div>\n\n                <svg class=\"img-svg-border\" preserveAspectRatio=\"none\" viewBox=\"0 0 100 100\">\n                    <polygon points=\"0,0 85,0 100,12 100,100 15,100 0,88\" fill=\"none\" stroke=\"var(--color-white)\" stroke-width=\"0.8\"/>\n                </svg>\n\n                <div class=\"bracket tl\"></div><div class=\"bracket br\"></div>\n                <div class=\"tz r1\"></div><div class=\"tz r2\"></div><div class=\"tz l1\"></div><div class=\"tz l2\"></div>\n                \n                <div class=\"para-list\">\n                    <div class=\"para\"></div><div class=\"para\"></div><div class=\"para\"></div><div class=\"para\"></div><div class=\"para\"></div>\n                </div>\n\n                <div class=\"bottom-label\">\n                    <div class=\"label-rect\">DESIGNATION</div>\n                    <div class=\"label-text\">{{name}}</div>\n                </div>\n                \n                <div class=\"f-rect\" style=\"width:2vw; height:1vw; bottom:20%; left:10%; animation-delay:0s;\"></div>\n                <div class=\"f-rect\" style=\"width:1vw; height:1vw; bottom:25%; left:30%; animation-delay:1s;\"></div>\n            </div>\n\n            <div class=\"sub-modules\">\n                <div class=\"hud-module module-mood\">\n                    <span class=\"mod-eng\">MOOD // 观测</span>\n                    <span class=\"mod-val\">{{mood}}</span>\n                    <svg style=\"position:absolute; right:0; top:0; width:20px; height:20px;\" viewBox=\"0 0 20 20\"><circle cx=\"10\" cy=\"10\" r=\"3\" fill=\"#fff\"/></svg>\n                </div>\n                <div class=\"hud-module module-thought\" style=\"padding-left:1rem;\">\n                    <span class=\"mod-eng\">THOUGHT // 履历</span>\n                    <span class=\"mod-val\">{{thought}}</span>\n                    <svg style=\"position:absolute; right:0; bottom:0; width:30px; height:20px;\" viewBox=\"0 0 30 20\"><polyline points=\"0,10 10,10 15,2 20,18 25,10 30,10\" fill=\"none\" stroke=\"#fff\"/></svg>\n                </div>\n            </div>\n\n        </div>\n\n        <!-- 右侧：向左内侧倾斜的三层立体架构 -->\n        <div class=\"right-column\">\n            \n            <!-- 可翻转基本情报 (层级盒子) -->\n            <div class=\"layer-box\">\n                <div class=\"flip-container\" onclick=\"this.classList.toggle('flipped')\">\n                    <div class=\"flip-inner\">\n                        <!-- 翻转前：封锁带 -->\n                        <div class=\"flip-front\">\n                            <span class=\"flip-front-text\">BASIC INFO</span>\n                            <span style=\"font-family:var(--codeFont); font-size:10px; color:#999;\">[TAP TO DECRYPT]</span>\n                        </div>\n                        <!-- 翻转后：情报 -->\n                        <div class=\"flip-back\">\n                            <div class=\"name-row\">{{name}}</div>\n                            <div class=\"info-pair\"><span>AGE / 年龄</span><span>{{age}}</span></div>\n                            <div class=\"info-pair\"><span>WEIGHT / 体重</span><span>{{weight}}</span></div>\n                            <div class=\"info-pair\" style=\"grid-column: 1/-1;\"><span>HEIGHT / 身高</span><span>{{height}}</span></div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <!-- 星系与讯息融合节点图 -->\n            <div class=\"layer-box galaxy-node-map\">\n                <svg class=\"galaxy-svg\" viewBox=\"0 0 200 200\">\n                    <!-- 中心发光体 -->\n                    <circle cx=\"100\" cy=\"100\" r=\"10\" fill=\"#fff\" filter=\"drop-shadow(0 0 10px #fff)\"/>\n                    <!-- 倾斜轨道系统 -->\n                    <g transform=\"translate(100,100) rotate(20) translate(-100,-100)\">\n                        <ellipse cx=\"100\" cy=\"100\" rx=\"80\" ry=\"20\" fill=\"none\" stroke=\"rgba(255,255,255,0.2)\" stroke-width=\"1\"/>\n                        <circle cx=\"180\" cy=\"100\" r=\"2\" fill=\"#fff\"><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 100 100\" to=\"360 100 100\" dur=\"10s\" repeatCount=\"indefinite\"/></circle>\n                    </g>\n                    <g transform=\"translate(100,100) rotate(-40) translate(-100,-100)\">\n                        <ellipse cx=\"100\" cy=\"100\" rx=\"60\" ry=\"15\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"0.5\" stroke-dasharray=\"2 4\"/>\n                    </g>\n                    <!-- 数据连线辅助 -->\n                    <circle cx=\"100\" cy=\"100\" r=\"90\" fill=\"none\" stroke=\"var(--color-dim)\" stroke-width=\"0.2\"/>\n                    <path d=\"M100 10 L100 190 M10 100 L190 100\" stroke=\"var(--color-dim)\" stroke-width=\"0.5\" stroke-dasharray=\"4 4\"/>\n                </svg>\n\n                <!-- 分布在系统上的数据节点 -->\n                <div class=\"data-node dn-1\">\n                    <div class=\"node-content\">\n                        <span class=\"node-label\">LOC // 现居地</span>\n                        <span class=\"node-val\">{{location}}</span>\n                    </div>\n                    <div class=\"node-line\"></div>\n                    <div class=\"node-dot\"></div>\n                </div>\n\n                <div class=\"data-node dn-2\">\n                    <div class=\"node-content\">\n                        <span class=\"node-label\">POS // 位置</span>\n                        <span class=\"node-val\">{{position}}</span>\n                    </div>\n                    <div class=\"node-line\"></div>\n                    <div class=\"node-dot\"></div>\n                </div>\n\n                <div class=\"data-node dn-3\">\n                    <div class=\"node-content\">\n                        <span class=\"node-label\">SEA // 季节</span>\n                        <span class=\"node-val\">{{season}}</span>\n                    </div>\n                    <div class=\"node-line\"></div>\n                    <div class=\"node-dot\"></div>\n                </div>\n\n                <div class=\"data-node dn-4\">\n                    <div class=\"node-content\">\n                        <span class=\"node-label\">WTH // 天气</span>\n                        <span class=\"node-val\">{{weather}}</span>\n                    </div>\n                    <div class=\"node-line\"></div>\n                    <div class=\"node-dot\"></div>\n                </div>\n            </div>\n\n        </div>\n    </div>\n\n    <script>\n        const fileUpload = document.getElementById('fileUpload');\n        const mainImage = document.getElementById('mainImage');\n        fileUpload.addEventListener('change', function(e) {\n            const file = e.target.files[0];\n            if (file) {\n                const reader = new FileReader();\n                reader.onload = function(event) {\n                    mainImage.src = event.target.result;\n                    mainImage.style.display = 'block';\n                };\n                reader.readAsDataURL(file);\n            }\n        });\n    </script>\n</body>\n</html>";
const SB_OPP_BUILTIN_HTML  = "<!DOCTYPE HTML>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">\n    <title>感官同步档案 · 幸逢状态栏终端</title>\n    <style>\n        @import url(\"https://fontsapi.zeoseven.com/310/main/result.css\");\n        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');\n\n        :root {\n            --f-cn: \"NanoFullSong\", sans-serif;\n            --f-en: \"Orbitron\", sans-serif;\n            --f-sub: \"Rajdhani\", sans-serif;\n            --f-mono: \"Share Tech Mono\", monospace;\n            \n            --c-bg: transparent;\n            --c-txt: #ffffff;\n            --c-line: #e8e8e8;\n            --c-dim: rgba(255, 255, 255, 0.25);\n            --c-acc: rgba(255, 255, 255, 0.8);\n            --c-inv: #000000;\n            --c-mask: rgba(0, 0, 0, 0.4);\n            --c-glow: rgba(255, 255, 255, 0.4);\n        }\n\n        @media (prefers-color-scheme: light) {\n            :root {\n                --c-txt: #050505;\n                --c-line: #1a1a1a;\n                --c-dim: rgba(0, 0, 0, 0.25);\n                --c-acc: rgba(0, 0, 0, 0.8);\n                --c-inv: #ffffff;\n                --c-mask: rgba(255, 255, 255, 0.5);\n                --c-glow: rgba(0, 0, 0, 0.3);\n            }\n        }\n\n        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\n\n        body {\n            background: var(--c-bg);\n            color: var(--c-txt);\n            font-family: var(--f-cn);\n            overflow-x: hidden;\n            min-height: 100vh;\n            padding: 2vw;\n        }\n\n        .hud-grid {\n            display: grid;\n            grid-template-columns: 55% 42%;\n            gap: 3vw;\n            width: 100%;\n            max-width: 1400px;\n            margin: 0 auto;\n            align-items: start;\n        }\n\n        .l-col {\n            display: flex;\n            flex-direction: column;\n            gap: 0.8rem;\n            animation: sInL 1s cubic-bezier(0.1, 1, 0.1, 1) both;\n        }\n\n        .img-core {\n            position: relative;\n            width: 100%;\n            aspect-ratio: 2/2.8;\n            z-index: 10;\n            margin-bottom: 0.5rem;\n        }\n\n        .img-clip {\n            position: absolute;\n            inset: 0;\n            clip-path: polygon(0 0, calc(100% - 12%) 0, 100% 8%, 100% 100%, 12% 100%, 0 calc(100% - 8%));\n            background: var(--c-mask);\n            cursor: pointer;\n            overflow: hidden;\n        }\n\n        .img-clip:hover { filter: brightness(1.1); }\n\n        .c-img {\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n            filter: contrast(1.1) grayscale(100%);\n        }\n\n        .up-ui {\n            position: absolute;\n            inset: 0;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            justify-content: center;\n            background: rgba(128,128,128,0.1);\n            backdrop-filter: blur(2px);\n            opacity: 0;\n            transition: opacity 0.3s;\n        }\n\n        .img-clip:hover .up-ui { opacity: 1; }\n\n        .svg-bd {\n            position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;\n            filter: drop-shadow(0 0 3px var(--c-glow));\n        }\n\n        .in-br { position: absolute; inset: 0; pointer-events: none; z-index: 3; }\n        .brk { position: absolute; border: 4px solid var(--c-line); width: 15%; aspect-ratio: 1; }\n        .brk.tl { top: 3%; left: 3%; border-right: none; border-bottom: none; }\n        .brk.br { bottom: 3%; right: 3%; border-left: none; border-top: none; }\n\n        .s-tz { position: absolute; inset: 0; pointer-events: none; z-index: 1; }\n        .tz { background: var(--c-line); position: absolute; height: 1.5%; }\n        .tz.r1 { top: 30%; right: -4%; width: 20%; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); animation: pX 2s infinite; }\n        .tz.r2 { top: 34%; right: -5%; width: 25%; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); opacity: 0.3; }\n        .tz.l1 { bottom: 25%; left: -6%; width: 30%; clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); animation: pX 2s infinite reverse; }\n        .tz.l2 { bottom: 29%; left: -7%; width: 35%; clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); opacity: 0.3; }\n\n        .p-lst { position: absolute; top: 12%; left: 4%; display: flex; flex-direction: column; gap: 4px; z-index: 4; }\n        .pa { width: 20px; height: 4px; background: var(--c-line); transform: skewX(-30deg); }\n\n        .b-lbl { position: absolute; bottom: 6%; left: 5%; z-index: 5; }\n        .l-r {\n            background: var(--c-txt); color: var(--c-inv); font-family: var(--f-en); font-weight: 900;\n            font-size: clamp(8px, 1.5vw, 10px); padding: 2px 6px; display: inline-block; margin-bottom: 2px;\n        }\n        .l-t { font-family: var(--f-cn); font-size: clamp(14px, 3vw, 22px); font-weight: 900; letter-spacing: 1px; }\n\n        .f-rects { position: absolute; inset: 0; pointer-events: none; z-index: 6; }\n        .fr { position: absolute; background: var(--c-dim); backdrop-filter: blur(2px); border: 1px solid var(--c-acc); animation: fl 3s infinite ease-in-out; }\n\n        .h-mod { position: relative; padding: 0.3rem 0; display: flex; flex-direction: column; gap: 0.1rem; }\n        \n        .m-mood { padding-left: 0.8rem; }\n        .m-mood::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: repeating-linear-gradient(to bottom, var(--c-line) 0, var(--c-line) 6px, transparent 6px, transparent 12px); }\n        .m-mood .s-dec { position: absolute; right: 0; top: 0; width: 25px; height: 25px; }\n\n        .m-tht { padding-top: 0.8rem; padding-bottom: 0.8rem; }\n        .m-tht::before, .m-tht::after { content: ''; position: absolute; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, var(--c-line), transparent); }\n        .m-tht::before { top: 0; } .m-tht::after { bottom: 0; }\n        .m-tht .s-dec { position: absolute; right: 0; bottom: -5px; width: 40px; height: 15px; }\n\n        .m-tit { font-family: var(--f-cn); font-size: 10px; color: var(--c-dim); letter-spacing: 1px; }\n        .m-val { font-size: clamp(10px, 2vw, 12px); color: var(--c-txt); letter-spacing: 1px; }\n\n        .r-col { display: flex; flex-direction: column; gap: 1.5rem; animation: sInR 1s cubic-bezier(0.1, 1, 0.1, 1) 0.1s both; }\n\n        .fc { position: relative; width: 100%; aspect-ratio: 1/1.1; perspective: 1200px; cursor: pointer; }\n        .fi { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }\n        .fi.act { transform: rotateY(180deg); }\n        .ff, .fb { position: absolute; inset: 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; background: var(--c-bg); }\n        .ff { z-index: 2; }\n        .fb { transform: rotateY(180deg); z-index: 1; }\n\n        .f1-ff { justify-content: center; align-items: flex-start; position: relative; padding: 10%; }\n        .f1-bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.15; pointer-events: none; z-index: 0; }\n        .id-tit { font-family: var(--f-cn); font-size: 10px; color: var(--c-dim); letter-spacing: 2px; z-index: 1; }\n        .id-val { font-family: var(--f-cn); font-size: clamp(28px, 6vw, 48px); font-weight: 900; line-height: 1; z-index: 1; margin: 10px 0; }\n        .id-code { font-family: var(--f-mono); font-size: 10px; color: var(--c-acc); z-index: 1; }\n\n        .f1-fb { position: relative; }\n        .fb-grid-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\n        .quad { position: absolute; display: flex; flex-direction: column; gap: 4px; }\n        .q-tl { top: 15%; left: 5%; }\n        .q-tr { top: 35%; right: 5%; align-items: flex-end; text-align: right; }\n        .q-bl { bottom: 35%; left: 5%; }\n        .q-br { bottom: 15%; right: 5%; align-items: flex-end; text-align: right; }\n        .q-lbl { font-family: var(--f-cn); font-size: 10px; color: var(--c-dim); letter-spacing: 1px; }\n        .q-val { font-size: clamp(12px, 2.5vw, 15px); font-weight: bold; letter-spacing: 1px; }\n\n        .fc2 { aspect-ratio: 1/1; }\n        .gx-wrap { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }\n        .gx-svg { width: 110%; height: 110%; transform-origin: center; }\n        .gx-txt { position: absolute; font-family: var(--f-mono); font-size: 9px; color: var(--c-dim); line-height: 1.2; }\n        .gt-tl { top: 0; left: 0; }\n        .gt-br { bottom: 0; right: 0; text-align: right; }\n\n        .rd-wrap { width: 100%; height: 100%; position: relative; }\n        .rd-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\n        .pt { position: absolute; display: flex; flex-direction: column; gap: 2px; }\n        .pt-tl { top: 8%; left: 5%; }\n        .pt-tr { top: 8%; right: 5%; align-items: flex-end; }\n        .pt-bl { bottom: 8%; left: 5%; }\n        .pt-br { bottom: 8%; right: 5%; align-items: flex-end; }\n\n        .mini-img-core {\n            position: relative;\n            width: 100%;\n            aspect-ratio: 2/1.2;\n            z-index: 10;\n        }\n        .mini-clip {\n            position: absolute;\n            inset: 0;\n            clip-path: polygon(10% 0, 100% 0, 100% calc(100% - 15%), calc(100% - 10%) 100%, 0 100%, 0 15%);\n            background: var(--c-mask);\n            cursor: pointer;\n            overflow: hidden;\n        }\n        .mini-clip:hover { filter: brightness(1.1); }\n        .mini-clip:hover .up-ui { opacity: 1; }\n        .mini-svg-bd {\n            position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;\n            filter: drop-shadow(0 0 2px var(--c-glow));\n        }\n\n        @keyframes sInL { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes sInR { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes fl { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }\n        @keyframes pX { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.1); } }\n\n        @media (max-width: 768px) {\n            body { padding: 4vw; }\n            .hud-grid { gap: 5vw; }\n            .img-core { aspect-ratio: 2/3; }\n            .mini-img-core { aspect-ratio: 2/1; }\n            .pa { width: 15px; height: 3px; }\n            .fc { aspect-ratio: 1/1.3; }\n            .fc2 { aspect-ratio: 1/1.1; }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"hud-grid\">\n        <div class=\"l-col\">\n            <div class=\"img-core\">\n                <div class=\"img-clip\" onclick=\"document.getElementById('fUp').click()\">\n                    <img id=\"mImg\" class=\"c-img\" src=\"{{avatar}}\" style=\"display:none;\" alt=\"\" onload=\"this.style.display='block'\" onerror=\"this.style.display='none'\">\n                    <div class=\"up-ui\">\n                        <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--c-line)\" stroke-width=\"1.5\">\n                            <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12\"/>\n                        </svg>\n                    </div>\n                    <input type=\"file\" id=\"fUp\" accept=\"image/*\" style=\"display:none;\">\n                </div>\n                <svg class=\"svg-bd\" preserveAspectRatio=\"none\" viewBox=\"0 0 100 100\">\n                    <polygon points=\"0,0 88,0 100,8 100,100 12,100 0,92\" fill=\"none\" stroke=\"var(--c-line)\" stroke-width=\"0.8\" vector-effect=\"non-scaling-stroke\"/>\n                </svg>\n                <div class=\"in-br\"><div class=\"brk tl\"></div><div class=\"brk br\"></div></div>\n                <div class=\"s-tz\"><div class=\"tz r1\"></div><div class=\"tz r2\"></div><div class=\"tz l1\"></div><div class=\"tz l2\"></div></div>\n                <div class=\"p-lst\"><div class=\"pa\"></div><div class=\"pa\"></div><div class=\"pa\"></div><div class=\"pa\"></div></div>\n                <div class=\"b-lbl\"><div class=\"l-r\">ID</div><div class=\"l-t\">{{designation}}</div></div>\n                <div class=\"f-rects\">\n                    <div class=\"fr\" style=\"width:18px; height:8px; bottom:18%; left:15%; animation-delay:0s;\"></div>\n                    <div class=\"fr\" style=\"width:12px; height:6px; bottom:24%; left:8%; animation-delay:1s;\"></div>\n                    <div class=\"fr\" style=\"width:22px; height:10px; bottom:12%; left:25%; animation-delay:2s;\"></div>\n                </div>\n            </div>\n\n            <div class=\"h-mod m-mood\">\n                <svg class=\"s-dec\" viewBox=\"0 0 35 35\">\n                    <path d=\"M 35 0 L 15 0 M 35 0 L 35 20\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"1.5\"/>\n                    <circle cx=\"30\" cy=\"5\" r=\"2\" fill=\"var(--c-acc)\"/>\n                </svg>\n                <div class=\"m-tit\">心情</div>\n                <div class=\"m-val\">{{mood}}</div>\n            </div>\n\n            <div class=\"h-mod m-tht\">\n                <svg class=\"s-dec\" viewBox=\"0 0 60 20\">\n                    <polyline points=\"0,10 15,10 20,2 25,18 30,10 60,10\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/>\n                    <circle cx=\"60\" cy=\"10\" r=\"1.5\" fill=\"var(--c-txt)\"/>\n                </svg>\n                <div class=\"m-tit\">想法</div>\n                <div class=\"m-val\">{{thought}}</div>\n            </div>\n        </div>\n\n        <div class=\"r-col\">\n            <div class=\"fc\" onclick=\"this.querySelector('.fi').classList.toggle('act')\">\n                <div class=\"fi\">\n                    <div class=\"ff f1-ff\">\n                        <svg class=\"f1-bg-svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n                            <line x1=\"0\" y1=\"20\" x2=\"100\" y2=\"20\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"2 2\"/>\n                            <line x1=\"0\" y1=\"80\" x2=\"100\" y2=\"80\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"2 2\"/>\n                            <circle cx=\"85\" cy=\"50\" r=\"40\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/>\n                            <circle cx=\"85\" cy=\"50\" r=\"30\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"1 3\"/>\n                            <path d=\"M 70 50 L 100 50 M 85 35 L 85 65\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/>\n                            <rect x=\"5\" y=\"40\" width=\"2\" height=\"20\" fill=\"var(--c-txt)\"/>\n                            <rect x=\"10\" y=\"45\" width=\"2\" height=\"10\" fill=\"var(--c-txt)\"/>\n                            <rect x=\"15\" y=\"35\" width=\"2\" height=\"30\" fill=\"var(--c-txt)\"/>\n                        </svg>\n                        <div class=\"id-tit\">姓名</div>\n                        <div class=\"id-val\">{{name}}</div>\n                        <div class=\"id-code\">SEQ: 0x8F9A // STATUS: ACTIVE</div>\n                    </div>\n                    <div class=\"fb f1-fb\">\n                        <svg class=\"fb-grid-svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n                            <path d=\"M 50 10 L 50 90 M 10 50 L 90 50\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                            <circle cx=\"50\" cy=\"50\" r=\"3\" fill=\"var(--c-txt)\"/>\n                            <path d=\"M 20 20 L 40 20 L 40 40\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                            <path d=\"M 80 80 L 60 80 L 60 60\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                        </svg>\n                        <div class=\"quad q-tl\"><span class=\"q-lbl\">年龄</span><span class=\"q-val\">{{age}}</span></div>\n                        <div class=\"quad q-tr\"><span class=\"q-lbl\">身高</span><span class=\"q-val\">{{height}}</span></div>\n                        <div class=\"quad q-bl\"><span class=\"q-lbl\">体重</span><span class=\"q-val\">{{weight}}</span></div>\n                        <div class=\"quad q-br\"><span class=\"q-lbl\">等级</span><span class=\"q-val\">{{level}}</span></div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"fc fc2\" onclick=\"this.querySelector('.fi').classList.toggle('act')\">\n                <div class=\"fi\">\n                    <div class=\"ff\">\n                        <div class=\"gx-wrap\">\n                            <div class=\"gx-txt gt-tl\">SEC_A9<br>ACTIVE</div>\n                            <div class=\"gx-txt gt-br\">ZOOM<br>1000X</div>\n                            <svg class=\"gx-svg\" viewBox=\"0 0 200 200\">\n                                <defs>\n                                    <radialGradient id=\"cGlow\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n                                        <stop offset=\"0%\" stop-color=\"var(--c-txt)\" stop-opacity=\"1\"/>\n                                        <stop offset=\"30%\" stop-color=\"var(--c-txt)\" stop-opacity=\"0.5\"/>\n                                        <stop offset=\"100%\" stop-color=\"var(--c-txt)\" stop-opacity=\"0\"/>\n                                    </radialGradient>\n                                </defs>\n                                <circle cx=\"100\" cy=\"100\" r=\"20\" fill=\"url(#cGlow)\"/>\n                                <circle cx=\"100\" cy=\"100\" r=\"5\" fill=\"var(--c-bg)\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/>\n                                <g transform=\"translate(100,100) rotate(20) translate(-100,-100)\">\n                                    <ellipse cx=\"100\" cy=\"100\" rx=\"70\" ry=\"20\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                                    <ellipse cx=\"100\" cy=\"100\" rx=\"70\" ry=\"20\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"1\" stroke-dasharray=\"2 8\">\n                                        <animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 100 100\" to=\"360 100 100\" dur=\"20s\" repeatCount=\"indefinite\"/>\n                                    </ellipse>\n                                    <g><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 100 100\" to=\"360 100 100\" dur=\"8s\" repeatCount=\"indefinite\"/><circle cx=\"170\" cy=\"100\" r=\"2\" fill=\"var(--c-txt)\"/></g>\n                                </g>\n                                <g transform=\"translate(100,100) rotate(-35) translate(-100,-100)\">\n                                    <ellipse cx=\"100\" cy=\"100\" rx=\"90\" ry=\"30\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.3\"/>\n                                    <g><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"360 100 100\" to=\"0 100 100\" dur=\"12s\" repeatCount=\"indefinite\"/><circle cx=\"10\" cy=\"100\" r=\"1.5\" fill=\"var(--c-txt)\"/><circle cx=\"10\" cy=\"100\" r=\"3\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/></g>\n                                </g>\n                                <circle cx=\"100\" cy=\"100\" r=\"95\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.3\" stroke-dasharray=\"3 3\"/>\n                            </svg>\n                        </div>\n                    </div>\n                    <div class=\"fb\">\n                        <div class=\"rd-wrap\">\n                            <svg class=\"rd-svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n                                <circle cx=\"50\" cy=\"50\" r=\"25\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                                <circle cx=\"50\" cy=\"50\" r=\"15\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"1 2\"/>\n                                <path d=\"M 50 20 L 50 35 M 50 65 L 50 80 M 20 50 L 35 50 M 65 50 L 80 50\" stroke=\"var(--c-txt)\" stroke-width=\"1\"/>\n                                <path d=\"M 25 25 L 40 40 M 75 25 L 60 40 M 25 75 L 40 60 M 75 75 L 60 60\" stroke=\"var(--c-dim)\" stroke-width=\"0.3\"/>\n                                <circle cx=\"50\" cy=\"50\" r=\"2\" fill=\"var(--c-txt)\"/>\n                            </svg>\n                            <div class=\"pt pt-tl\"><span class=\"q-lbl\">现居地</span><span class=\"q-val\">{{location}}</span></div>\n                            <div class=\"pt pt-tr\"><span class=\"q-lbl\">位置</span><span class=\"q-val\">{{position}}</span></div>\n                            <div class=\"pt pt-bl\"><span class=\"q-lbl\">季节</span><span class=\"q-val\">{{season}}</span></div>\n                            <div class=\"pt pt-br\"><span class=\"q-lbl\">天气</span><span class=\"q-val\">{{weather}}</span></div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"mini-img-core\">\n                <div class=\"mini-clip\" onclick=\"document.getElementById('fUp2').click()\">\n                    <img id=\"mImg2\" class=\"c-img\" style=\"display:none;\" alt=\"\">\n                    <div class=\"up-ui\">\n                        <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--c-line)\" stroke-width=\"1.5\">\n                            <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12\"/>\n                        </svg>\n                    </div>\n                    <input type=\"file\" id=\"fUp2\" accept=\"image/*\" style=\"display:none;\">\n                </div>\n                <svg class=\"mini-svg-bd\" preserveAspectRatio=\"none\" viewBox=\"0 0 100 100\">\n                    <polygon points=\"10,0 100,0 100,85 90,100 0,100 0,15\" fill=\"none\" stroke=\"var(--c-line)\" stroke-width=\"0.8\" vector-effect=\"non-scaling-stroke\"/>\n                </svg>\n                <div class=\"in-br\"><div class=\"brk tl\" style=\"width:10%;\"></div><div class=\"brk br\" style=\"width:10%;\"></div></div>\n            </div>\n        </div>\n    </div>\n    <script>\n        const setImg = (idUp, idImg) => {\n            const up = document.getElementById(idUp);\n            const img = document.getElementById(idImg);\n            up.addEventListener('change', e => {\n                const file = e.target.files[0];\n                if (file) {\n                    const reader = new FileReader();\n                    reader.onload = ev => { img.src = ev.target.result; img.style.display = 'block'; };\n                    reader.readAsDataURL(file);\n                }\n            });\n        };\n        setImg('fUp', 'mImg');\n        setImg('fUp2', 'mImg2');\n    </script>\n</body>\n</html>";

// 变量名 -> 编辑器里显示的中文标签
const SB_VAR_LABELS = {
  name: "姓名 / 标识", mood: "心情", thought: "想法",
  age: "年龄", weight: "体重", height: "身高", level: "等级",
  location: "现居地", position: "位置", season: "季节", weather: "天气",
  designation: "标识代号"
};
const SB_RESERVED_VARS = new Set(["avatar"]); // 由系统自动注入，不出现在编辑器里

const SB_MIN_INTERVAL = 3600000;   // 1 小时
const SB_MAX_INTERVAL = 86400000;  // 1 天
const SB_VAR_RE = /\{\{\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*\}\}/g;

let sbState = null;
let sbEditSide = "self";
let sbEditTab = "content";
let sbTicker = null;
let _sbSaveTimer = null;
let _sbRenderTimer = null;

// ─── 数据模型 ───
function sbDefaultState() {
  return {
    view: "dual",
    templates: {
      self: { name: "内置·观测终端",     html: SB_SELF_BUILTIN_HTML },
      opp:  { name: "内置·感官同步档案", html: SB_OPP_BUILTIN_HTML  }
    },
    fields:   { self: {}, opp: {} },   // 手动自定义的变量取值
    bindings: { opp: {} },             // 仅对方支持：变量名 -> 字卡库分类名
    picked:   { opp: {} },             // 已绑定变量当前抽中的字卡文本（缓存，避免每次渲染都重抽）
    updateIntervalMs: SB_MIN_INTERVAL,
    lastRefresh: 0
  };
}

function sbClampInterval(ms) {
  ms = +ms || SB_MIN_INTERVAL;
  return Math.min(SB_MAX_INTERVAL, Math.max(SB_MIN_INTERVAL, ms));
}

function sbExtractVars(html) {
  const set = new Set();
  let m;
  SB_VAR_RE.lastIndex = 0;
  while ((m = SB_VAR_RE.exec(html))) { if (!SB_RESERVED_VARS.has(m[1])) set.add(m[1]); }
  return [...set];
}

// ─── 持久化 ───
async function sbSave() {
  try { await dbSet("statusbar", sbState); } catch (e) { /* best-effort */ }
}
function sbSaveDebounced() {
  clearTimeout(_sbSaveTimer);
  _sbSaveTimer = setTimeout(sbSave, 300);
}

window.initStatusbar = async function () {
  let saved = null;
  try { saved = await dbGet("statusbar", null); } catch (e) { saved = null; }
  const def = sbDefaultState();
  sbState = {
    view: (saved && saved.view) || def.view,
    templates: {
      self: (saved && saved.templates && saved.templates.self) || def.templates.self,
      opp:  (saved && saved.templates && saved.templates.opp)  || def.templates.opp
    },
    fields: {
      self: Object.assign({}, (saved && saved.fields && saved.fields.self) || {}),
      opp:  Object.assign({}, (saved && saved.fields && saved.fields.opp)  || {})
    },
    bindings: { opp: Object.assign({}, (saved && saved.bindings && saved.bindings.opp) || {}) },
    picked:   { opp: Object.assign({}, (saved && saved.picked   && saved.picked.opp)   || {}) },
    updateIntervalMs: sbClampInterval(saved && saved.updateIntervalMs),
    lastRefresh: (saved && saved.lastRefresh) || 0
  };
  const fp = document.getElementById("fpStatusbar");
  if (fp && !fp._sbBound) { fp._sbBound = true; fp.addEventListener("change", sbHandleImport); }
};

// ─── 取值 / 抽字卡库 ───
function sbResolveValue(side, key) {
  if (side === "opp") {
    const cat = sbState.bindings.opp[key];
    if (cat) {
      const v = sbState.picked.opp[key];
      return (v !== undefined && v !== "") ? v : "未定义";
    }
  }
  const v = sbState.fields[side][key];
  return (v !== undefined && v !== "") ? v : "未定义";
}

function sbRollField(key) {
  const cat = sbState.bindings.opp[key];
  if (!cat) return;
  const pool = cards.filter(c => c.cat === cat && !c.shielded);
  sbState.picked.opp[key] = pool.length ? pool[Math.floor(Math.random() * pool.length)].text : "";
}

function sbRollAllBound() {
  Object.keys(sbState.bindings.opp).forEach(sbRollField);
}

function sbMaybeAutoRefresh() {
  if (!sbState) return;
  const now = Date.now();
  if (now - sbState.lastRefresh >= sbState.updateIntervalMs) {
    sbRollAllBound();
    sbState.lastRefresh = now;
    sbSaveDebounced();
  }
}

// ─── 渲染 ───
function sbBuildVarsMap(side) {
  const vars = {};
  sbExtractVars(sbState.templates[side].html).forEach(k => { vars[k] = sbResolveValue(side, k); });
  vars.avatar = imgs[side === "self" ? "selfAvatar" : "oppAvatar"] || window.DEFAULTS.PH_SVG;
  return vars;
}

function sbRenderHtml(side) {
  const vars = sbBuildVarsMap(side);
  return sbState.templates[side].html.replace(SB_VAR_RE, (m, k) => {
    const v = vars[k];
    return escapeHtml(v !== undefined ? v : "未定义");
  });
}

function sbMountFrame(wrap, side) {
  if (!wrap) return;
  wrap.innerHTML = `<iframe class="sb-frame" sandbox="allow-scripts" loading="lazy"></iframe>`;
  const ifr = wrap.querySelector("iframe");
  ifr.srcdoc = sbRenderHtml(side);
}

window.renderStatusbarApp = function () {
  if (!sbState) return;
  sbMaybeAutoRefresh();
  document.querySelectorAll("#statusbarApp .stab[data-sbv]").forEach(b => b.classList.toggle("active", b.dataset.sbv === sbState.view));
  const stage = document.getElementById("sbStage");
  if (!stage) return;

  const cardHtml = (side) => `
    <div class="sb-card" data-side="${side}">
      <div class="sb-card-bar">
        <span>${side === "self" ? "我方" : "对方"}</span>
        <button class="sb-edit-btn" onclick="window.openStatusbarEditor('${side}')">编辑</button>
      </div>
      <div class="sb-frame-wrap"></div>
    </div>`;

  if (sbState.view === "dual") {
    stage.className = "sb-stage sb-dual";
    stage.innerHTML = cardHtml("self") + cardHtml("opp");
  } else {
    stage.className = "sb-stage sb-single";
    stage.innerHTML = cardHtml(sbState.view);
  }
  stage.querySelectorAll(".sb-card").forEach(el => sbMountFrame(el.querySelector(".sb-frame-wrap"), el.dataset.side));
};

function sbScheduleRerender() {
  clearTimeout(_sbRenderTimer);
  _sbRenderTimer = setTimeout(() => window.renderStatusbarApp(), 350);
}

// ─── 视图切换 / 入口 ───
window.switchStatusbarView = function (v) {
  if (!sbState) return;
  sbState.view = v; sbSaveDebounced();
  window.renderStatusbarApp();
};

window.openStatusbarFor = function (side) {
  if (!sbState) return;
  sbState.view = (side === "self" || side === "opp") ? side : "dual";
  openApp("statusbarApp");
};

window.sbStartTicker = function () {
  window.sbStopTicker();
  sbTicker = setInterval(() => { if (currentApp === "statusbarApp") sbMaybeAutoRefresh(); }, 60000);
};
window.sbStopTicker = function () {
  if (sbTicker) { clearInterval(sbTicker); sbTicker = null; }
};

// ─── 编辑器 ───
window.openStatusbarEditor = function (side) {
  sbEditSide = side; sbEditTab = "content";
  modal(side === "self" ? "我方状态栏 · 编辑" : "对方状态栏 · 编辑", sbEditorHtml());
};

window.sbSwitchEditTab = function (t) {
  sbEditTab = t;
  modal(sbEditSide === "self" ? "我方状态栏 · 编辑" : "对方状态栏 · 编辑", sbEditorHtml());
};

function sbCatOptions(selected) {
  const cats = [...new Set(cards.map(c => c.cat))];
  if (!cats.length) return `<option value="">（字卡库暂无分类）</option>`;
  return cats.map(c => `<option value="${escapeAttr(c)}" ${c === selected ? "selected" : ""}>${escapeHtml(c)}</option>`).join("");
}

function sbEditorHtml() {
  return `
    <div class="sb-editor">
      <div class="sb-editor-tabs">
        <button class="sb-etab ${sbEditTab === "content" ? "on" : ""}" onclick="window.sbSwitchEditTab('content')">内容</button>
        <button class="sb-etab ${sbEditTab === "html" ? "on" : ""}" onclick="window.sbSwitchEditTab('html')">自定义 HTML</button>
        <button class="sb-etab ${sbEditTab === "settings" ? "on" : ""}" onclick="window.sbSwitchEditTab('settings')">设置</button>
      </div>
      <div class="sb-editor-body">${sbEditorBodyHtml()}</div>
    </div>`;
}

function sbEditorBodyHtml() {
  const side = sbEditSide;
  if (sbEditTab === "content") {
    const keys = sbExtractVars(sbState.templates[side].html);
    if (!keys.length) return `<div class="sb-empty-tip">该模板未检测到任何 {{变量}} 占位符</div>`;
    return `<div class="sb-field-list">` + keys.map(key => {
      const label = SB_VAR_LABELS[key] || key;
      if (side === "self") {
        const val = sbState.fields.self[key] || "";
        return `<div class="sb-field-row">
          <span class="sb-field-lbl">${escapeHtml(label)}</span>
          <input class="sb-field-input" value="${escapeAttr(val)}" placeholder="未定义"
            oninput="window.sbSetField('self','${key}',this.value)">
        </div>`;
      }
      const bound = sbState.bindings.opp[key];
      const val = sbState.fields.opp[key] || "";
      return `<div class="sb-field-row">
        <span class="sb-field-lbl">${escapeHtml(label)}</span>
        <div class="sb-field-ctl">
          <select class="sb-mode-select" onchange="window.sbSetBindMode('${key}', this.value)">
            <option value="" ${!bound ? "selected" : ""}>自定义</option>
            <option value="__cat__" ${bound ? "selected" : ""}>字卡库绑定</option>
          </select>
          ${bound
            ? `<select class="sb-cat-select" onchange="window.sbSetBindCat('${key}', this.value)">${sbCatOptions(bound)}</select>
               <button class="sb-reroll-btn" onclick="window.sbRerollField('${key}')" title="换一张">⟳</button>`
            : `<input class="sb-field-input" value="${escapeAttr(val)}" placeholder="未定义"
                 oninput="window.sbSetField('opp','${key}',this.value)">`
          }
        </div>
      </div>`;
    }).join("") + `</div>`;
  }
  if (sbEditTab === "html") {
    return `
      <textarea id="sbHtmlArea" class="sb-html-area" spellcheck="false">${escapeHtml(sbState.templates[side].html)}</textarea>
      <div class="sb-editor-actions">
        <button class="pill-btn" onclick="window.sbSaveHtml()">保存 HTML</button>
        <button class="pill-btn ghost" onclick="window.sbResetTemplate()">恢复内置模板</button>
      </div>
      <p class="sb-hint">用 <code>{{变量名}}</code> 作为占位符（如 <code>{{mood}}</code>），保存后会自动出现在"内容"页签，可继续手动填写或绑定字卡库。<code>{{avatar}}</code> 为保留变量，自动同步对应头像。</p>`;
  }
  // settings
  const hrs = Math.round(sbState.updateIntervalMs / 3600000);
  return `
    <div class="sb-settings">
      <div class="sb-set-row">
        <span>字卡库自动换卡间隔</span>
        <div class="sb-set-ctl">
          <input type="range" min="1" max="24" step="1" value="${hrs}" oninput="window.sbSetInterval(this.value)">
          <span id="sbIntervalDisp">${hrs} 小时</span>
        </div>
      </div>
      <div class="sb-set-row sb-set-actions">
        <button class="pill-btn" onclick="window.sbExport()">导出</button>
        <button class="pill-btn" onclick="document.getElementById('fpStatusbar').click()">导入</button>
        <button class="pill-btn danger" onclick="window.sbResetAll()">重置全部</button>
      </div>
    </div>`;
}

// ─── 编辑器操作 ───
window.sbSetField = function (side, key, val) {
  sbState.fields[side][key] = val;
  sbSaveDebounced();
  sbScheduleRerender();
};

window.sbSetBindMode = function (key, mode) {
  if (mode === "__cat__") {
    const cats = [...new Set(cards.map(c => c.cat))];
    sbState.bindings.opp[key] = cats[0] || "";
    sbRollField(key);
  } else {
    delete sbState.bindings.opp[key];
    delete sbState.picked.opp[key];
  }
  sbSave();
  modal(document.getElementById("mTitle").innerText, sbEditorHtml());
  sbScheduleRerender();
};

window.sbSetBindCat = function (key, cat) {
  sbState.bindings.opp[key] = cat;
  sbRollField(key);
  sbSave();
  modal(document.getElementById("mTitle").innerText, sbEditorHtml());
  sbScheduleRerender();
};

window.sbRerollField = function (key) {
  sbRollField(key);
  sbSave();
  modal(document.getElementById("mTitle").innerText, sbEditorHtml());
  sbScheduleRerender();
};

window.sbSetInterval = function (hours) {
  sbState.updateIntervalMs = sbClampInterval((+hours || 1) * 3600000);
  const disp = document.getElementById("sbIntervalDisp");
  if (disp) disp.innerText = hours + " 小时";
  sbSaveDebounced();
};

window.sbSaveHtml = function () {
  const el = document.getElementById("sbHtmlArea");
  if (!el) return;
  sbState.templates[sbEditSide].html = el.value;
  sbSave();
  toast("已保存");
  modal(document.getElementById("mTitle").innerText, sbEditorHtml());
  sbScheduleRerender();
};

window.sbResetTemplate = function () {
  if (!confirm("确定恢复为内置模板？当前自定义 HTML 将被覆盖。")) return;
  sbState.templates[sbEditSide].html = sbEditSide === "self" ? SB_SELF_BUILTIN_HTML : SB_OPP_BUILTIN_HTML;
  sbSave();
  toast("已恢复内置模板");
  modal(document.getElementById("mTitle").innerText, sbEditorHtml());
  sbScheduleRerender();
};

window.sbResetAll = function () {
  if (!confirm("确定重置状态栏系统？我方 / 对方的全部自定义内容、字卡库绑定与自定义 HTML 都会被清空。")) return;
  sbState = sbDefaultState();
  sbSave();
  closeModal();
  window.renderStatusbarApp();
  toast("已重置");
};

window.sbExport = function () {
  const data = JSON.stringify({
    templates: sbState.templates,
    fields: sbState.fields,
    bindings: sbState.bindings,
    updateIntervalMs: sbState.updateIntervalMs
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json;charset=utf-8" }));
  a.download = `状态栏_${Date.now()}.json`;
  a.click();
  toast("已导出");
};

function sbHandleImport(e) {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  const r = new FileReader();
  r.onload = async ev => {
    try {
      const obj = JSON.parse(ev.target.result);
      if (obj.templates) {
        if (obj.templates.self && obj.templates.self.html) sbState.templates.self = obj.templates.self;
        if (obj.templates.opp && obj.templates.opp.html)  sbState.templates.opp  = obj.templates.opp;
      }
      if (obj.fields) {
        if (obj.fields.self) Object.assign(sbState.fields.self, obj.fields.self);
        if (obj.fields.opp)  Object.assign(sbState.fields.opp,  obj.fields.opp);
      }
      if (obj.bindings && obj.bindings.opp) Object.assign(sbState.bindings.opp, obj.bindings.opp);
      if (obj.updateIntervalMs) sbState.updateIntervalMs = sbClampInterval(obj.updateIntervalMs);
      sbRollAllBound();
      await sbSave();
      toast("导入成功");
      closeModal();
      window.renderStatusbarApp();
    } catch (err) {
      toast("文件格式有误，导入失败");
    }
  };
  r.readAsText(f, "utf-8");
}
