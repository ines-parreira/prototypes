import React, {FormEvent, useEffect, useMemo, useRef} from 'react'
import {fromJS, List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {usePrevious, useUpdateEffect} from 'react-use'

import {RootState} from '../../../../state/types'
import {
    displayHistoryOnNextPage,
    toggleHistory,
} from '../../../../state/ticket/actions'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import {getNewMessageType} from '../../../../state/newMessage/selectors'
import {
    TicketMessageSourceType,
    TicketVia,
} from '../../../../business/types/ticket'
import {
    getOtherAgentsOnTicket,
    getOtherAgentsTypingOnTicket,
} from '../../../../state/agents/selectors'
import {
    getCustomersState,
    makeIsLoading,
} from '../../../../state/customers/selectors'
import {getBody, getDisplayHistory} from '../../../../state/ticket/selectors'
import {AgentLabel} from '../../../common/utils/labels'
import Timeline from '../../../common/components/timeline/Timeline'
import appCss from '../../../App.less'

import HistoryButton from './HistoryButton.js'
import PhoneTicketSubmitButtons from './ReplyArea/PhoneTicketSubmitButtons'
import ReplyMessageChannel from './ReplyArea/ReplyMessageChannel.js'
import TicketReplyArea from './ReplyArea/TicketReplyArea.js'
import TicketSubmitButtons from './ReplyArea/TicketSubmitButtons.js'
import TicketBody from './TicketBody.js'
import TicketHeader from './TicketHeader.js'
import css from './TicketView.less'

type StatusParams = [
    string | undefined,
    any,
    List<Map<any, any>> | undefined,
    boolean | undefined
]

type OwnProps = {
    hideTicket: () => boolean
    isTicketHidden: boolean
    submit: (...params: StatusParams) => any
    setStatus?: (status: string) => any
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const TicketViewContainer = ({
    agentsTyping = fromJS([]),
    agentsViewing = fromJS([]),
    currentUser,
    customers,
    customersIsLoading,
    displayHistoryOnNextPage,
    hideTicket,
    isHistoryDisplayed,
    isTicketHidden,
    setStatus,
    sourceType,
    submit,
    ticket,
    ticketBody,
    toggleHistory,
}: Props) => {
    const statusParamsRef = useRef<StatusParams | []>([])
    const prevIsHistoryDisplayed = usePrevious(isHistoryDisplayed)
    const newMessageFormRef = useRef<HTMLFormElement>(null)
    const ticketContentRef = useRef<HTMLDivElement>(null)

    const customerHistory = useMemo(
        () => (customers.get('customerHistory') as Map<any, any>) || fromJS({}),
        [customers]
    )
    const hideHistoryButton = useMemo(() => !ticket.get('id'), [ticket])
    const isExistingTicket = useMemo(() => !!ticket.get('id'), [ticket])
    const shouldRenderPhoneButtons = useMemo(
        () =>
            ticket.get('via') === TicketVia.Twilio &&
            sourceType === TicketMessageSourceType.Phone,
        [sourceType, ticket]
    )

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
    }, [])

    useEffect(() => {
        // scroll to the bottom of the ticket content the first time the ticket is viewed.
        // decrease the bottom padding, to avoid scrolling to a white screen on touchscreens.
        if (ticketContentRef.current) {
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
    }, [])

    useUpdateEffect(() => {
        // if ticket body (messages, events, etc.) changes but user is at bottom of the page,
        // then keep him at the bottom of the page
        if (wasAtBottomOfPage) {
            // if history is displayed we set scroll on `main-content` wrapper
            const mainContentElement = getMainContentElement(isHistoryDisplayed)
            mainContentElement.scrollTop = mainContentElement.scrollHeight
        }
    }, [ticketBody])

    const handlePreSubmit = (
        status?: string,
        next?: any,
        action?: List<Map<any, any>>,
        resetMessage?: boolean
    ) => {
        if (newMessageFormRef?.current?.checkValidity()) {
            statusParamsRef.current = [status, next, action, resetMessage]
        } else {
            statusParamsRef.current = []
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // https://github.com/gorgias/gorgias/issues/4074
        if (e.target !== newMessageFormRef.current) {
            return
        }

        statusParamsRef.current.length && submit(...statusParamsRef.current)
    }

    const handleHistoryToggle = () => {
        const shouldOpenHistory =
            ticket.get('id') &&
            customers.getIn(['customerHistory', 'hasHistory']) &&
            !isHistoryDisplayed

        toggleHistory(shouldOpenHistory)

        // TODO(customers-migration): ask confirmation to update this event
        segmentTracker.logEvent(segmentTracker.EVENTS.USER_HISTORY_TOGGLED, {
            open: shouldOpenHistory,
            nbOfTicketsInTimeline: (customers.getIn([
                'customerHistory',
                'tickets',
            ]) as List<any>).size,
            channel: ticket.get('channel'),
            nbOfMessagesInTicket: (ticket.get('messages') as List<any>).size,
        })
    }

    const renderCollisionDetection = () => {
        const agentsViewingNotTyping = agentsViewing.filter(
            (userId) => !agentsTyping.contains(userId)
        )
        const hasBoth = agentsTyping.size > 0 && agentsViewingNotTyping.size > 0

        return (
            <div
                className={classnames(css.viewersBanner, {
                    [css.hidden]:
                        agentsViewing.size <= 0 && agentsTyping.size <= 0,
                    [css.bothCollisions]: hasBoth,
                })}
            >
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsTyping.size > 0 && (
                        <div className={css.collisionCategory}>
                            <i
                                className={classnames(
                                    css.icon,
                                    'material-icons'
                                )}
                            >
                                mode_edit
                            </i>

                            <div className={css.collisionLabel}>Typing:</div>

                            {agentsTyping.map((agent, index) => (
                                <AgentLabel
                                    key={index}
                                    name={(agent as Map<any, any>).get('name')}
                                    profilePictureUrl={(agent as Map<
                                        any,
                                        any
                                    >).getIn(['meta', 'profile_picture_url'])}
                                    className={css.collisionAgent}
                                    shouldDisplayAvatar
                                />
                            ))}
                        </div>
                    )
                }
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsViewingNotTyping.size > 0 && (
                        <div className={css.collisionCategory}>
                            <i
                                className={classnames(
                                    css.icon,
                                    'material-icons'
                                )}
                            >
                                remove_red_eye
                            </i>

                            <div className={css.collisionLabel}>Viewing:</div>

                            {agentsViewingNotTyping.map((agent, index) => (
                                <AgentLabel
                                    key={index}
                                    name={(agent as Map<any, any>).get('name')}
                                    profilePictureUrl={(agent as Map<
                                        any,
                                        any
                                    >).getIn(['meta', 'profile_picture_url'])}
                                    className={css.collisionAgent}
                                    shouldDisplayAvatar
                                />
                            ))}
                        </div>
                    )
                }
            </div>
        )
    }

    return (
        <div
            className={classnames(css.page, {
                'transition out fade right': isTicketHidden,
            })}
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
            <div className={css.headerContainer}>
                <div className="d-flex">
                    {!hideHistoryButton && (
                        <div
                            className={classnames(
                                css.historyButtonContainer,
                                'd-none d-md-flex align-items-top mt-4'
                            )}
                        >
                            <HistoryButton
                                isHistoryDisplayed={isHistoryDisplayed}
                                customerHistory={customerHistory}
                                toggleHistory={handleHistoryToggle}
                                ticket={ticket}
                                customersIsLoading={customersIsLoading}
                            />
                        </div>
                    )}

                    <TicketHeader
                        ticket={ticket}
                        hideTicket={hideTicket}
                        className="flex-grow"
                    />
                </div>

                {renderCollisionDetection()}
            </div>

            <div
                className={classnames(css.ticketContent, {
                    [css.historyDisplayed]: isHistoryDisplayed,
                    'mt-3': !isExistingTicket,
                })}
                ref={ticketContentRef}
                tabIndex={1}
            >
                {isExistingTicket && (
                    <TicketBody elements={ticketBody} setStatus={setStatus} />
                )}

                <form
                    className={classnames('d-print-none', css.newMessageForm)}
                    onSubmit={handleSubmit}
                    ref={newMessageFormRef}
                    id="ticket-reply-editor"
                >
                    <ReplyMessageChannel />

                    {shouldRenderPhoneButtons ? (
                        <PhoneTicketSubmitButtons />
                    ) : (
                        <>
                            <TicketReplyArea
                                currentUser={currentUser}
                                customers={customers}
                                ticket={ticket}
                            />

                            <TicketSubmitButtons
                                ticket={ticket}
                                submit={handlePreSubmit}
                            />
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        agentsTyping: getOtherAgentsTypingOnTicket(state.ticket.get('id'))(
            state
        ),
        agentsViewing: getOtherAgentsOnTicket(state.ticket.get('id'))(state),
        currentUser: state.currentUser,
        customers: getCustomersState(state),
        customersIsLoading: makeIsLoading(state),
        isHistoryDisplayed: getDisplayHistory(state),
        ticket: state.ticket,
        ticketBody: getBody(state),
        sourceType: getNewMessageType(state),
    }),
    {
        displayHistoryOnNextPage,
        toggleHistory,
    }
)

export default connector(TicketViewContainer)
