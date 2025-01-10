import {useEffect, useState} from 'react'

import type {PanelConfig, PanelState} from '../types'
import usePanels from './usePanels'

export default function usePanel(name: string, config: PanelConfig) {
    const {addPanel} = usePanels()
    const [state, setPanelState] = useState<PanelState>({size: 0})

    useEffect(
        () => addPanel(name, config, setPanelState),
        [addPanel, config, name]
    )

    return state
}
