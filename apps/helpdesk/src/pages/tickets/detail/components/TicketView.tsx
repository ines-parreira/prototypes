import { useCallback, useEffect, useMemo, useRef } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import classnames from 'classnames'

import { IconButton } from '@gorgias/axiom'

import { Drawer } from 'components/Drawer/Drawer'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import TicketBody from 'pages/tickets/detail/components/TicketBody'
import { getBody, getTicketState } from 'state/ticket/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'
import { useTimelinePanel } from 'timeline/hooks/useTimelinePanel'
import Timeline from 'timeline/Timeline'

import { SubmitArgs } from '../TicketDetailContainer'
import TicketFooter, { TicketFooterContext } from './TicketFooter'
import TicketHeaderWrapper from './TicketHeaderWrapper/TicketHeaderWrapper'

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
    const drawerContainerRef = useRef<HTMLDivElement>(null)
    const hasCTDrawer = useFlag(FeatureFlagKey.CustomerTimelineDrawerUX)
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
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

    const footerContext = useMemo(
        (): TicketFooterContext => ({
            isShopperTyping,
            shopperName:
                (ticket.getIn(['customer', 'name']) as string) ?? 'Customer',
            submit,
        }),
        [isShopperTyping, ticket, submit],
    )

    return (
        <div className={css.outerView} ref={drawerContainerRef}>
            {hasCTDrawer ? (
                <Drawer.Root
                    container={drawerContainerRef.current}
                    open={isTimelineOpen}
                    modal={false}
                    handleOnly
                    direction="right"
                >
                    <Drawer.Content
                        className={css.timelineDrawer}
                        aria-describedby="Customer timeline"
                    >
                        <Drawer.Title
                            className={classnames(
                                css.timelineHeader,
                                css.rounded,
                            )}
                        >
                            <span>Customer Timeline</span>
                            <Drawer.Close asChild>
                                <IconButton
                                    className={classnames(css.closeTrigger)}
                                    onClick={closeTimeline}
                                    id={TIMELINE_CLOSE_BUTTON_ID}
                                    icon="close"
                                    intent="secondary"
                                    fillStyle="ghost"
                                    title="Close timeline"
                                />
                            </Drawer.Close>
                        </Drawer.Title>

                        <div
                            className={classnames(
                                css.timelineDrawerContent,
                                'pb-4',
                            )}
                        >
                            <Timeline
                                ticketId={ticket.get('id')}
                                shopperId={shopperId}
                                onLoaded={onTimelineLoaded}
                                containerRef={drawerContainerRef}
                            />
                        </div>
                    </Drawer.Content>
                </Drawer.Root>
            ) : (
                <>
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

                            <div
                                className={classnames(
                                    css.timelineContainer,
                                    'pb-4',
                                )}
                            >
                                <Timeline
                                    ticketId={ticket.get('id')}
                                    shopperId={shopperId}
                                    onLoaded={onTimelineLoaded}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className={css.view}>
                <TicketHeaderWrapper
                    hideTicket={hideTicket}
                    setStatus={setStatus}
                    onGoToNextTicket={onGoToNextTicket}
                    onToggleUnread={onToggleUnread}
                />
                <div
                    className={classnames(css.page, {
                        'ticket-thread-revamp': hasTicketThreadRevamp,
                        'transition out fade right': isTicketHidden,
                        [css.hasMessagesTranslation]: hasMessagesTranslation,
                    })}
                    ref={pageRef}
                >
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
                        />
                    </div>
                    <TicketFooter context={footerContext} />
                </div>
            </div>
        </div>
    )
}

export default TicketView
