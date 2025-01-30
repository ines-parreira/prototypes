import {useCallback, useEffect, useMemo, useState} from 'react'

import mutateSizes from '../helpers/mutateSizes'
import sum from '../helpers/sum'
import type {HandleListener, Panel, PanelConfig, PanelListener} from '../types'
import useChildOrder from './useChildOrder'
import useDelta from './useDelta'
import useDrag from './useDrag'
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
    const [handles, setHandles] = useState<Record<string, HandleListener>>({})
    const names = useMemo(() => Object.keys(panels), [panels])
    const ids = useMemo(() => Object.keys(handles), [handles])
    const configs = useMemo(
        () =>
            names.reduce(
                (acc, name) => ({...acc, [name]: panels[name].config}),
                {} as Record<string, PanelConfig>
            ),
        [names, panels]
    )
    const panelListeners = useMemo(
        () =>
            names.reduce(
                (acc, name) => ({...acc, [name]: panels[name].listener}),
                {} as Record<string, PanelListener>
            ),
        [names, panels]
    )

    const {handlesMap, panelOrder} = useChildOrder(container, names, ids)
    const sanitisedConfigs = useSanitisedConfigs(
        configs,
        availableSize - subtractedSize
    )
    const [sizes, setSizes] = usePanelSizes(
        availableSize - subtractedSize,
        sanitisedConfigs,
        savedSizes,
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
        panelOrder.forEach((name) => {
            panelListeners[name]({size: sizes[name]})
            const handleId = handlesMap[name]
            if (handleId) {
                handles[handleId]?.({onResizeStart: resizers[name]})
            }
        })
    }, [handles, handlesMap, panelListeners, panelOrder, resizers, sizes])

    const totalSize = sum(Object.values(sizes)) + subtractedSize

    const addHandle = useCallback((id: string, listener: HandleListener) => {
        setHandles((s) => ({...s, [id]: listener}))
        return () => {
            setHandles((s) => {
                const newState = {...s}
                delete newState[id]
                return newState
            })
        }
    }, [])

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
        () => ({addHandle, addPanel, subtractSize, totalSize}),
        [addHandle, addPanel, subtractSize, totalSize]
    )
}
