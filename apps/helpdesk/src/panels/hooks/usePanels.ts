import type { MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { usePrevious, useUpdateEffect } from '@repo/hooks'
import _isEqual from 'lodash/isEqual'

import type { Config } from '../types'
import { computeDefaultWidths, createConfig, mutatePanels } from '../utils'
import useScreenSize from './useScreenSize'

type Coord = {
    x: number
    y: number
}

type UsePanelsReturn = {
    panelWidths: number[]
    resizeStartHandlers: ((ev: ReactMouseEvent) => void)[]
}

export default function usePanels(config: Config): UsePanelsReturn {
    const previousConfig = usePrevious(config)
    const [screenWidth] = useScreenSize()
    const [dragHandle, setDragHandle] = useState<number | null>(null)
    const dragStart = useRef<Coord | null>(null)
    const panelWidthsStart = useRef<number[] | null>(null)

    const [panelWidths, setPanelWidths] = useState(() =>
        computeDefaultWidths({ config, totalWidth: screenWidth }),
    )

    useUpdateEffect(() => {
        if (_isEqual(config, previousConfig)) {
            setPanelWidths((panelWidths) =>
                computeDefaultWidths({
                    config: createConfig(panelWidths, config),
                    totalWidth: screenWidth,
                }),
            )
        } else {
            setPanelWidths(
                computeDefaultWidths({ config, totalWidth: screenWidth }),
            )
        }
    }, [config, screenWidth])

    useEffect(() => {
        if (dragHandle === null) return
        const handle = dragHandle

        function handleMouseMove(ev: MouseEvent) {
            if (!dragStart.current || !panelWidthsStart.current) return

            const newWidths = mutatePanels({
                config,
                currentWidths: panelWidthsStart.current,
                handle,
                delta: ev.clientX - dragStart.current.x,
                totalWidth: screenWidth,
            })

            setPanelWidths(newWidths)
        }

        function handleMouseUp() {
            dragStart.current = null
            panelWidthsStart.current = null
            setDragHandle(null)
        }

        document.body.classList.add('grabbing')
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.body.classList.remove('grabbing')
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [config, dragHandle, screenWidth])

    const createHandleResizeStart = useCallback(
        (index: number) => (ev: ReactMouseEvent) => {
            ev.preventDefault()
            dragStart.current = { x: ev.clientX, y: ev.clientY }
            panelWidthsStart.current = panelWidths
            setDragHandle(index)
        },
        [panelWidths],
    )

    // we need one handler less than the amount of panels
    const resizeStartHandlers = useMemo(
        () =>
            Array.from({ length: config.length - 1 }, (_index, i) =>
                createHandleResizeStart(i),
            ),
        [config, createHandleResizeStart],
    )

    return useMemo(
        () => ({ panelWidths, resizeStartHandlers }),
        [panelWidths, resizeStartHandlers],
    )
}
