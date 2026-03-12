import { useCallback } from 'react'

import { useId } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'

import useSplitTicketView from '../hooks/useSplitTicketView'
import useIsToggleEnabled from './useIsToggleEnabled'

import css from './Toggle.less'

const Labels = {
    FullWidth: 'Hide ticket panel',
    SplitTicket: 'Show ticket panel',
}

/* istanbul ignore next */
export default function Toggle() {
    const { isEnabled, setIsEnabled } = useSplitTicketView()
    const { isEnabled: isToggleEnabled } = useIsToggleEnabled()
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()

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

    if (hasUIVisionMS1) {
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
                        icon="system-bar-left-collapse"
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

    return (
        <Tooltip
            trigger={
                <button
                    className={cn(
                        showGlobalNav ? css.showGlobalNavToggle : css.toggle,
                        {
                            [css.active]: isEnabled,
                            [css.disabled]: !isToggleEnabled,
                        },
                    )}
                    type="button"
                    onClick={handleClick}
                    id={buttonId}
                    disabled={!isToggleEnabled}
                    data-candu-id="dtp-toggle"
                    {...(showGlobalNav && {
                        'aria-describedby': isEnabled
                            ? Labels.FullWidth
                            : Labels.SplitTicket,
                    })}
                >
                    {showGlobalNav ? (
                        <div
                            className={cn(css.mask, {
                                [css.active]: isEnabled,
                            })}
                        />
                    ) : (
                        <span>
                            {isEnabled ? Labels.FullWidth : Labels.SplitTicket}
                        </span>
                    )}
                </button>
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
