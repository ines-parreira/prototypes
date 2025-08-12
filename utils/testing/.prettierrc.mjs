import path from 'node:path'

import { createConfig } from '@gorgias/config/prettier'

const srcDir = path.join(import.meta.dirname, 'src')
const config = createConfig({ srcDir })

export default config
