import path from 'node:path'
import url from 'node:url'

import { createConfig } from '@gorgias/config/prettier'

// import.meta.dirname is not available in node < 20
// replace with import.meta.dirname when node >= 20
const srcDir = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    'src',
)
const config = createConfig({ srcDir })

export default config
