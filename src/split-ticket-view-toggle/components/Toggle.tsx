import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React, {useCallback} from 'react'

import {useDesktopOnlyShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import {logEvent, SegmentEvent} from 'common/segment'
import {TooltipDelay} from 'core/ui/tooltip.utils'
import useId from 'hooks/useId'

import useSplitTicketView from '../hooks/useSplitTicketView'

import css from './Toggle.less'
import useIsToggleEnabled from './useIsToggleEnabled'

/* istanbul ignore next */
export default function Toggle() {
    const {isEnabled, setIsEnabled} = useSplitTicketView()
    const {isEnabled: isToggleEnabled} = useIsToggleEnabled()
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()

    const id = useId()
    const buttonId = 'toggle-button-' + id

    const handleClick = useCallback(() => {
        /** istanbul ignore next */
        logEvent(SegmentEvent.DedicatedTicketPanelToggled, {
            enabled: !isEnabled,
        })
        /** istanbul ignore next */
        setIsEnabled(!isEnabled)
    }, [isEnabled, setIsEnabled])

    return (
        <>
            <button
                className={cn(
                    showGlobalNav ? css.showGlobalNavToggle : css.toggle,
                    {
                        [css.active]: isEnabled,
                        [css.disabled]: !isToggleEnabled,
                    }
                )}
                type="button"
                onClick={handleClick}
                id={buttonId}
                disabled={!isToggleEnabled}
                data-candu-id="dtp-toggle"
                {...(showGlobalNav && {
                    'aria-describedby': isEnabled ? 'Expand' : 'Collapse',
                })}
            >
                {showGlobalNav ? (
                    <div className={cn(css.mask, {[css.active]: isEnabled})} />
                ) : (
                    <span>{isEnabled ? 'Expand' : 'Collapse'}</span>
                )}
            </button>
            {showGlobalNav && isToggleEnabled && (
                <Tooltip
                    target={buttonId}
                    placement="right"
                    delay={TooltipDelay.Long}
                >
                    {isEnabled ? 'Expand' : 'Collapse'}
                </Tooltip>
            )}

            {!isToggleEnabled && (
                <Tooltip
                    target={buttonId}
                    placement="bottom-start"
                    delay={TooltipDelay.Long}
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
