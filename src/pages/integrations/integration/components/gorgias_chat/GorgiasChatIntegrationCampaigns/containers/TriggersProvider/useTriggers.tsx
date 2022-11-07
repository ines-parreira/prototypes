import {useContext} from 'react'

import TriggersContext from './context'

export function useTriggers() {
    return useContext(TriggersContext)
}
