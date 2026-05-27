import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { usePanels } from '@repo/layout'
import cn from 'classnames'

import { CopilotWorkspace, useCopilot } from '@gorgias/copilot'

import { copilotAttachmentsConfig } from 'common/copilot/copilotAttachmentsConfig'

import css from './CopilotWorkspaceContainer.less'

/**
 * Wraps CopilotWorkspace so the rendered width is reported to the enclosing
 * <Panels> resize system via subtractSize. Without this, sibling panels are
 * sized assuming the full viewport and the rightmost panel gets clipped by
 * PanelGroup's overflow:hidden once the copilot panel opens.
 *
 * Padding is only applied while the panel is open — when closed, the inner
 * AnimatePresence unmounts everything and we don't want the wrapper to
 * leave an 8px gap.
 *
 * Outside a Panels context the hook returns a no-op so the legacy layout is
 * unaffected.
 */
export function CopilotWorkspaceContainer() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [reservedWidth, setReservedWidth] = useState(0)
    const { subtractSize } = usePanels()
    const { open } = useCopilot()

    useLayoutEffect(() => {
        const element = wrapperRef.current
        if (!element) return

        const update = () => {
            const measured = Math.round(element.getBoundingClientRect().width)
            setReservedWidth((previous) =>
                previous === measured ? previous : measured,
            )
        }
        update()

        const observer = new ResizeObserver(update)
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (reservedWidth === 0) return
        return subtractSize(reservedWidth)
    }, [reservedWidth, subtractSize])

    return (
        <div
            ref={wrapperRef}
            className={cn(css.wrapper, open && css.wrapperOpen)}
        >
            <CopilotWorkspace attachmentsConfig={copilotAttachmentsConfig} />
        </div>
    )
}
