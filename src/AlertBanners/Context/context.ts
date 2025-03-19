import { createContext } from 'react'
import type { Dispatch } from 'react'

import { ContextBanner } from '../types'
import { BannerActions } from './types'

export const BannersContext = createContext<ContextBanner[]>([])
export const BannersDispatchContext = createContext<Dispatch<BannerActions>>(
    () => undefined,
)
