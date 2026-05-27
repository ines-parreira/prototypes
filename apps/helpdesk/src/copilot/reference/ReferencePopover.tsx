import type { ReactElement, ReactNode } from 'react'
import { useState } from 'react'

import { Tooltip, TooltipContent } from '@gorgias/axiom'

import './ReferencePopover.less'

type ReferencePopoverProps = {
    /**
     * Trigger element. Rendered as-is (e.g. a `<Link>`) so cmd-click /
     * middle-click navigation keeps working.
     */
    trigger: ReactElement
    /**
     * Popover content. `isOpen` gates lazy data fetching so the card only
     * triggers network requests once the user actually hovers.
     */
    children: (api: { isOpen: boolean }) => ReactNode
}

// Axiom's Tooltip internally subtracts ~300ms from `delay` to account for
// react-aria's cursor warmup period, so `OPEN_DELAY_MS = 550` lands the
// perceived delay at ~250ms.
const OPEN_DELAY_MS = 550
const CLOSE_DELAY_MS = 150

export function ReferencePopover({ trigger, children }: ReferencePopoverProps) {
    // We only observe open state to gate data fetching. Passing `isOpen` to
    // axiom Tooltip would put it in fully-controlled mode, which disables the
    // built-in hover/focus open behavior — so we hand it `onOpenChange` only
    // and let axiom own the open state internally.
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Tooltip
            trigger={trigger}
            placement="top"
            delay={OPEN_DELAY_MS}
            closeDelay={CLOSE_DELAY_MS}
            onOpenChange={setIsOpen}
        >
            <TooltipContent>
                <div data-reference-card="true">{children({ isOpen })}</div>
            </TooltipContent>
        </Tooltip>
    )
}
