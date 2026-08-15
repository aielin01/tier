"use strict";
/* 幸逢 · 状态栏系统 statusbar.js（依赖 app.js 的顶层绑定：dbGet/dbSet/cards/imgs/modal/closeModal/toast/escapeHtml/escapeAttr，须在 app.js 之后加载）*/

/* 内置状态栏模板：Ⅰ / Ⅱ，我方与对方均可自由选择使用其中任意一种 */
const SB_BUILTIN_HTML_I = "<!DOCTYPE HTML>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">\n    <title>Ⅰ</title>\n    <style>\n        @import url(\"https://fontsapi.zeoseven.com/310/main/result.css\");\n        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');\n\n        :root {\n            --f-cn: \"NanoFullSong\", sans-serif;\n            --f-en: \"Orbitron\", sans-serif;\n            --f-sub: \"Rajdhani\", sans-serif;\n            --f-mono: \"Share Tech Mono\", monospace;\n            \n            --c-bg: transparent;\n            --c-txt: #ffffff;\n            --c-line: #e8e8e8;\n            --c-dim: rgba(255, 255, 255, 0.25);\n            --c-acc: rgba(255, 255, 255, 0.8);\n            --c-inv: #000000;\n            --c-mask: rgba(0, 0, 0, 0.4);\n            --c-glow: rgba(255, 255, 255, 0.4);\n        }\n\n        @media (prefers-color-scheme: light) {\n            :root {\n                --c-txt: #050505;\n                --c-line: #1a1a1a;\n                --c-dim: rgba(0, 0, 0, 0.25);\n                --c-acc: rgba(0, 0, 0, 0.8);\n                --c-inv: #ffffff;\n                --c-mask: rgba(255, 255, 255, 0.5);\n                --c-glow: rgba(0, 0, 0, 0.3);\n            }\n        }\n\n        :root[data-theme=\"light\"] {\n            --c-txt: #050505;\n            --c-line: #1a1a1a;\n            --c-dim: rgba(0, 0, 0, 0.25);\n            --c-acc: rgba(0, 0, 0, 0.8);\n            --c-inv: #ffffff;\n            --c-mask: rgba(255, 255, 255, 0.5);\n            --c-glow: rgba(0, 0, 0, 0.3);\n        }\n        :root[data-theme=\"dark\"] {\n            --c-txt: #ffffff;\n            --c-line: #e8e8e8;\n            --c-dim: rgba(255, 255, 255, 0.25);\n            --c-acc: rgba(255, 255, 255, 0.8);\n            --c-inv: #000000;\n            --c-mask: rgba(0, 0, 0, 0.4);\n            --c-glow: rgba(255, 255, 255, 0.4);\n        }\n\n        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\n\n        body {\n            background: var(--c-bg);\n            color: var(--c-txt);\n            font-family: var(--f-cn);\n            overflow-x: hidden;\n            min-height: 100vh;\n            padding: 2vw;\n        }\n\n        .hud-grid {\n            display: grid;\n            grid-template-columns: 55% 42%;\n            gap: 3vw;\n            width: 100%;\n            max-width: 1400px;\n            margin: 0 auto;\n            align-items: start;\n        }\n\n        .l-col {\n            display: flex;\n            flex-direction: column;\n            gap: 0.8rem;\n            animation: sInL 1s cubic-bezier(0.1, 1, 0.1, 1) both;\n        }\n\n        .img-core {\n            position: relative;\n            width: 100%;\n            aspect-ratio: 2/2.8;\n            z-index: 10;\n            margin-bottom: 0.5rem;\n        }\n\n        .img-clip {\n            position: absolute;\n            inset: 0;\n            clip-path: polygon(0 0, calc(100% - 12%) 0, 100% 8%, 100% 100%, 12% 100%, 0 calc(100% - 8%));\n            background: var(--c-mask);\n            overflow: hidden;\n        }\n\n        .img-clip:hover { filter: brightness(1.1); }\n\n        .c-img {\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n            filter: contrast(1.1) grayscale(100%);\n        }\n\n        .svg-bd {\n            position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;\n            filter: drop-shadow(0 0 3px var(--c-glow));\n        }\n\n        .in-br { position: absolute; inset: 0; pointer-events: none; z-index: 3; }\n        .brk { position: absolute; border: 4px solid var(--c-line); width: 15%; aspect-ratio: 1; }\n        .brk.tl { top: 3%; left: 3%; border-right: none; border-bottom: none; }\n        .brk.br { bottom: 3%; right: 3%; border-left: none; border-top: none; }\n\n        .s-tz { position: absolute; inset: 0; pointer-events: none; z-index: 1; }\n        .tz { background: var(--c-line); position: absolute; height: 1.5%; }\n        .tz.r1 { top: 30%; right: -4%; width: 20%; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); animation: pX 2s infinite; }\n        .tz.r2 { top: 34%; right: -5%; width: 25%; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); opacity: 0.3; }\n        .tz.l1 { bottom: 25%; left: -6%; width: 30%; clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); animation: pX 2s infinite reverse; }\n        .tz.l2 { bottom: 29%; left: -7%; width: 35%; clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); opacity: 0.3; }\n\n        .p-lst { position: absolute; top: 12%; left: 4%; display: flex; flex-direction: column; gap: 4px; z-index: 4; }\n        .pa { width: 20px; height: 4px; background: var(--c-line); transform: skewX(-30deg); }\n\n        .b-lbl { position: absolute; bottom: 6%; left: 5%; z-index: 5; }\n        .l-r {\n            background: var(--c-txt); color: var(--c-inv); font-family: var(--f-en); font-weight: 900;\n            font-size: clamp(8px, 1.5vw, 10px); padding: 2px 6px; display: inline-block; margin-bottom: 2px;\n        }\n        .l-t { font-family: var(--f-cn); font-size: clamp(14px, 3vw, 22px); font-weight: 900; letter-spacing: 1px; }\n\n        .f-rects { position: absolute; inset: 0; pointer-events: none; z-index: 6; }\n        .fr { position: absolute; background: var(--c-dim); backdrop-filter: blur(2px); border: 1px solid var(--c-acc); animation: fl 3s infinite ease-in-out; }\n\n        .h-mod { position: relative; padding: 0.3rem 0; display: flex; flex-direction: column; gap: 0.1rem; }\n        \n        .m-mood { padding-left: 0.8rem; }\n        .m-mood::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: repeating-linear-gradient(to bottom, var(--c-line) 0, var(--c-line) 6px, transparent 6px, transparent 12px); }\n        .m-mood .s-dec { position: absolute; right: 0; top: 0; width: 25px; height: 25px; }\n\n        .m-tht { padding-top: 0.8rem; padding-bottom: 0.8rem; }\n        .m-tht::before, .m-tht::after { content: ''; position: absolute; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, var(--c-line), transparent); }\n        .m-tht::before { top: 0; } .m-tht::after { bottom: 0; }\n        .m-tht .s-dec { position: absolute; right: 0; bottom: -5px; width: 40px; height: 15px; }\n\n        .m-tit { font-family: var(--f-cn); font-size: 10px; color: var(--c-dim); letter-spacing: 1px; }\n        .m-val { font-size: clamp(10px, 2vw, 12px); color: var(--c-txt); letter-spacing: 1px; }\n\n        .r-col { display: flex; flex-direction: column; gap: 1.5rem; animation: sInR 1s cubic-bezier(0.1, 1, 0.1, 1) 0.1s both; }\n\n        .fc { position: relative; width: 100%; aspect-ratio: 1/1.1; perspective: 1200px; cursor: pointer; }\n        .fi { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }\n        .fi.act { transform: rotateY(180deg); }\n        .ff, .fb { position: absolute; inset: 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; background: var(--c-bg); }\n        .ff { z-index: 2; }\n        .fb { transform: rotateY(180deg); z-index: 1; }\n\n        .f1-ff { justify-content: center; align-items: flex-start; position: relative; padding: 10%; }\n        .f1-bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.15; pointer-events: none; z-index: 0; }\n        .id-tit { font-family: var(--f-cn); font-size: 10px; color: var(--c-dim); letter-spacing: 2px; z-index: 1; }\n        .id-val { font-family: var(--f-cn); font-size: clamp(28px, 6vw, 48px); font-weight: 900; line-height: 1; z-index: 1; margin: 10px 0; }\n        .id-code { font-family: var(--f-mono); font-size: 10px; color: var(--c-acc); z-index: 1; }\n\n        .f1-fb { position: relative; }\n        .fb-grid-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\n        .quad { position: absolute; display: flex; flex-direction: column; gap: 4px; }\n        .q-tl { top: 15%; left: 5%; }\n        .q-tr { top: 35%; right: 5%; align-items: flex-end; text-align: right; }\n        .q-bl { bottom: 35%; left: 5%; }\n        .q-br { bottom: 15%; right: 5%; align-items: flex-end; text-align: right; }\n        .q-lbl { font-family: var(--f-cn); font-size: 10px; color: var(--c-dim); letter-spacing: 1px; }\n        .q-val { font-size: clamp(12px, 2.5vw, 15px); font-weight: bold; letter-spacing: 1px; }\n\n        .fc2 { aspect-ratio: 1/1; }\n        .gx-wrap { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }\n        .gx-svg { width: 110%; height: 110%; transform-origin: center; }\n        .gx-txt { position: absolute; font-family: var(--f-mono); font-size: 9px; color: var(--c-dim); line-height: 1.2; }\n        .gt-tl { top: 0; left: 0; }\n        .gt-br { bottom: 0; right: 0; text-align: right; }\n\n        .rd-wrap { width: 100%; height: 100%; position: relative; }\n        .rd-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\n        .pt { position: absolute; display: flex; flex-direction: column; gap: 2px; }\n        .pt-tl { top: 8%; left: 5%; }\n        .pt-tr { top: 8%; right: 5%; align-items: flex-end; }\n        .pt-bl { bottom: 8%; left: 5%; }\n        .pt-br { bottom: 8%; right: 5%; align-items: flex-end; }\n\n        .mini-img-core {\n            position: relative;\n            width: 100%;\n            aspect-ratio: 2/1.2;\n            z-index: 10;\n        }\n        .mini-clip {\n            position: absolute;\n            inset: 0;\n            clip-path: polygon(10% 0, 100% 0, 100% calc(100% - 15%), calc(100% - 10%) 100%, 0 100%, 0 15%);\n            background: var(--c-mask);\n            overflow: hidden;\n        }\n        .mini-clip:hover { filter: brightness(1.1); }\n        .mini-svg-bd {\n            position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;\n            filter: drop-shadow(0 0 2px var(--c-glow));\n        }\n\n        @keyframes sInL { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes sInR { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes fl { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }\n        @keyframes pX { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.1); } }\n\n        @media (max-width: 768px) {\n            body { padding: 4vw; }\n            .hud-grid { gap: 5vw; }\n            .img-core { aspect-ratio: 2/3; }\n            .mini-img-core { aspect-ratio: 2/1; }\n            .pa { width: 15px; height: 3px; }\n            .fc { aspect-ratio: 1/1.3; }\n            .fc2 { aspect-ratio: 1/1.1; }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"hud-grid\">\n        <div class=\"l-col\">\n            <div class=\"img-core\">\n                <div class=\"img-clip\">\n                    <img class=\"c-img\" src=\"{{avatar}}\" alt=\"\">\n                </div>\n                <svg class=\"svg-bd\" preserveAspectRatio=\"none\" viewBox=\"0 0 100 100\">\n                    <polygon points=\"0,0 88,0 100,8 100,100 12,100 0,92\" fill=\"none\" stroke=\"var(--c-line)\" stroke-width=\"0.8\" vector-effect=\"non-scaling-stroke\"/>\n                </svg>\n                <div class=\"in-br\"><div class=\"brk tl\"></div><div class=\"brk br\"></div></div>\n                <div class=\"s-tz\"><div class=\"tz r1\"></div><div class=\"tz r2\"></div><div class=\"tz l1\"></div><div class=\"tz l2\"></div></div>\n                <div class=\"p-lst\"><div class=\"pa\"></div><div class=\"pa\"></div><div class=\"pa\"></div><div class=\"pa\"></div></div>\n                <div class=\"b-lbl\"><div class=\"l-r\">ID</div><div class=\"l-t\">{{name}}</div></div>\n                <div class=\"f-rects\">\n                    <div class=\"fr\" style=\"width:18px; height:8px; bottom:18%; left:15%; animation-delay:0s;\"></div>\n                    <div class=\"fr\" style=\"width:12px; height:6px; bottom:24%; left:8%; animation-delay:1s;\"></div>\n                    <div class=\"fr\" style=\"width:22px; height:10px; bottom:12%; left:25%; animation-delay:2s;\"></div>\n                </div>\n            </div>\n\n            <div class=\"h-mod m-mood\">\n                <svg class=\"s-dec\" viewBox=\"0 0 35 35\">\n                    <path d=\"M 35 0 L 15 0 M 35 0 L 35 20\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"1.5\"/>\n                    <circle cx=\"30\" cy=\"5\" r=\"2\" fill=\"var(--c-acc)\"/>\n                </svg>\n                <div class=\"m-tit\">心情</div>\n                <div class=\"m-val\">{{mood}}</div>\n            </div>\n\n            <div class=\"h-mod m-tht\">\n                <svg class=\"s-dec\" viewBox=\"0 0 60 20\">\n                    <polyline points=\"0,10 15,10 20,2 25,18 30,10 60,10\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/>\n                    <circle cx=\"60\" cy=\"10\" r=\"1.5\" fill=\"var(--c-txt)\"/>\n                </svg>\n                <div class=\"m-tit\">想法</div>\n                <div class=\"m-val\">{{thought}}</div>\n            </div>\n        </div>\n\n        <div class=\"r-col\">\n            <div class=\"fc\" onclick=\"this.querySelector('.fi').classList.toggle('act')\">\n                <div class=\"fi\">\n                    <div class=\"ff f1-ff\">\n                        <svg class=\"f1-bg-svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n                            <line x1=\"0\" y1=\"20\" x2=\"100\" y2=\"20\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"2 2\"/>\n                            <line x1=\"0\" y1=\"80\" x2=\"100\" y2=\"80\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"2 2\"/>\n                            <circle cx=\"85\" cy=\"50\" r=\"40\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/>\n                            <circle cx=\"85\" cy=\"50\" r=\"30\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"1 3\"/>\n                            <path d=\"M 70 50 L 100 50 M 85 35 L 85 65\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/>\n                            <rect x=\"5\" y=\"40\" width=\"2\" height=\"20\" fill=\"var(--c-txt)\"/>\n                            <rect x=\"10\" y=\"45\" width=\"2\" height=\"10\" fill=\"var(--c-txt)\"/>\n                            <rect x=\"15\" y=\"35\" width=\"2\" height=\"30\" fill=\"var(--c-txt)\"/>\n                        </svg>\n                        <div class=\"id-tit\">姓名</div>\n                        <div class=\"id-val\">{{name}}</div>\n                        <div class=\"id-code\">SEQ: 0x8F9A // STATUS: NULL</div>\n                    </div>\n                    <div class=\"fb f1-fb\">\n                        <svg class=\"fb-grid-svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n                            <path d=\"M 50 10 L 50 90 M 10 50 L 90 50\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                            <circle cx=\"50\" cy=\"50\" r=\"3\" fill=\"var(--c-txt)\"/>\n                            <path d=\"M 20 20 L 40 20 L 40 40\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                            <path d=\"M 80 80 L 60 80 L 60 60\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                        </svg>\n                        <div class=\"quad q-tl\"><span class=\"q-lbl\">年龄</span><span class=\"q-val\">{{age}}</span></div>\n                        <div class=\"quad q-tr\"><span class=\"q-lbl\">身高</span><span class=\"q-val\">{{height}}</span></div>\n                        <div class=\"quad q-bl\"><span class=\"q-lbl\">体重</span><span class=\"q-val\">{{weight}}</span></div>\n                        <div class=\"quad q-br\"><span class=\"q-lbl\">等级</span><span class=\"q-val\">{{level}}</span></div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"fc fc2\" onclick=\"this.querySelector('.fi').classList.toggle('act')\">\n                <div class=\"fi\">\n                    <div class=\"ff\">\n                        <div class=\"gx-wrap\">\n                            <div class=\"gx-txt gt-tl\">SEC_A9<br>ACTIVE</div>\n                            <div class=\"gx-txt gt-br\">ZOOM<br>1000X</div>\n                            <svg class=\"gx-svg\" viewBox=\"0 0 200 200\">\n                                <defs>\n                                    <radialGradient id=\"cGlow\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n                                        <stop offset=\"0%\" stop-color=\"var(--c-txt)\" stop-opacity=\"1\"/>\n                                        <stop offset=\"30%\" stop-color=\"var(--c-txt)\" stop-opacity=\"0.5\"/>\n                                        <stop offset=\"100%\" stop-color=\"var(--c-txt)\" stop-opacity=\"0\"/>\n                                    </radialGradient>\n                                </defs>\n                                <circle cx=\"100\" cy=\"100\" r=\"20\" fill=\"url(#cGlow)\"/>\n                                <circle cx=\"100\" cy=\"100\" r=\"5\" fill=\"var(--c-bg)\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/>\n                                <g transform=\"translate(100,100) rotate(20) translate(-100,-100)\">\n                                    <ellipse cx=\"100\" cy=\"100\" rx=\"70\" ry=\"20\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                                    <ellipse cx=\"100\" cy=\"100\" rx=\"70\" ry=\"20\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"1\" stroke-dasharray=\"2 8\">\n                                        <animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 100 100\" to=\"360 100 100\" dur=\"20s\" repeatCount=\"indefinite\"/>\n                                    </ellipse>\n                                    <g><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 100 100\" to=\"360 100 100\" dur=\"8s\" repeatCount=\"indefinite\"/><circle cx=\"170\" cy=\"100\" r=\"2\" fill=\"var(--c-txt)\"/></g>\n                                </g>\n                                <g transform=\"translate(100,100) rotate(-35) translate(-100,-100)\">\n                                    <ellipse cx=\"100\" cy=\"100\" rx=\"90\" ry=\"30\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.3\"/>\n                                    <g><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"360 100 100\" to=\"0 100 100\" dur=\"12s\" repeatCount=\"indefinite\"/><circle cx=\"10\" cy=\"100\" r=\"1.5\" fill=\"var(--c-txt)\"/><circle cx=\"10\" cy=\"100\" r=\"3\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.5\"/></g>\n                                </g>\n                                <circle cx=\"100\" cy=\"100\" r=\"95\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.3\" stroke-dasharray=\"3 3\"/>\n                            </svg>\n                        </div>\n                    </div>\n                    <div class=\"fb\">\n                        <div class=\"rd-wrap\">\n                            <svg class=\"rd-svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">\n                                <circle cx=\"50\" cy=\"50\" r=\"25\" fill=\"none\" stroke=\"var(--c-dim)\" stroke-width=\"0.5\"/>\n                                <circle cx=\"50\" cy=\"50\" r=\"15\" fill=\"none\" stroke=\"var(--c-txt)\" stroke-width=\"0.2\" stroke-dasharray=\"1 2\"/>\n                                <path d=\"M 50 20 L 50 35 M 50 65 L 50 80 M 20 50 L 35 50 M 65 50 L 80 50\" stroke=\"var(--c-txt)\" stroke-width=\"1\"/>\n                                <path d=\"M 25 25 L 40 40 M 75 25 L 60 40 M 25 75 L 40 60 M 75 75 L 60 60\" stroke=\"var(--c-dim)\" stroke-width=\"0.3\"/>\n                                <circle cx=\"50\" cy=\"50\" r=\"2\" fill=\"var(--c-txt)\"/>\n                            </svg>\n                            <div class=\"pt pt-tl\"><span class=\"q-lbl\">现居地</span><span class=\"q-val\">{{location}}</span></div>\n                            <div class=\"pt pt-tr\"><span class=\"q-lbl\">位置</span><span class=\"q-val\">{{position}}</span></div>\n                            <div class=\"pt pt-bl\"><span class=\"q-lbl\">季节</span><span class=\"q-val\">{{season}}</span></div>\n                            <div class=\"pt pt-br\"><span class=\"q-lbl\">天气</span><span class=\"q-val\">{{weather}}</span></div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"mini-img-core\">\n                <div class=\"mini-clip\">\n                    <img class=\"c-img\" src=\"{{avatar}}\" alt=\"\">\n                </div>\n                <svg class=\"mini-svg-bd\" preserveAspectRatio=\"none\" viewBox=\"0 0 100 100\">\n                    <polygon points=\"10,0 100,0 100,85 90,100 0,100 0,15\" fill=\"none\" stroke=\"var(--c-line)\" stroke-width=\"0.8\" vector-effect=\"non-scaling-stroke\"/>\n                </svg>\n                <div class=\"in-br\"><div class=\"brk tl\" style=\"width:10%;\"></div><div class=\"brk br\" style=\"width:10%;\"></div></div>\n            </div>\n        </div>\n    </div>\n</body>\n</html>";
const SB_BUILTIN_HTML_II = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">\n<title>Ⅱ</title>\n<style>\n\n    @import url(\"https://fontsapi.zeoseven.com/310/main/result.css\");\n\n    :root {\n        --mainFontFamily: \"NanoFullSong\", sans-serif;\n        --monoFontFamily: \"NanoFullSong\", monospace;\n\n        --fg-main: #111111;\n        --fg-muted: rgba(0, 0, 0, 0.5);\n        --line-dim: rgba(0, 0, 0, 0.15);\n        --line-glow: rgba(0, 0, 0, 0.8);\n        --accent: #000000;\n        --glass-bg: rgba(255, 255, 255, 0.1);\n    }\n\n    @media (prefers-color-scheme: dark) {\n        :root {\n            --fg-main: #ffffff;\n            --fg-muted: rgba(255, 255, 255, 0.5);\n            --line-dim: rgba(255, 255, 255, 0.15);\n            --line-glow: rgba(255, 255, 255, 0.8);\n            --accent: #ffffff;\n            --glass-bg: rgba(0, 0, 0, 0.1);\n        }\n    }\n\n    :root[data-theme=\"dark\"] {\n        --fg-main: #ffffff;\n        --fg-muted: rgba(255, 255, 255, 0.5);\n        --line-dim: rgba(255, 255, 255, 0.15);\n        --line-glow: rgba(255, 255, 255, 0.8);\n        --accent: #ffffff;\n        --glass-bg: rgba(0, 0, 0, 0.1);\n    }\n    :root[data-theme=\"light\"] {\n        --fg-main: #111111;\n        --fg-muted: rgba(0, 0, 0, 0.5);\n        --line-dim: rgba(0, 0, 0, 0.15);\n        --line-glow: rgba(0, 0, 0, 0.8);\n        --accent: #000000;\n        --glass-bg: rgba(255, 255, 255, 0.1);\n    }\n\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n\n    body {\n\n        background: transparent;\n        color: var(--fg-main);\n        font-family: var(--mainFontFamily);\n        -webkit-tap-highlight-color: transparent;\n        padding: 30px 16px;\n        overflow-x: hidden;\n    }\n\n    .hud-interface {\n        position: relative;\n        max-width: 480px;\n        margin: 0 auto;\n        display: flex;\n        flex-direction: column;\n        gap: 35px;\n    }\n\n    .master-axis {\n        position: absolute;\n        left: 24px; top: 0; bottom: 0;\n        width: 1px;\n        background: linear-gradient(to bottom, transparent, var(--line-dim) 5%, var(--line-dim) 95%, transparent);\n        z-index: 0;\n    }\n\n    .top-sys-header {\n        display: flex; justify-content: space-between; align-items: flex-end;\n        padding-left: 45px; position: relative;\n        font-family: var(--monoFontFamily);\n    }\n    .top-sys-header::before {\n        content: \"\"; position: absolute; left: 21px; bottom: 5px; width: 7px; height: 7px;\n        border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent);\n    }\n    .top-sys-header::after {\n        content: \"\"; position: absolute; left: 24px; bottom: 8px; width: 16px; height: 1px; background: var(--accent);\n    }\n    .sys-code { font-size: 10px; color: var(--fg-muted); letter-spacing: 2px; }\n    .sys-status { font-size: 9px; border: 1px solid var(--line-dim); padding: 2px 6px; border-radius: 2px; }\n\n    .bio-module {\n        position: relative; z-index: 2;\n        display: flex; gap: 16px; align-items: center;\n        padding-left: 20px;\n    }\n\n    .optic-lens {\n        position: relative;\n        width: 110px; height: 140px;\n        background: var(--glass-bg);\n        display: flex; justify-content: center; align-items: center;\n        flex-shrink: 0;\n        border: 1px solid var(--line-dim);\n        overflow: hidden;\n    }\n\n    .optic-lens::before, .optic-lens::after,\n    .optic-lens-inner::before, .optic-lens-inner::after {\n        content: \"\"; position: absolute; width: 12px; height: 12px;\n        border: 2px solid var(--fg-main); z-index: 6; pointer-events: none;\n    }\n    .optic-lens::before { top: 0; left: 0; border-right: none; border-bottom: none; }\n    .optic-lens::after { top: 0; right: 0; border-left: none; border-bottom: none; }\n    .optic-lens-inner { position: absolute; inset: 0; pointer-events: none; }\n    .optic-lens-inner::before { bottom: 0; left: 0; border-right: none; border-top: none; }\n    .optic-lens-inner::after { bottom: 0; right: 0; border-left: none; border-top: none; }\n\n    .scan-beam {\n        position: absolute; top: 0; left: 0; width: 100%; height: 2px;\n        background: var(--accent); opacity: 0.5; box-shadow: 0 0 5px var(--accent);\n        animation: scan-vertical 3s linear infinite; z-index: 5; pointer-events: none;\n    }\n\n    #avatar-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 4; }\n\n    .bio-data {\n        display: flex; flex-direction: column; justify-content: center;\n    }\n    .data-giant { margin-bottom: 12px; }\n    .lbl-micro { font-size: 8px; color: var(--fg-muted); font-family: var(--monoFontFamily); letter-spacing: 1px; display: block; margin-bottom: 2px; }\n    .val-giant { font-size: 24px; font-weight: bold; letter-spacing: 2px; line-height: 1; }\n    .data-row { display: flex; gap: 16px; position: relative; }\n\n    .data-row::after { content: \"\"; position: absolute; bottom: -8px; left: 0; width: 60%; height: 1px; background: var(--line-dim); }\n    .val-normal { font-size: 14px; font-weight: bold; }\n\n    .geo-module {\n        position: relative; z-index: 2;\n        padding-left: 45px;\n    }\n\n    .geo-module::before {\n        content: \"\"; position: absolute; left: 24px; top: 12px; width: 15px; height: 1px; background: var(--line-glow);\n    }\n\n    .radar-deco { position: absolute; right: 0; top: 0; width: 40px; height: 40px; opacity: 0.2; animation: spin-slow 10s linear infinite; pointer-events: none;}\n\n    .geo-grid {\n        display: grid; grid-template-columns: 1fr 1fr; gap: 20px 15px;\n    }\n    .geo-item { display: flex; flex-direction: column; }\n    .geo-item.full-width { grid-column: 1 / -1; }\n\n    .geo-val { font-size: 16px; font-weight: bold; position: relative; padding-top: 2px; }\n    .geo-item.full-width .geo-val { font-size: 20px; }\n\n    .psyche-module {\n        position: relative; z-index: 2;\n        padding-left: 45px;\n        display: flex; flex-direction: column; gap: 24px;\n    }\n    .psyche-module::before {\n        content: \"\"; position: absolute; left: 24px; top: 12px; width: 15px; height: 1px; background: var(--line-glow);\n    }\n\n    .psyche-header {\n        display: flex; justify-content: space-between; align-items: flex-end;\n        padding-bottom: 8px; border-bottom: 1px solid var(--line-dim);\n    }\n\n    .nano-eq { display: inline-flex; height: 10px; gap: 2px; margin-left: 6px; align-items: flex-end; }\n    .nano-eq span { width: 2px; background: var(--accent); animation: eq-updown 0.8s ease-in-out infinite alternate; }\n\n    .log-stream { position: relative; padding-left: 12px; border-left: 2px solid var(--line-dim); }\n    .log-item { margin-bottom: 20px; position: relative; }\n    .log-item:last-child { margin-bottom: 0; }\n\n    .log-item::before {\n        content: \"\"; position: absolute; left: -16px; top: 6px; width: 6px; height: 6px;\n        background: var(--bg); border: 2px solid var(--accent); border-radius: 50%;\n    }\n    .log-val { font-size: 14px; line-height: 1.6; color: var(--fg-main); margin-top: 6px; }\n\n    @keyframes scan-vertical { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.5; } 90% { opacity: 0.5; } 100% { top: 110%; opacity: 0; } }\n    @keyframes spin-slow { 100% { transform: rotate(360deg); } }\n    @keyframes eq-updown { 0% { height: 30%; } 100% { height: 100%; } }\n</style>\n</head>\n<body>\n\n<div class=\"hud-interface\">\n\n    <div class=\"master-axis\"></div>\n\n    <div class=\"top-sys-header\">\n        <span class=\"sys-code\" id=\"live-hash\">SYS.INIT // AWAITING_DATA</span>\n        <span class=\"sys-status\">ACTIVE</span>\n    </div>\n\n    <div class=\"bio-module\">\n        <div class=\"optic-lens\" id=\"optic-lens\">\n            <div class=\"optic-lens-inner\"></div>\n            <div class=\"scan-beam\"></div>\n            <img id=\"avatar-img\" src=\"{{avatar}}\" alt=\"AVATAR\">\n        </div>\n\n        <div class=\"bio-data\">\n            <div class=\"data-giant\">\n                <span class=\"lbl-micro\">IDENTIFIER [ 姓名 ]</span>\n                <span class=\"val-giant\">{{name}}</span>\n            </div>\n\n            <div class=\"data-row\">\n                <div>\n                    <span class=\"lbl-micro\">AGE [ 年龄 ]</span>\n                    <span class=\"val-normal\">{{age}}</span>\n                </div>\n                <div>\n                    <span class=\"lbl-micro\">GENDER [ 性别 ]</span>\n                    <span class=\"val-normal\">{{gender}}</span>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"geo-module\">\n\n        <svg class=\"radar-deco\" viewBox=\"0 0 100 100\">\n            <circle cx=\"50\" cy=\"50\" r=\"48\" fill=\"none\" stroke=\"var(--fg-muted)\" stroke-width=\"0.5\" stroke-dasharray=\"2 4\"/>\n            <circle cx=\"50\" cy=\"50\" r=\"30\" fill=\"none\" stroke=\"var(--accent)\" stroke-width=\"1\"/>\n            <line x1=\"50\" y1=\"0\" x2=\"50\" y2=\"100\" stroke=\"var(--fg-muted)\" stroke-width=\"0.5\"/>\n            <line x1=\"0\" y1=\"50\" x2=\"100\" y2=\"50\" stroke=\"var(--fg-muted)\" stroke-width=\"0.5\"/>\n            <circle cx=\"50\" cy=\"20\" r=\"2\" fill=\"var(--accent)\"/>\n        </svg>\n\n        <div class=\"geo-grid\">\n            <div class=\"geo-item full-width\">\n                <span class=\"lbl-micro\">CURRENT_LOC [ 所在地 ]</span>\n                <span class=\"geo-val\">{{position}}</span>\n            </div>\n            <div class=\"geo-item\">\n                <span class=\"lbl-micro\">RESIDENCE [ 现居地 ]</span>\n                <span class=\"geo-val\">{{location}}</span>\n            </div>\n            <div class=\"geo-item\">\n                <span class=\"lbl-micro\">WEATHER [ 天气 ]</span>\n                <span class=\"geo-val\">{{weather}}</span>\n            </div>\n            <div class=\"geo-item\">\n                <span class=\"lbl-micro\">DATE_SYNC [ 日期 ]</span>\n                <span class=\"geo-val\">{{date}}</span>\n            </div>\n            <div class=\"geo-item\">\n                <span class=\"lbl-micro\">SEASON [ 季节 ]</span>\n                <span class=\"geo-val\">{{season}}</span>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"psyche-module\">\n\n        <div class=\"psyche-header\">\n            <div>\n                <span class=\"lbl-micro\" style=\"display:inline;\">MOOD [ 心情 ]</span>\n                <div class=\"nano-eq\">\n                    <span style=\"animation-delay: 0s;\"></span>\n                    <span style=\"animation-delay: 0.2s;\"></span>\n                    <span style=\"animation-delay: 0.4s;\"></span>\n                    <span style=\"animation-delay: 0.1s;\"></span>\n                </div>\n                <div class=\"val-normal\" style=\"margin-top:2px;\">{{mood}}</div>\n            </div>\n            <div style=\"text-align: right;\">\n                <span class=\"lbl-micro\">OUTFIT [ 着装 ]</span>\n                <div class=\"val-normal\" style=\"margin-top:2px;\">{{outfit}}</div>\n            </div>\n        </div>\n\n        <div class=\"log-stream\">\n            <div class=\"log-item\">\n                <span class=\"lbl-micro\">> MOTTO // 格言</span>\n                <div class=\"log-val\">{{motto}}</div>\n            </div>\n            <div class=\"log-item\">\n                <span class=\"lbl-micro\">> THOUGHTS // 想法</span>\n                <div class=\"log-val\">{{thought}}</div>\n            </div>\n        </div>\n\n    </div>\n\n</div>\n\n<script>\n    function updateHash() {\n        const hex = Math.random().toString(16).substr(2, 6).toUpperCase();\n        document.getElementById('live-hash').textContent = `SYS.SYNC // 0x${hex}`;\n    }\n    setInterval(updateHash, 2000);\n</script>\n\n</body>\n</html>\n";

const SB_VAR_LABELS = {
  name:"姓名", mood:"心情", thought:"想法", age:"年龄", height:"身高", weight:"体重",
  location:"现居地", position:"位置", season:"季节", weather:"天气",
  gender:"性别", date:"日期", outfit:"着装", motto:"格言", level:"等级"
};
// 字卡库分类种子——首次使用即可见，方便直接绑定，不预置任何字卡内容
const SB_RESERVED_VARS = new Set(["avatar"]);
const SB_MIN_INTERVAL = 3600000, SB_MAX_INTERVAL = 86400000;
const SB_VAR_RE = /\{\{\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*\}\}/g;

let sbState = null;
let sbCards = [];
let sbSettingsSide = "self";
let sbViewerTicker = null;
let _sbSaveTimer = null, _sbSettingsRenderTimer = null;

function sbBuiltinPresetPair(side){
  return [
    { id:`p_${side}_I`,  name:"状态栏 Ⅰ", html:SB_BUILTIN_HTML_I,  bg:"", builtin:"I"  },
    { id:`p_${side}_II`, name:"状态栏 Ⅱ", html:SB_BUILTIN_HTML_II, bg:"", builtin:"II" }
  ];
}
function sbDefaultState(){
  return {
    // 我方默认用 Ⅰ、对方默认用 Ⅱ，二者互不影响，且都可在方案栏里自由切换成任意一种
    activePreset: { self:"p_self_I", opp:"p_opp_II" },
    presets: {
      self: sbBuiltinPresetPair("self"),
      opp:  sbBuiltinPresetPair("opp")
    },
    fields: { self:{}, opp:{} },
    bindings: { opp:{} },
    picked: { opp:{} },
    updateIntervalMs: SB_MIN_INTERVAL,
    lastRefresh: 0
  };
}
function sbClampInterval(ms){ ms=+ms||SB_MIN_INTERVAL; return Math.min(SB_MAX_INTERVAL, Math.max(SB_MIN_INTERVAL, ms)); }
function sbExtractVars(html){
  const set = new Set(); let m; SB_VAR_RE.lastIndex = 0;
  while((m = SB_VAR_RE.exec(html))){ if(!SB_RESERVED_VARS.has(m[1])) set.add(m[1]); }
  return [...set];
}
function sbActivePreset(side){
  const list = sbState.presets[side];
  const id = sbState.activePreset[side];
  return list.find(p=>p.id===id) || list[0];
}

async function sbSave(){ try{ await dbSet("statusbar", sbState); }catch(e){} }
function sbSaveDebounced(){ clearTimeout(_sbSaveTimer); _sbSaveTimer=setTimeout(sbSave,300); }
async function sbSaveCards(){ try{ await dbSet("sbCards", sbCards); }catch(e){} }

window.initStatusbar = async function(){
  let saved=null; try{ saved=await dbGet("statusbar",null); }catch(e){ saved=null; }
  const def = sbDefaultState();
  sbState = {
    activePreset: Object.assign({}, def.activePreset, saved && saved.activePreset || {}),
    presets: {
      self: (saved && saved.presets && saved.presets.self && saved.presets.self.length) ? saved.presets.self : def.presets.self,
      opp:  (saved && saved.presets && saved.presets.opp  && saved.presets.opp.length)  ? saved.presets.opp  : def.presets.opp
    },
    fields: {
      self: Object.assign({}, saved && saved.fields && saved.fields.self || {}),
      opp:  Object.assign({}, saved && saved.fields && saved.fields.opp  || {})
    },
    bindings: { opp: Object.assign({}, saved && saved.bindings && saved.bindings.opp || {}) },
    picked:   { opp: Object.assign({}, saved && saved.picked   && saved.picked.opp   || {}) },
    updateIntervalMs: sbClampInterval(saved && saved.updateIntervalMs),
    lastRefresh: (saved && saved.lastRefresh) || 0
  };
  if(!sbState.presets.self.find(p=>p.id===sbState.activePreset.self)) sbState.activePreset.self = sbState.presets.self[0].id;
  if(!sbState.presets.opp.find(p=>p.id===sbState.activePreset.opp))   sbState.activePreset.opp  = sbState.presets.opp[0].id;

  try{ sbCards = (await dbGet("sbCards",[])) || []; }catch(e){ sbCards = []; }

  const fpBg = document.getElementById("fpStatusbarBg");
  if(fpBg && !fpBg._sbBound){ fpBg._sbBound=true; fpBg.addEventListener("change", sbHandleBgUpload); }
  const fp = document.getElementById("fpStatusbar");
  if(fp && !fp._sbBound){ fp._sbBound=true; fp.addEventListener("change", sbHandleImport); }
  const fpCard = document.getElementById("fpSbCard");
  if(fpCard && !fpCard._sbBound){ fpCard._sbBound=true; fpCard.addEventListener("change", window.sbOnPickCardTxt); }
};

// ─── 取值 / 抽字卡库 ───
function sbResolveValue(side, key){
  if(side==="opp"){
    const cat = sbState.bindings.opp[key];
    if(cat){ const v=sbState.picked.opp[key]; return (v!==undefined && v!=="") ? v : "未定义"; }
  }
  const v = sbState.fields[side][key];
  return (v!==undefined && v!=="") ? v : "未定义";
}
function sbRollField(key){
  const cat = sbState.bindings.opp[key]; if(!cat) return;
  const pool = sbCards.filter(c=>c.cat===cat);
  sbState.picked.opp[key] = pool.length ? pool[Math.floor(Math.random()*pool.length)].text : "";
}
function sbRollAllBound(){ Object.keys(sbState.bindings.opp).forEach(sbRollField); }
function sbMaybeAutoRefresh(){
  if(!sbState) return;
  const now = Date.now();
  if(now - sbState.lastRefresh >= sbState.updateIntervalMs){
    sbRollAllBound(); sbState.lastRefresh = now; sbSaveDebounced();
  }
}

// ─── 渲染 ───
function sbBuildVarsMap(side, html){
  const vars = {};
  sbExtractVars(html).forEach(k=>{ vars[k]=sbResolveValue(side,k); });
  vars.avatar = imgs[side==="self"?"selfAvatar":"oppAvatar"] || window.DEFAULTS.PH_SVG;
  return vars;
}
function sbRenderHtml(side){
  const preset = sbActivePreset(side);
  const vars = sbBuildVarsMap(side, preset.html);
  let html = preset.html.replace(SB_VAR_RE, (m,k)=>escapeHtml(vars[k]!==undefined?vars[k]:"未定义"));
  // 将 App 当前的日/夜间模式显式写入 iframe 的 <html> 标签，
  // 使状态栏配色跟随 App 内设置的主题，而非系统 prefers-color-scheme
  // （二者不一致时会导致内置模板配色对比度错误、文字看不清）。
  const appTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  html = /<html[^>]*>/i.test(html)
    ? html.replace(/<html([^>]*)>/i, (m,attrs)=> attrs.includes("data-theme")
        ? m.replace(/data-theme="[^"]*"/i, `data-theme="${appTheme}"`)
        : `<html${attrs} data-theme="${appTheme}">`)
    : `<html data-theme="${appTheme}">${html}</html>`;
  if(preset.bg){
    const bg = `<style>html,body{background-image:url("${preset.bg.replace(/"/g,"&quot;")}") !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;}</style>`;
    html = html.includes("</head>") ? html.replace("</head>", bg+"</head>") : bg+html;
  }
  // 上报内容真实高度给父页面，供聊天内弹层按实际内容自适应窗口高度（而非固定尺寸留白）
  const heightReporter = `<script>(function(){function r(){try{parent.postMessage({__sbHeight:document.documentElement.scrollHeight},"*");}catch(e){}}if(document.readyState==="complete")r();else window.addEventListener("load",r);try{new ResizeObserver(r).observe(document.documentElement);}catch(e){}setTimeout(r,300);setTimeout(r,1000);})();</script>`;
  html = html.includes("</body>") ? html.replace("</body>", heightReporter+"</body>") : html+heightReporter;
  return html;
}
function sbMountFrame(wrap, side){
  if(!wrap) return;
  wrap.innerHTML = `<iframe class="sb-frame" sandbox="allow-scripts" loading="lazy"></iframe>`;
  wrap.querySelector("iframe").srcdoc = sbRenderHtml(side);
}

// ─── 聊天头像：观赏性弹层（不经过 App 切换，独立挂载单个 iframe）───
window.openStatusbarViewer = function(side){
  if(!sbState) return;
  window.sbCloseViewer();
  sbMaybeAutoRefresh();
  const mask = document.createElement("div");
  mask.className = "sb-viewer-mask";
  mask.addEventListener("click", e=>{ if(e.target===mask) window.sbCloseViewer(); });
  mask.innerHTML = `
    <div class="sb-viewer-card">
      <button class="sb-viewer-close" onclick="window.sbCloseViewer()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
      </button>
      <div class="sb-viewer-frame-wrap"></div>
    </div>`;
  (document.getElementById("vp") || document.body).appendChild(mask);
  sbMountFrame(mask.querySelector(".sb-viewer-frame-wrap"), side);
  const card = mask.querySelector(".sb-viewer-card");
  const iframe = mask.querySelector("iframe");
  const onMsg = (e)=>{
    if(!e.data || typeof e.data.__sbHeight !== "number") return;
    if(e.source !== iframe.contentWindow) return;
    const h = Math.max(240, Math.min(e.data.__sbHeight + 2, Math.round(window.innerHeight*0.82), 680));
    card.style.height = h + "px";
  };
  window.addEventListener("message", onMsg);
  mask._sbMsgHandler = onMsg;
  requestAnimationFrame(()=>mask.classList.add("on"));
  sbViewerTicker = setInterval(()=>sbMaybeAutoRefresh(), 60000);
};
window.sbCloseViewer = function(){
  const mask = document.querySelector(".sb-viewer-mask");
  if(sbViewerTicker){ clearInterval(sbViewerTicker); sbViewerTicker=null; }
  if(!mask) return;
  if(mask._sbMsgHandler) window.removeEventListener("message", mask._sbMsgHandler);
  mask.classList.remove("on");
  setTimeout(()=>mask.remove(), 220);
};

// ─── 年鉴内设置面板 ───
window.renderStatusbarSettings = function(){
  const root = document.getElementById("sbSettingsRoot");
  if(!root || !sbState) return;
  const side = sbSettingsSide;
  const preset = sbActivePreset(side);
  const presetChips = sbState.presets[side].map(p=>`
    <button class="sb-chip ${p.id===preset.id?'on':''}" onclick="window.sbSetActivePreset('${side}','${p.id}')">${escapeHtml(p.name)}</button>
  `).join("") + `<button class="sb-chip sb-chip-add" onclick="window.sbCreatePreset('${side}')" title="新建方案">＋</button>`;

  root.innerHTML = `
    <div class="sb-side-switch">
      <button class="sb-side-opt ${side==='self'?'on':''}" onclick="window.sbSwitchSettingsSide('self')">我方</button>
      <button class="sb-side-opt ${side==='opp'?'on':''}" onclick="window.sbSwitchSettingsSide('opp')">对方</button>
    </div>

    <div class="sb-preview-wrap"><div class="sb-frame-wrap" id="sbSettingsPreview"></div></div>

    <div class="sb-card">
      <div class="sb-sec-label">方案</div>
      <div class="sb-chip-row">${presetChips}</div>
      <div class="sb-preset-ops">
        <input class="fld sb-preset-name" id="sbPresetName" value="${escapeAttr(preset.name)}" placeholder="方案名称" onchange="window.sbRenamePreset('${side}',this.value)">
        <button class="pill-btn ghost" onclick="window.sbDuplicatePreset('${side}')">复制</button>
        <button class="pill-btn danger" onclick="window.sbDeletePreset('${side}')">删除</button>
      </div>
    </div>

    <div class="sb-card">
      <div class="sb-sec-label">背景</div>
      <div class="sb-bg-row">
        <div class="sb-bg-thumb" style="${preset.bg?`background-image:url('${preset.bg}')`:''}" onclick="document.getElementById('fpStatusbarBg').click()">${preset.bg?'':'<span class="sb-bg-thumb-tip">＋</span>'}</div>
        <div class="sb-bg-ops">
          <button class="pill-btn ghost" onclick="document.getElementById('fpStatusbarBg').click()">换背景</button>
          ${preset.bg?`<button class="pill-btn ghost" onclick="window.sbClearBg()">去除背景</button>`:''}
        </div>
      </div>
    </div>

    <div class="sb-card">
      <div class="sb-sec-label">字段内容</div>
      <div class="sb-field-list">${sbFieldRowsHtml(side, preset)}</div>
    </div>

    <div class="sb-card">
      <div class="sb-sec-label">HTML 源码</div>
      <textarea id="sbHtmlArea" class="sb-html-area" spellcheck="false">${escapeHtml(preset.html)}</textarea>
      <div class="sb-editor-actions">
        <button class="pill-btn" onclick="window.sbSaveHtml()">保存 HTML</button>
      </div>
    </div>

    <div class="sb-card">
      <div class="sb-sec-label">系统设置</div>
      <div class="sb-set-row">
        <span>换卡间隔</span>
        <div class="sb-set-ctl">
          <input type="range" min="1" max="24" step="1" value="${Math.round(sbState.updateIntervalMs/3600000)}" oninput="window.sbSetInterval(this.value)">
          <span id="sbIntervalDisp">${Math.round(sbState.updateIntervalMs/3600000)}h</span>
        </div>
      </div>
      <div class="sb-set-row sb-set-actions">
        <button class="pill-btn ghost" onclick="window.sbExport()">导出</button>
        <button class="pill-btn ghost" onclick="document.getElementById('fpStatusbar').click()">导入</button>
        <button class="pill-btn danger" onclick="window.sbResetAll()">重置</button>
      </div>
    </div>
  `;
  sbMountFrame(document.getElementById("sbSettingsPreview"), side);
};

function sbFieldRowsHtml(side, preset){
  const keys = sbExtractVars(preset.html);
  if(!keys.length) return `<div class="sb-empty-tip">—</div>`;
  return keys.map(key=>{
    const label = SB_VAR_LABELS[key] || key;
    if(side==="self"){
      const val = sbState.fields.self[key] || "";
      return `<div class="sb-field-row">
        <span class="sb-field-lbl">${escapeHtml(label)}</span>
        <input class="fld sb-field-input" value="${escapeAttr(val)}" placeholder="未定义" oninput="window.sbSetField('self','${key}',this.value)">
      </div>`;
    }
    const bound = sbState.bindings.opp[key];
    const val = sbState.fields.opp[key] || "";
    return `<div class="sb-field-row">
      <span class="sb-field-lbl">${escapeHtml(label)}</span>
      <div class="sb-field-ctl">
        <select class="fld sb-mode-select" onchange="window.sbSetBindMode('${key}', this.value)">
          <option value="" ${!bound?"selected":""}>自定义</option>
          <option value="__cat__" ${bound?"selected":""}>字卡库</option>
        </select>
        ${bound
          ? `<select class="fld sb-cat-select" onchange="window.sbSetBindCat('${key}', this.value)">${sbCatOptions(bound)}</select>
             <button class="sb-reroll-btn" onclick="window.sbRerollField('${key}')">⟳</button>`
          : `<input class="fld sb-field-input" value="${escapeAttr(val)}" placeholder="未定义" oninput="window.sbSetField('opp','${key}',this.value)">`
        }
      </div>
    </div>`;
  }).join("");
}
function sbCatOptions(selected){
  const cats = sbAllCats();
  if(!cats.length) return `<option value="">—</option>`;
  return cats.map(c=>`<option value="${escapeAttr(c)}" ${c===selected?"selected":""}>${escapeHtml(c)}</option>`).join("");
}

function sbScheduleSettingsRerender(){
  clearTimeout(_sbSettingsRenderTimer);
  _sbSettingsRenderTimer = setTimeout(()=>window.renderStatusbarSettings(), 350);
}

window.sbSwitchSettingsSide = function(side){ sbSettingsSide=side; window.renderStatusbarSettings(); };

window.sbSetActivePreset = function(side, id){
  sbState.activePreset[side]=id; sbSave(); window.renderStatusbarSettings();
};
window.sbCreatePreset = function(side){
  const name = prompt("方案名称","新方案"); if(name===null) return;
  const base = sbActivePreset(side);
  const id = "p_"+side+"_"+Date.now();
  sbState.presets[side].push({ id, name: name.trim()||"新方案", html: base.html, bg:"" });
  sbState.activePreset[side]=id; sbSave(); window.renderStatusbarSettings();
};
window.sbDuplicatePreset = function(side){
  const base = sbActivePreset(side);
  const id = "p_"+side+"_"+Date.now();
  sbState.presets[side].push({ id, name: base.name+" 副本", html: base.html, bg: base.bg });
  sbState.activePreset[side]=id; sbSave(); window.renderStatusbarSettings();
};
window.sbRenamePreset = function(side, name){
  const preset = sbActivePreset(side);
  preset.name = (name||"").trim() || preset.name;
  sbSaveDebounced();
};
window.sbDeletePreset = function(side){
  if(sbState.presets[side].length<=1) { toast("至少保留一个方案"); return; }
  if(!confirm("删除当前方案？")) return;
  const preset = sbActivePreset(side);
  sbState.presets[side] = sbState.presets[side].filter(p=>p.id!==preset.id);
  sbState.activePreset[side] = sbState.presets[side][0].id;
  sbSave(); window.renderStatusbarSettings();
};

window.sbSetField = function(side, key, val){
  sbState.fields[side][key]=val; sbSaveDebounced();
  clearTimeout(_sbSettingsRenderTimer);
  _sbSettingsRenderTimer = setTimeout(()=>{ const w=document.getElementById("sbSettingsPreview"); if(w) sbMountFrame(w, side); }, 350);
};
window.sbSetBindMode = function(key, mode){
  if(mode==="__cat__"){
    const cats=sbAllCats();
    const label=SB_VAR_LABELS[key];
    sbState.bindings.opp[key]=(label && cats.includes(label)) ? label : (cats[0]||""); sbRollField(key);
  } else { delete sbState.bindings.opp[key]; delete sbState.picked.opp[key]; }
  sbSave(); window.renderStatusbarSettings();
};
window.sbSetBindCat = function(key, cat){
  sbState.bindings.opp[key]=cat; sbRollField(key); sbSave(); window.renderStatusbarSettings();
};
window.sbRerollField = function(key){ sbRollField(key); sbSave(); window.renderStatusbarSettings(); };

window.sbSetInterval = function(hours){
  sbState.updateIntervalMs = sbClampInterval((+hours||1)*3600000);
  const disp=document.getElementById("sbIntervalDisp"); if(disp) disp.innerText=hours+"h";
  sbSaveDebounced();
};

window.sbSaveHtml = function(){
  const el=document.getElementById("sbHtmlArea"); if(!el) return;
  sbActivePreset(sbSettingsSide).html = el.value;
  sbSave(); window.renderStatusbarSettings();
};
window.sbClearBg = function(){
  sbActivePreset(sbSettingsSide).bg=""; sbSave(); window.renderStatusbarSettings();
};
function sbHandleBgUpload(e){
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{
    sbActivePreset(sbSettingsSide).bg = ev.target.result;
    sbSave(); window.renderStatusbarSettings();
  };
  r.readAsDataURL(f);
}

window.sbResetAll = function(){
  if(!confirm("重置状态栏系统？所有方案、绑定与自定义内容都会被清空。")) return;
  sbState = sbDefaultState(); sbSave(); window.renderStatusbarSettings(); toast("已重置");
};
window.sbExport = function(){
  const data = JSON.stringify({ presets:sbState.presets, activePreset:sbState.activePreset, fields:sbState.fields, bindings:sbState.bindings, updateIntervalMs:sbState.updateIntervalMs });
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([data],{type:"application/json;charset=utf-8"}));
  a.download=`状态栏_${Date.now()}.json`; a.click();
};
function sbHandleImport(e){
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const r=new FileReader();
  r.onload=async ev=>{
    try{
      const obj=JSON.parse(ev.target.result);
      if(obj.presets){
        if(obj.presets.self && obj.presets.self.length) sbState.presets.self = obj.presets.self;
        if(obj.presets.opp  && obj.presets.opp.length)  sbState.presets.opp  = obj.presets.opp;
      }
      if(obj.activePreset) Object.assign(sbState.activePreset, obj.activePreset);
      if(!sbState.presets.self.find(p=>p.id===sbState.activePreset.self)) sbState.activePreset.self=sbState.presets.self[0].id;
      if(!sbState.presets.opp.find(p=>p.id===sbState.activePreset.opp))   sbState.activePreset.opp =sbState.presets.opp[0].id;
      if(obj.fields){
        if(obj.fields.self) Object.assign(sbState.fields.self, obj.fields.self);
        if(obj.fields.opp)  Object.assign(sbState.fields.opp,  obj.fields.opp);
      }
      if(obj.bindings && obj.bindings.opp) Object.assign(sbState.bindings.opp, obj.bindings.opp);
      if(obj.updateIntervalMs) sbState.updateIntervalMs = sbClampInterval(obj.updateIntervalMs);
      sbRollAllBound();
      await sbSave();
      toast("导入成功");
      window.renderStatusbarSettings();
    }catch(err){ toast("文件格式有误"); }
  };
  r.readAsText(f,"utf-8");
}

// ─── 字卡库：状态栏专属标签栏 ───
let sbBatchSelecting = false, sbSelected = [];
function sbAllCats(){ return [...new Set(sbCards.map(c=>c.cat))]; }
window.renderSbCards = function(){
  const deck = document.getElementById("sbCardDeck"); if(!deck) return;
  const q = (document.getElementById("sbCardSearch")?.value||"").trim().toLowerCase();
  const m = {};
  sbCards.forEach(c=>{ (m[c.cat]=m[c.cat]||[]).push(c); });
  const catList = Object.keys(m);
  deck.innerHTML = "";
  let shown = 0;
  catList.forEach(cat=>{
    const filtered = m[cat].filter(c=>!q||c.text.toLowerCase().includes(q)||cat.toLowerCase().includes(q));
    if(!filtered.length) return;
    shown++;
    const card = document.createElement("div"); card.className="cat-card";
    let h = `<div class="cat-h" data-cat="${escapeHtml(cat)}">
      <div class="n" onclick="window.sbRenameCat('${escapeAttr(cat)}')">${escapeHtml(cat)}<span style="opacity:.4;font-weight:400;margin-left:4px;font-size:10px;">${filtered.length}</span></div>
      <div class="ops" onclick="event.stopPropagation()"><span class="danger" onclick="window.sbDeleteCat('${escapeAttr(cat)}')">删</span></div>
    </div><div class="cat-body">`;
    filtered.forEach(c=>{
      const chkHtml = sbBatchSelecting ? `<input type="checkbox" class="chk" ${sbSelected.includes(c.id)?"checked":""} onchange="window.sbSelToggle('${c.id}',this.checked)">` : "";
      h += `<div class="card-item">
        ${chkHtml}
        <div class="text" onclick="${sbBatchSelecting?"":`window.sbEditCard('${c.id}')`}">${escapeHtml(c.text)}</div>
        <div class="ops"><span class="danger" onclick="window.sbDeleteCard('${c.id}')">删</span></div>
      </div>`;
    });
    h += `</div>`;
    card.innerHTML = h; deck.appendChild(card);
  });
  if(!shown){ deck.innerHTML=`<div class="empty-tip" style="padding:40px;text-align:center;">状态栏字卡库此时空空如也</div>`; }
  window.sbUpdateBatchBar && window.sbUpdateBatchBar();
};

// ── 新增：单条 / 批量 ──
window.sbOpenAddCard = function(){
  const cats = sbAllCats();
  const opts = cats.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("");
  window._sbAddMode = "single";
  modal("状态栏字卡", `
    <div class="add-mode-switch">
      <button class="ams-opt on" id="sbAmsSingle" onclick="window.sbSetAddMode('single')">单独</button>
      <button class="ams-opt" id="sbAmsBulk" onclick="window.sbSetAddMode('bulk')">批量</button>
    </div>
    <div id="sbAddSingle">
      <textarea class="fld area" id="sb_ac_text" placeholder="内容"></textarea>
      <select class="fld" id="sb_ac_cat"><option value="">— 选择分类 —</option>${opts}</select>
      <input class="fld" id="sb_ac_new" placeholder="或新建分类（如 心情 / 季节）">
    </div>
    <div id="sbAddBulk" style="display:none;">
      <textarea class="fld area" id="sb_ac_bulk" style="min-height:140px;"></textarea>
    </div>
    <button class="pill-btn" id="sbAddSubmit" onclick="window.sbAddCardConfirm()">加入</button>
  `);
};
window.sbSetAddMode = function(mode){
  window._sbAddMode = mode;
  const single=document.getElementById("sbAddSingle"), bulk=document.getElementById("sbAddBulk"), submit=document.getElementById("sbAddSubmit");
  document.getElementById("sbAmsSingle")?.classList.toggle("on", mode==="single");
  document.getElementById("sbAmsBulk")?.classList.toggle("on", mode==="bulk");
  if(single) single.style.display = mode==="single" ? "" : "none";
  if(bulk) bulk.style.display = mode==="bulk" ? "" : "none";
  if(submit) submit.textContent = mode==="bulk" ? "导入" : "加入";
};
function sbParseBulkText(raw){
  let cur="未命名", n=0, out=[];
  raw.split("\n").forEach(line=>{
    const t=line.trim(); if(!t) return;
    const mm=t.match(/^【(.+)】$/);
    if(mm){ cur=mm[1].trim(); return; }
    out.push({ id:"sbc"+Date.now()+(n++), text:t, cat:cur });
  });
  return out;
}
window.sbAddCardConfirm = async function(){
  if(window._sbAddMode==="bulk"){
    const raw = document.getElementById("sb_ac_bulk").value;
    const parsed = sbParseBulkText(raw);
    if(!parsed.length) return;
    sbCards.push(...parsed);
  } else {
    const text = document.getElementById("sb_ac_text").value.trim();
    const cat = (document.getElementById("sb_ac_new").value.trim() || document.getElementById("sb_ac_cat").value || "未命名");
    if(!text) return;
    sbCards.push({ id:"sbc"+Date.now(), text, cat });
  }
  await sbSaveCards();
  window.renderSbCards();
  closeModal();
};

// ── 编辑 / 重命名分类 ──
window.sbEditCard = function(id){
  const c = sbCards.find(x=>x.id===id); if(!c) return;
  const cats = sbAllCats();
  const opts = cats.map(cat=>`<option value="${escapeAttr(cat)}" ${cat===c.cat?"selected":""}>${escapeHtml(cat)}</option>`).join("");
  modal("编辑字卡", `
    <textarea class="fld area" id="sb_ec_text">${escapeHtml(c.text)}</textarea>
    <select class="fld" id="sb_ec_cat">${opts}</select>
    <input class="fld" id="sb_ec_new" placeholder="或新建分类">
    <button class="pill-btn" onclick="window.sbSaveCardEdit('${id}')">保存</button>
  `);
};
window.sbSaveCardEdit = async function(id){
  const c = sbCards.find(x=>x.id===id); if(!c) return;
  const text = document.getElementById("sb_ec_text").value.trim();
  const cat = document.getElementById("sb_ec_new").value.trim() || document.getElementById("sb_ec_cat").value || c.cat;
  if(!text) return;
  c.text = text; c.cat = cat;
  await sbSaveCards();
  window.renderSbCards();
  closeModal();
};
window.sbRenameCat = function(cat){
  const name = prompt("分类名称", cat); if(name===null) return;
  const trimmed = name.trim(); if(!trimmed || trimmed===cat) return;
  sbCards.forEach(c=>{ if(c.cat===cat) c.cat=trimmed; });
  sbSaveCards().then(()=>window.renderSbCards());
};

window.sbDeleteCard = async function(id){
  sbCards = sbCards.filter(c=>c.id!==id);
  await sbSaveCards();
  window.renderSbCards();
};
window.sbDeleteCat = async function(cat){
  if(!confirm("删除该分类下的全部状态栏字卡？")) return;
  sbCards = sbCards.filter(c=>c.cat!==cat);
  await sbSaveCards();
  window.renderSbCards();
};

// ── 批量选择 ──
window.sbToggleBatchMode = function(){
  sbBatchSelecting = !sbBatchSelecting;
  const btn = document.querySelector("#cstab-statusbar .batch-toggle-btn") || document.querySelector(".batch-toggle-btn");
  if(btn) btn.style.opacity = sbBatchSelecting ? "1" : ".5";
  if(!sbBatchSelecting) sbSelected = [];
  window.renderSbCards();
};
window.sbSelToggle = function(id, v){
  if(v){ if(!sbSelected.includes(id)) sbSelected.push(id); }
  else sbSelected = sbSelected.filter(x=>x!==id);
  window.sbUpdateBatchBar();
};
window.sbToggleSelectAll = function(){
  const visibleIds = sbCards.map(c=>c.id);
  const allSelected = visibleIds.length>0 && visibleIds.every(id=>sbSelected.includes(id));
  sbSelected = allSelected ? [] : visibleIds.slice();
  window.renderSbCards();
};
window.sbUpdateBatchBar = function(){
  const bar = document.getElementById("sbBatchBar"); if(!bar) return;
  bar.classList.toggle("on", sbBatchSelecting);
  const cnt = document.getElementById("sbBatchCnt");
  if(cnt) cnt.textContent = sbSelected.length ? `已选 ${sbSelected.length}` : "选择字卡";
};
window.sbBatchDelete = async function(){
  if(!sbSelected.length) return;
  sbCards = sbCards.filter(c=>!sbSelected.includes(c.id));
  sbSelected = [];
  await sbSaveCards();
  window.renderSbCards();
};

// ── 导出 / 导入 ──
window.sbExportCards = function(){
  const mm = {};
  sbCards.forEach(c=>{ (mm[c.cat]=mm[c.cat]||[]).push(c.text); });
  let s = "";
  for(const k in mm) s += `【${k}】\n` + mm[k].join("\n") + "\n\n";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([s],{type:"text/plain;charset=utf-8"}));
  a.download = `状态栏字卡_${Date.now()}.txt`;
  a.click();
  closeModal();
};
window.sbOnPickCardTxt = function(e){
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = async ev => {
    const parsed = sbParseBulkText(ev.target.result);
    if(!parsed.length) return;
    modal("导入方式", `<div style="font-size:calc(var(--fs)*.88);color:var(--text-mute);margin-bottom:14px;">共 <b style="color:var(--text)">${parsed.length}</b> 条</div>
      <div class="pill-btn-group" style="flex-direction:column;gap:8px;">
        <button class="pill-btn" onclick="window.sbDoImport('append')">追加新增</button>
        <button class="pill-btn danger" onclick="window.sbDoImport('replace')">清空原有，全部覆盖</button>
      </div>`);
    window._sbPendingImport = parsed;
  };
  r.readAsText(f);
  e.target.value = "";
};
window.sbDoImport = async function(mode){
  const incoming = window._sbPendingImport || [];
  sbCards = mode==="replace" ? incoming : sbCards.concat(incoming);
  window._sbPendingImport = null;
  await sbSaveCards();
  window.renderSbCards();
  closeModal();
};
