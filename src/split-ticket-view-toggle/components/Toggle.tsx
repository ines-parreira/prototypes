import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React, {useCallback} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import useId from 'hooks/useId'

import useSplitTicketView from '../hooks/useSplitTicketView'

import css from './Toggle.less'
import useIsToggleEnabled from './useIsToggleEnabled'

export default function Toggle() {
    const {isEnabled, setIsEnabled} = useSplitTicketView()
    const {isEnabled: isToggleEnabled} = useIsToggleEnabled()

    const id = useId()
    const buttonId = 'toggle-button-' + id

    const handleClick = useCallback(() => {
        logEvent(SegmentEvent.DedicatedTicketPanelToggled, {
            enabled: !isEnabled,
        })
        setIsEnabled(!isEnabled)
    }, [isEnabled, setIsEnabled])

    return (
        <>
            <button
                className={cn(css.toggle, {
                    [css.active]: isEnabled,
                    [css.disabled]: !isToggleEnabled,
                })}
                type="button"
                onClick={handleClick}
                id={buttonId}
                disabled={!isToggleEnabled}
                data-candu-id="dtp-toggle"
            >
                {isEnabled ? 'Use full width view' : 'Use split ticket view'}
            </button>
            {!isToggleEnabled && (
                <Tooltip
                    target={buttonId}
                    placement="bottom-start"
                    innerProps={{
                        popperClassName: css.tooltip,
                    }}
                >
                    Select a view in order to enable the ticket panel.
                </Tooltip>
            )}
        </>
    )
}
