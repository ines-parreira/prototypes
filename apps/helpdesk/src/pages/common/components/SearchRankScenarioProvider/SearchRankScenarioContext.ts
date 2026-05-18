import { createContext } from 'react'

import type { SearchRank } from '@repo/logging'

export default createContext<SearchRank | null>(null)
