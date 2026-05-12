import path from 'node:path'

import { defineConfig } from 'oxfmt'

import { createConfig } from '@gorgias/config/oxfmt'

const srcDir = path.join(import.meta.dirname, 'src')

export default defineConfig(createConfig({ srcDir }))
