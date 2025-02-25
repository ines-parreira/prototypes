import { createContext } from 'react'

import { HelpCenter } from 'models/helpCenter/types'

export default createContext<HelpCenter | null>(null)
