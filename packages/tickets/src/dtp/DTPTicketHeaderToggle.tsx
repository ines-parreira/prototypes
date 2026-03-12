import { useCallback } from 'react'

import { useId } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketsLegacyBridge } from '../utils/LegacyBridge'

const Labels = {
    FullWidth: 'Hide ticket panel',
    SplitTicket: 'Show ticket panel',
}

export function DTPTicketHeaderToggle() {
    const { dtpToggle, dtpEnabled } = useTicketsLegacyBridge()

    const { isEnabled, setIsEnabled } = dtpToggle
    const { isEnabled: isToggleEnabled } = dtpEnabled

    const id = useId()
    const buttonId = 'toggle-button-' + id

    const handleClick = useCallback(() => {
        logEvent(SegmentEvent.DedicatedTicketPanelToggled, {
            enabled: !isEnabled,
        })

        setIsEnabled(!isEnabled)
    }, [isEnabled, setIsEnabled])

    // If the ticket panel is already enabled, don't show the toggle in the ticket header
    if (isEnabled) {
        return null
    }

    return (
        <Tooltip
            trigger={
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClick}
                    id={buttonId}
                    isDisabled={!isToggleEnabled}
                    data-candu-id="dtp-toggle"
                    icon="system-bar-left-expand"
                    aria-describedby={
                        isEnabled ? Labels.FullWidth : Labels.SplitTicket
                    }
                />
            }
        >
            <TooltipContent
                title={
                    !isToggleEnabled
                        ? 'Select a view in order to enable the ticket panel.'
                        : isEnabled
                          ? Labels.FullWidth
                          : Labels.SplitTicket
                }
            />
        </Tooltip>
    )
}
