import {useEffect, useState} from 'react'

import type {HandleState} from '../types'
import usePanels from './usePanels'

export default function useHandle(id: string) {
    const {addHandle} = usePanels()
    const [state, setState] = useState<HandleState>({})

    useEffect(() => addHandle(id, setState), [addHandle, id])

    return state
}
