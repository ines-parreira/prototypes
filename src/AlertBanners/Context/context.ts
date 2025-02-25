import { createContext } from 'react'

import { ContextBanner } from '../types'
import { BannerActions } from './types'

export const BannersContext = createContext<ContextBanner[]>([])
export const BannersDispatchContext = createContext<
    React.Dispatch<BannerActions>
>(() => undefined)
