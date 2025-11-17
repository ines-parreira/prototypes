import { createContext } from 'react'

import type { HelpCenter } from 'models/helpCenter/types'

export default createContext<HelpCenter | null>(null)
