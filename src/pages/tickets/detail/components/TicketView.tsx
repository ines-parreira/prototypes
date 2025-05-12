import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import classnames from 'classnames'

import { IconButton } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { useTimelinePanel } from 'pages/common/components/timeline/hooks/useTimelinePanel'
import Timeline from 'pages/common/components/timeline/Timeline'
import TicketBody from 'pages/tickets/detail/components/TicketBody'
import { getBody, getTicketState } from 'state/ticket/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import { SubmitArgs } from '../TicketDetailContainer'

import css from './TicketView.less'

export const TIMELINE_CLOSE_BUTTON_ID = 'timelineCloseButton'

type Props = {
    hideTicket: () => Promise<void>
    isTicketHidden: boolean
    submit: (params: SubmitArgs) => any
    setStatus: (status: string) => any
    onGoToNextTicket?: () => void
    onToggleUnread?: OnToggleUnreadFn
}

export const TicketView = ({
    hideTicket,
    isTicketHidden,
    setStatus,
    submit,
    onGoToNextTicket,
    onToggleUnread,
}: Props) => {
    const pageRef = useRef<HTMLDivElement>(null)
    const ticketContentRef = useRef<HTMLDivElement>(null)

    const ticket = useAppSelector(getTicketState)
    const ticketBody = useAppSelector(getBody)

    const {
        isOpen: isTimelineOpen,
        closeTimeline,
        shopperId,
    } = useTimelinePanel()

    const isShopperTyping = useMemo(
        () => ticket.getIn(['_internal', 'isShopperTyping']) as boolean,
        [ticket],
    )

    useEffect(() => {
        const ticketContent = ticketContentRef.current
        if (isTimelineOpen) {
            document.getElementById(TIMELINE_CLOSE_BUTTON_ID)?.focus()
        }
        return () => {
            if (!isTimelineOpen) ticketContent?.focus()
        }
    }, [isTimelineOpen])

    const onTimelineLoaded = useCallback(() => {
        // Make sure react has the time to render the list before scrolling
        window.setTimeout(() => {
            pageRef.current?.scrollTo({ top: 0 })
        })
    }, [])

    return (
        <div
            className={classnames(css.page, {
                'transition out fade right': isTicketHidden,
            })}
            ref={pageRef}
        >
            {isTimelineOpen && (
                <div className={classnames(css.timeline)}>
                    <div className={classnames(css.timelineHeader)}>
                        <span>Customer Timeline</span>
                        <IconButton
                            className={classnames(css.closeTrigger)}
                            onClick={closeTimeline}
                            id={TIMELINE_CLOSE_BUTTON_ID}
                            icon="close"
                            intent="secondary"
                            fillStyle="ghost"
                            title="Close timeline"
                        />
                    </div>

                    <div className={classnames(css.timelineContainer, 'pb-4')}>
                        <Timeline
                            ticketId={ticket.get('id')}
                            shopperId={shopperId}
                            onLoaded={onTimelineLoaded}
                        />
                    </div>
                </div>
            )}

            <div
                className={classnames(css.ticketContent, {
                    [css.historyDisplayed]: isTimelineOpen,
                })}
                ref={ticketContentRef}
                tabIndex={1}
            >
                <TicketBody
                    elements={ticketBody}
                    setStatus={setStatus}
                    customScrollParentRef={pageRef}
                    submit={submit}
                    hideTicket={hideTicket}
                    isShopperTyping={isShopperTyping}
                    shopperName={
                        (ticket.getIn(['customer', 'name']) as string) ??
                        'Customer'
                    }
                    onGoToNextTicket={onGoToNextTicket}
                    onToggleUnread={onToggleUnread}
                />
            </div>
        </div>
    )
}

export default TicketView
