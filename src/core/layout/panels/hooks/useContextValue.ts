import {useCallback, useEffect, useMemo, useState} from 'react'

import mutateSizes from '../helpers/mutateSizes'
import sum from '../helpers/sum'
import type {Panel, PanelConfig, PanelListener} from '../types'
import useDelta from './useDelta'
import useDrag from './useDrag'
import usePanelOrder from './usePanelOrder'
import usePanelSizes from './usePanelSizes'
import useResizers from './useResizers'
import useSanitisedConfigs from './useSanitisedConfigs'
import useSavedSizes from './useSavedSizes'

export default function useContextValue(
    container: HTMLDivElement | null,
    availableSize: number
) {
    const [savedSizes, persistSizes] = useSavedSizes()

    const [subtractedSize, setSubtractedSize] = useState(0)
    const [panels, setPanels] = useState<Record<string, Panel>>({})
    const names = useMemo(() => Object.keys(panels), [panels])
    const configs = useMemo(
        () =>
            names.reduce(
                (acc, name) => ({...acc, [name]: panels[name].config}),
                {} as Record<string, PanelConfig>
            ),
        [names, panels]
    )
    const listeners = useMemo(
        () =>
            names.reduce(
                (acc, name) => ({...acc, [name]: panels[name].listener}),
                {} as Record<string, PanelListener>
            ),
        [names, panels]
    )

    const panelOrder = usePanelOrder(container, names)
    const sanitisedConfigs = useSanitisedConfigs(
        configs,
        savedSizes,
        availableSize - subtractedSize
    )
    const [sizes, setSizes] = usePanelSizes(
        availableSize - subtractedSize,
        sanitisedConfigs,
        panelOrder
    )

    const {createResizer, drag} = useDrag(sizes)
    const delta = useDelta(drag)

    const resizers = useResizers(createResizer, sanitisedConfigs, panelOrder)

    useEffect(() => {
        if (!delta || !drag) return
        const newSizes = mutateSizes(
            sanitisedConfigs,
            panelOrder,
            drag,
            delta.x
        )
        persistSizes(newSizes)
        setSizes(newSizes)
    }, [delta, drag, panelOrder, persistSizes, sanitisedConfigs, setSizes])

    useEffect(() => {
        panelOrder.forEach((name) =>
            listeners[name]({resizer: resizers[name], size: sizes[name]})
        )
    }, [listeners, panelOrder, resizers, sizes])

    const totalSize = sum(Object.values(sizes)) + subtractedSize

    const addPanel = useCallback(
        (name: string, config: PanelConfig, listener: PanelListener) => {
            setPanels((s) => ({...s, [name]: {config, listener}}))
            return () => {
                setPanels((s) => {
                    const newState = {...s}
                    delete newState[name]
                    return newState
                })
            }
        },
        []
    )

    const subtractSize = useCallback((size: number) => {
        setSubtractedSize((s) => s + size)
        return () => {
            setSubtractedSize((s) => s - size)
        }
    }, [])

    return useMemo(
        () => ({addPanel, subtractSize, totalSize}),
        [addPanel, subtractSize, totalSize]
    )
}
