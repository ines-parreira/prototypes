import { useContext } from 'react'

import { BannersContext } from '../context'

export function useBannersContext() {
    return useContext(BannersContext)
}
