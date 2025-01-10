import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./src/main.ts', './src/core/index.ts', './src/decorators/index.ts', './src/common/index.ts'],
  outdir: './dist',
  root: './src',
  minify: true,
  target: 'bun',
  plugins: [dts({ outputDir: './dist' })],
})
