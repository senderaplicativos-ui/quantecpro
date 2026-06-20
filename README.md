# QUANTEC® PRO — Landing Page

Landing page de alta conversão para o **QUANTEC® PRO**, tecnologia alemã de biocomunicação informacional para pessoas, empresas e pets.

> Estrutura e copy seguem o briefing em `referências/prompt-lovable-quantec-pro.md`.

---

## ✨ Recursos

- 🎨 **Identidade visual fiel**: navy profundo + champagne/gold, tipografia Cormorant Garamond + Inter
- 🌊 **Background quântico animado**: ondas senoidais em canvas (gold + azul) com glow
- 💎 **Diamante orbital** no hero, com 3 frames rotacionando e núcleo pulsante
- 📱 **Mobile-first**: botão WhatsApp sticky sempre visível no mobile
- 🔁 **CTAs repetidos** em 3+ pontos da página
- 📊 **Pricing com destaque**: card de 3 meses com badge "Mais escolhido"
- 🪟 **Tabs interativas** (Pessoa / Empresa / Pet) com mídia e lista de benefícios
- 👁️ **Scroll reveal** em todas as seções
- 🔗 **Links WhatsApp pré-preenchidos** com mensagem dinâmica por plano
- ♿ **Acessível**: ARIA, foco visível, `prefers-reduced-motion` respeitado

---

## 🗂 Estrutura

```
quantecpro/
├── index.html              # Página completa
├── package.json            # Apenas o script "start" (npx serve)
├── public/
│   └── images/             # Imagens do produto + referências
│       ├── hero.jpeg
│       ├── device.jpeg
│       ├── pessoa.jpg
│       ├── pet.jpg
│       ├── energia.jpg
│       ├── campo.jpg
│       └── waves.png
├── src/
│   ├── css/styles.css      # Estilos completos
│   └── js/main.js          # Canvas, tabs, scroll, sticky CTA
└── referências/            # (pode ser removido no deploy)
    └── prompt-lovable-quantec-pro.md
```

---

## 🚀 Como rodar

Não há build. É um site estático (HTML + CSS + JS puro).

### Opção 1 — Servir localmente (recomendado)

```bash
npm start
# ou
npx serve .
```

Abre em: <http://localhost:3000>

### Opção 2 — Abrir direto no navegador

Dá pra abrir o `index.html` direto no Chrome/Edge, mas a página usa paths absolutos (`/public/...`), então a Opção 1 é mais confiável.

### Opção 3 — Publicar

Hospedagem recomendada:
- **Vercel** (`vercel deploy` — zero config)
- **Netlify** (drag-and-drop a pasta)
- **GitHub Pages** (branch `gh-pages` ou `main` + `/`)

---

## 🔧 Customização rápida

| O quê | Onde |
|---|---|
| Preços dos planos | [index.html](index.html) — procure por `R$ 497`, `R$ 897`, `R$ 1.197` |
| Descontos | [index.html](index.html) — `10% off` e `20% off` |
| Número de WhatsApp | Busque por `558197720244` em [index.html](index.html) |
| Cores | [src/css/styles.css](src/css/styles.css) — bloco `:root` no topo |
| Textos | Todos no [index.html](index.html) |
| Velocidade das ondas | [src/js/main.js](src/js/main.js) — função `makeWave` |

---

## 📋 Seções implementadas

1. **Header fixo** com logo, nav e CTA WhatsApp
2. **Hero** — headline, sub, prova rápida, CTA, diamante orbital animado
3. **Galeria** — 4 imagens em grid assimétrico com hover zoom
4. **O que é** — 3 cards (Análise, Programação, Emissão Remota)
5. **Como funciona** — 4 passos numerados com linha conectora
6. **Para quem é** — Tabs (Pessoa, Empresa, Pet) com imagem e bullets
7. **O que você recebe** — 5 itens com check
8. **Planos** — 1 / 2 / 3 meses (3 meses destacado com badge)
9. **Disclaimer** — aviso sobre natureza complementar
10. **CTA final** — seção com imagem de fundo
11. **Footer** — assinatura da marca
12. **Sticky WhatsApp** — botão fixo no mobile (some perto do footer)

---

## 🎯 Princípios de conversão aplicados

- **Clareza** acima de tudo: copy direto, sem jargão místico
- **Prova rápida** logo no hero (pessoas/empresas/pets, a cada 3h, remoto)
- **Escaneabilidade**: bullets, cards, ícones, espaçamento generoso
- **Hierarquia visual**: card de 3 meses maior e com cor de destaque
- **Fricção zero para o CTA**: WhatsApp pré-preenchido, 1 toque pra mandar mensagem
- **Âncoras emocionais** ("informação diferente", "potencial máximo", "campo informacional") com **disclaimer ético** visível

---

© QUANTEC® • Tecnologia que transforma
