import { createContext } from 'react'

import type { HelpCenter } from 'models/helpCenter/types'

const DefaultExportCurrentHelpCenterContext = createContext<HelpCenter | null>(
    null,
)

export { DefaultExportCurrentHelpCenterContext }
