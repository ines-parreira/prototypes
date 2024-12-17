import {useContext} from 'react'

import {BannersDispatchContext} from '../context'

export function useBannersDispatchContext() {
    return useContext(BannersDispatchContext)
}
