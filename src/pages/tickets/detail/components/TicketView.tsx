import React, {useEffect, useMemo, useRef} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {usePrevious, useUpdateEffect} from 'react-use'
import Timeline from 'pages/common/components/timeline/Timeline'
import {RootState} from 'state/types'
import {displayHistoryOnNextPage, toggleHistory} from 'state/ticket/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCustomersState} from 'state/customers/selectors'
import {getBody, getDisplayHistory} from 'state/ticket/selectors'
import TicketBodyVirtualized from 'pages/tickets/detail/components/TicketBodyVirtualized'
import TicketBodyNonVirtualized from 'pages/tickets/detail/components/TicketBodyNonVirtualized'
import {FeatureFlagKey} from 'config/featureFlags'
import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import appCss from 'pages/App.less'

import {SubmitArgs} from '../TicketDetailContainer'
import TypingActivity from './TypingActivity'
import css from './TicketView.less'

type OwnProps = {
    hideTicket: () => Promise<void>
    isTicketHidden: boolean
    submit: (params: SubmitArgs) => any
    setStatus?: (status: string) => any
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const TicketViewContainer = ({
    customers,
    displayHistoryOnNextPage,
    hideTicket,
    isHistoryDisplayed,
    isTicketHidden,
    setStatus,
    submit,
    ticket,
    ticketBody,
    toggleHistory,
}: Props) => {
    // TODO: refactor after Virtualization is rolled out
    const isVirtualizationEnabled =
        useFlags()[FeatureFlagKey.TicketMessagesVirtualization]

    const prevIsHistoryDisplayed = usePrevious(isHistoryDisplayed)
    const isExistingTicket = !!ticket.get('id')
    const pageRef = useRef<HTMLDivElement>(null)
    const ticketContentRef = useRef<HTMLDivElement>(null)

    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers]
    )

    useEffect(() => {
        const shouldDisplayHistoryOnNextPage = ticket.getIn([
            '_internal',
            'shouldDisplayHistoryOnNextPage',
        ]) as boolean
        const displayHistory = ticket.getIn([
            '_internal',
            'displayHistory',
        ]) as boolean

        if (shouldDisplayHistoryOnNextPage !== displayHistory) {
            toggleHistory(shouldDisplayHistoryOnNextPage)
        }

        if (shouldDisplayHistoryOnNextPage) {
            displayHistoryOnNextPage(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleHistoryToggle = () => {
        const shouldOpenHistory =
            ticket.get('id') &&
            customers.getIn(['customerHistory', 'hasHistory']) &&
            !isHistoryDisplayed

        toggleHistory(shouldOpenHistory)

        // TODO(customers-migration): ask confirmation to update this event
        logEvent(SegmentEvent.UserHistoryToggled, {
            open: shouldOpenHistory,
            nbOfTicketsInTimeline: (
                customers.getIn(['customerHistory', 'tickets']) as List<any>
            ).size,
            channel: ticket.get('channel'),
            nbOfMessagesInTicket: (ticket.get('messages') as List<any>).size,
        })
    }

    // TODO: remove following block after Virtualization is rolled out
    const getMainContentElement = (
        isHistoryDisplayed: boolean
    ): HTMLElement => {
        const className = isHistoryDisplayed
            ? appCss['main-content']
            : css.ticketContent
        return document.getElementsByClassName(className)[0] as HTMLElement
    }

    // save before props update if user was at bottom of the page (probably answering something)
    // if history is displayed we calculate scroll on `main-content` wrapper
    const prevMainContentElement =
        typeof prevIsHistoryDisplayed !== 'undefined'
            ? getMainContentElement(prevIsHistoryDisplayed)
            : null

    const wasAtBottomOfPage =
        !!prevMainContentElement &&
        prevMainContentElement.scrollHeight -
            prevMainContentElement.scrollTop <=
            prevMainContentElement.offsetHeight + 40

    const isShopperTyping = useMemo(
        () => ticket.getIn(['_internal', 'isShopperTyping']) as boolean,
        [ticket]
    )

    useEffect(() => {
        // scroll to the bottom of the ticket content the first time the ticket is viewed.
        // decrease the bottom padding, to avoid scrolling to a white screen on touchscreens.
        if (ticketContentRef.current && !isVirtualizationEnabled) {
            const styles = window.getComputedStyle(ticketContentRef.current)
            const maxScrollTop =
                ticketContentRef.current.scrollHeight -
                ticketContentRef.current.clientHeight
            ticketContentRef.current.scrollTop =
                maxScrollTop - parseInt(styles.paddingBottom)

            // don't steal focus if another component manages it.
            // (eg. new ticket focuses the editable title).
            // body is focused by default.
            if (document.activeElement === document.body) {
                // focus ticket content so we can keyboard scroll
                ticketContentRef.current.focus()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useUpdateEffect(() => {
        // if ticket body (messages, events, etc.) changes but user is at bottom of the page,
        // then keep him at the bottom of the page
        if (wasAtBottomOfPage && !isVirtualizationEnabled) {
            // if history is displayed we set scroll on `main-content` wrapper
            const mainContentElement = getMainContentElement(isHistoryDisplayed)
            mainContentElement.scrollTop = mainContentElement.scrollHeight
        }
    }, [ticketBody])

    return (
        <div
            className={classnames(css.page, {
                'transition out fade right': isTicketHidden,
            })}
            ref={pageRef}
        >
            {isHistoryDisplayed && (
                <div className={classnames(css.timeline)}>
                    <div className={css.timelineHeader}>
                        <div
                            className={classnames(
                                css.closeTrigger,
                                'd-flex',
                                'align-items-center'
                            )}
                            onClick={handleHistoryToggle}
                        >
                            <i className="material-icons md-3 mr-3">close</i>
                            <span>Customer Timeline</span>
                        </div>
                    </div>

                    <div className={classnames(css.timelineContainer, 'pb-4')}>
                        <Timeline
                            displayHistoryOnNextPage={displayHistoryOnNextPage}
                            currentTicketId={ticket.get('id')}
                            customerHistory={customerHistory}
                        />
                    </div>
                </div>
            )}

            {!isVirtualizationEnabled && (
                <TicketHeaderWrapper
                    hideTicket={hideTicket}
                    handleHistoryToggle={handleHistoryToggle}
                />
            )}

            <div
                className={classnames(css.ticketContent, {
                    [css.historyDisplayed]: isHistoryDisplayed,
                    [css.isVirtualized]: isVirtualizationEnabled,
                })}
                ref={ticketContentRef}
                tabIndex={1}
            >
                {isVirtualizationEnabled ? (
                    <TicketBodyVirtualized
                        elements={ticketBody}
                        setStatus={setStatus}
                        customScrollParentRef={pageRef}
                        submit={submit}
                        hideTicket={hideTicket}
                        handleHistoryToggle={handleHistoryToggle}
                        isShopperTyping={isShopperTyping}
                        shopperName={
                            (ticket.getIn(['customer', 'name']) as string) ??
                            'Customer'
                        }
                    />
                ) : (
                    <>
                        {isExistingTicket && (
                            <TicketBodyNonVirtualized
                                elements={ticketBody}
                                setStatus={setStatus}
                            />
                        )}
                        <TypingActivity
                            isTyping={isShopperTyping}
                            name={
                                (ticket.getIn([
                                    'customer',
                                    'name',
                                ]) as string) ?? 'Customer'
                            }
                        />

                        <ReplyForm submit={submit} />
                    </>
                )}
            </div>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        customers: getCustomersState(state),
        isHistoryDisplayed: getDisplayHistory(state),
        ticket: state.ticket,
        ticketBody: getBody(state),
    }),
    {
        displayHistoryOnNextPage,
        toggleHistory,
    }
)

export default connector(TicketViewContainer)
