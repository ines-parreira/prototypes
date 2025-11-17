import { createContext } from 'react'
import type { Dispatch } from 'react'

import type { ContextBanner } from '../types'
import type { BannerActions } from './types'

export const BannersContext = createContext<ContextBanner[]>([])
export const BannersDispatchContext = createContext<Dispatch<BannerActions>>(
    () => undefined,
)
