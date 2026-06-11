import { createContext } from 'react'

import type { Client } from './Client'

const DefaultExportContext = createContext<Client | null>(null)

export { DefaultExportContext }
