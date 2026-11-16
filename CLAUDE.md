# Goldenmayhem studio notes (read first)

## Making characters / art with ChatGPT (owner's standing preference)
Whenever a game needs new characters (pawns, monsters, heroes, avatars, enemies), offer to make them in a batch
and give the owner ONE message to paste into ChatGPT that creates all of them at once:

1. The full prompt with a `Characters: [1. ___, 2. ___, 3. ___, 4. ___, 5. ___]` placeholder.
2. Then the line `Run it 5 times with these fills:` followed by 5 lines, each line = 5 characters.

ChatGPT then makes 5 images in one go (25 characters). Rules that worked:
- Layout 5×5 grid, 1536×1536. Each ROW = one character; columns = the variants
  (for Ludora pawns: RED, GREEN, YELLOW, BLUE, WHITE, every row must include blue).
- Colour covers the main body/outfit, not just small parts; base is the same colour; white version = white/silver with gold trim.
- Glossy 2.5D mobile-game style, clean dark outline (#170F45), light from the top left, chunky and readable at small size.
- Wide empty space around every figure, nothing touching another figure or the edge.
- One plain flat light gray (#D9D9D9) background, no shadows, no borders, no text, no logos,
  not based on any existing game, film, brand or character (all art must be fully original).
- Tiers: Rare = cute/simple; Epic = armour/gear + one small glow effect, base with gold rim;
  Legendary = majestic, soft aura, ornate gold base with a gem.
- Never repeat characters the owner already has; skip duplicates they send.

Cutting tools: `ludora-dice/tools/ui-art/` (`cutgrid.py` even grids, `holes.py` removes gray pockets),
`gloamwood/design/upgrade-preview/tools/cutgray.py`.

## Working with the owner
- Non-programmer: plain language. Show a PREVIEW before building anything into a game, unless told to apply directly.
- Never put keystores, passwords or tokens in files or replies; the owner signs builds and enters passwords themselves.
- Studio email used in games: goldenmayhem.games@gmail.com
- Ads: rewarded videos the player chooses only; no IAP, no pop-up ads.
