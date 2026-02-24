import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { localForageManager } from '@repo/browser-storage'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import {
    useAsyncFn,
    useEffectOnce,
    useIsMobileResolution,
    useKey,
    usePrevious,
} from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import {
    getMacroTicketFieldValues,
    useLiveTicketTranslationsUpdates,
    useTicketFieldsValidation,
} from '@repo/tickets'
import {
    useHelpdeskV2MS1Flag,
    useHelpdeskV2MS3Flag,
} from '@repo/tickets/feature-flags'
import { isMacOs, shortcutManager } from '@repo/utils'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _pick from 'lodash/pick'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import type { DomainEvent } from '@gorgias/events'
import type { Macro } from '@gorgias/helpdesk-types'
import { useAgentActivity } from '@gorgias/realtime-ably'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { RecentItems } from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import { useSearch } from 'hooks/useSearch'
import useDraftMessages, { DRAFT_TICKET_STORE } from 'hooks/useTicketDraft'
import { MacroActionName } from 'models/macroAction/types'
import type { PickedTicket } from 'models/search/types'
import { pickedTicketFields } from 'models/search/types'
import type { Ticket } from 'models/ticket/types'
import { useListVoiceCalls } from 'models/voiceCall/queries'
import Loader from 'pages/common/components/Loader/Loader'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider'
import KnowledgeSourceSidebarWrapper from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper'
import { TicketThread } from 'pages/tickets/detail/components/TicketThread/TicketThread'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'
import socketManager from 'services/socketManager/socketManager'
import { JoinEventType } from 'services/socketManager/types'
import { fetchCustomer } from 'state/customers/actions'
import { DEPRECATED_getActiveCustomer } from 'state/customers/selectors'
import {
    prepare,
    prepareTicketMessage,
    sendTicketMessage,
    setReceivers,
    setSender,
    submitTicket,
} from 'state/newMessage/actions'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from 'state/newMessage/errors'
import { canSend, getNewMessageSource } from 'state/newMessage/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import {
    clearTicket,
    fetchTicket,
    findAndSetCustomer,
    goToNextTicket,
    setCustomer,
    setStatus,
} from 'state/ticket/actions'
import { getAppliedMacro } from 'state/ticket/selectors'
import { getSourceTypeOfResponse } from 'state/ticket/utils'
import { updateCursor } from 'state/tickets/actions'
import type { RootState } from 'state/types'
import { getActiveView } from 'state/views/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import { updateMessageText } from './components/ReplyArea/TicketReplyEditor'
import useGoToNextTicket from './components/TicketNavigation/hooks/useGoToNextTicket'
import useGoToPreviousTicket from './components/TicketNavigation/hooks/useGoToPreviousTicket'
// oxlint-disable-next-line no-named-as-default
import TicketView from './components/TicketView'
import useDraftTicketActivityTracking from './hooks/useDraftTicketActivityTracking'
import useTicketActivityTracking from './hooks/useTicketActivityTracking'
import { useTicketFieldsCheck } from './hooks/useTicketFieldsCheck'

import css from './TicketDetail.less'

export type SubmitArgs = {
    status?: TicketStatus
    action?: string
    resetMessage?: boolean
}

type Props = {
    onGoToNextTicket?: () => void
    onToggleUnread?: OnToggleUnreadFn
} & ConnectedProps<typeof connector>

export const TicketDetailContainer = ({
    activeCustomer,
    activeView,
    canSendMessage,
    clearTicket,
    currentUser,
    fetchCustomer,
    fetchTicket,
    findAndSetCustomer,
    goToNextTicket,
    newMessage,
    newMessageSource,
    prepareTicketMessage,
    prepare,
    sendTicketMessage,
    setCustomer,
    setSender,
    setReceivers,
    setStatus,
    submitTicket,
    ticket,
    updateCursor,
    onGoToNextTicket,
    onToggleUnread,
}: Props) => {
    const dispatch = useAppDispatch()
    const appliedMacro = useAppSelector(getAppliedMacro)
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const hasUIVisionMS3 = useHelpdeskV2MS3Flag()
    const { ticketId: ticketIdParam } = useParams<{ ticketId: string }>()
    const { customer: customerId } = useSearch<{ customer?: string }>()
    const ticketIdParamRef = useRef(ticketIdParam)
    const hasSelectedDefaultChannel = useRef(false)
    const { setRecentItem } = useRecentItems<PickedTicket>(RecentItems.Tickets)
    const { data: voiceCallsData, isLoading: isVoiceCallsDataLoading } =
        useListVoiceCalls(
            { ticket_id: ticket.get('id') },
            {
                enabled: !!ticket.get('id'),
                refetchOnWindowFocus: false,
            },
        )
    const location = useLocation<{
        source?: string
        sender?: string
        receiver?: {
            name: string
            address: string
        }
    }>()
    const { sender, source, receiver } = location.state ?? {}

    const { temporaryId } = useDraftMessages(ticketIdParam === 'new')

    useDraftTicketActivityTracking(temporaryId)

    const { isTranslationPending } = useOutboundTranslationContext()

    const { handleTicketMessageTranslationEvents } =
        useLiveTicketTranslationsUpdates({
            ticketId: ticket.get('id'),
            ticketLanguage: ticket.get('language'),
            ticketMessages: ticket.get('messages')?.toJS() ?? [],
        })

    useEffect(() => {
        ticketIdParamRef.current = ticketIdParam
    })

    const [isTicketHidden, setIsTicketHidden] = useState(false)

    const ticketId = useMemo(() => ticket.get('id') as number, [ticket])
    const ticketStatus = useMemo(() => ticket.get('status') as string, [ticket])

    useTicketActivityTracking(
        ticketIdParam &&
            Number(ticketIdParam) === ticketId &&
            ticketStatus !== TicketStatus.Closed
            ? ticketId
            : undefined,
    )

    const recipients = useMemo(
        () => (newMessageSource.get('to') || fromJS([])) as List<any>,
        [newMessageSource],
    )
    const customer = useMemo(
        () => (ticket.get('customer') || fromJS({})) as Map<any, any>,
        [ticket],
    )
    const prevCustomer = usePrevious(customer)
    const isLoading =
        (ticketIdParam !== 'new' && !ticket.get('id')) ||
        (ticketIdParam === 'new' && ticket.get('id')) ||
        ticket.getIn(['_internal', 'loading', 'fetchTicket'])

    const isLoadingPhoneTicketData = useMemo(
        () =>
            ticket.get('channel') === TicketChannel.Phone &&
            !voiceCallsData &&
            isVoiceCallsDataLoading,
        [ticket, voiceCallsData, isVoiceCallsDataLoading],
    )

    useEffect(() => {
        if (
            !isVoiceCallsDataLoading &&
            !isLoadingPhoneTicketData &&
            !!voiceCallsData?.data?.length &&
            !hasSelectedDefaultChannel.current
        ) {
            const sourceType = getSourceTypeOfResponse(
                ticket.get('messages'),
                ticket.get('via'),
                ticket.get('id'),
            )
            prepare(sourceType)
            hasSelectedDefaultChannel.current = true
        }
    }, [
        isVoiceCallsDataLoading,
        isLoadingPhoneTicketData,
        ticket,
        prepare,
        voiceCallsData,
    ])

    const { checkTicketFieldErrors } = useTicketFieldsCheck(ticketId)
    const { validateTicketFields } = useTicketFieldsValidation(ticketId)

    useEffect(() => {
        if (
            ticketIdParam === 'new' &&
            customerId &&
            (activeCustomer.get('id') as number) !== parseInt(customerId)
        ) {
            void fetchCustomer(customerId)
        }

        return () => {
            const customerId = ticket.getIn(['customer', 'id'])

            // leaving ticket and request customer from socket io
            if (ticketIdParam && ticketIdParam !== 'new') {
                socketManager.leave(JoinEventType.Ticket, ticketIdParam)
            }

            if (customerId) {
                socketManager.leave(JoinEventType.Customer, customerId)
            }

            clearTicket()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const emailThreadSizeFF = useFlag(FeatureFlagKey.EmailReducedThreadSize)

    const { goToTicket: goToPrevious, isEnabled: isPrevEnabled } =
        useGoToPreviousTicket(ticketIdParam)

    const { goToTicket: goToNext, isEnabled: isNextEnabled } =
        useGoToNextTicket(ticketIdParam)

    const [{ loading: isGoToPrevOrNextTicketPending }, goToPrevOrNextTicket] =
        useAsyncFn(
            async (direction: 'prev' | 'next') => {
                // Disable Ticket navigation via keyboard shortcuts (`<-` & `->`) when
                // we are on the ticket page via direct URL, or we are creating a new ticket
                if (direction === 'prev' ? !isPrevEnabled : !isNextEnabled) {
                    return
                }

                clearTicket()
                return direction === 'prev' ? goToPrevious() : goToNext()
            },
            [
                ticketIdParam,
                goToPrevious,
                goToNext,
                isPrevEnabled,
                isNextEnabled,
            ],
        )

    const prepareAndSubmitNewTicket = ({
        status,
        resetMessage,
    }: SubmitArgs) => {
        let submittedTicket
        const receiver = newMessage.getIn(['newMessage', 'receiver'])
        const sender = { id: currentUser.get('id') }

        const sourceType = newMessage.getIn(['newMessage', 'source', 'type'])
        submittedTicket = ticket.setIn(['newMessage', 'sender'], sender)

        const hasInternalNoteAction = (
            ticket.getIn(
                ['state', 'appliedMacro', 'actions'],
                fromJS([]),
            ) as List<Map<any, any>>
        ).some(
            (action) => action?.get('name') === MacroActionName.AddInternalNote,
        )

        // Ensure that a customer is always set on the ticket when created
        if (sourceType !== 'internal-note' && !hasInternalNoteAction) {
            submittedTicket = ticket.set('customer', receiver)
        }

        return submitTicket(
            submittedTicket,
            status,
            ticket.getIn(['state', 'appliedMacro', 'actions']),
            currentUser,
            resetMessage,
            temporaryId,
        )
    }

    /**
     * If the FF is ON we will avoid appending entire thread to body_html and body_text
     * For consistency and less chance of breaking existing implementation we will only remap values
     * using "userInput" that represents what user has entered in the text area
     */
    const submitNewMessage = async ({
        status,
        action,
        resetMessage = true,
    }: SubmitArgs) => {
        try {
            const { messageId, messageToSend, replyAreaState } =
                await prepareTicketMessage({
                    status,
                    macroActions: ticket.getIn([
                        'state',
                        'appliedMacro',
                        'actions',
                    ]),
                    resetMessage,
                    emailThreadSizeFF,
                })
            if (messageToSend.source.type === 'email') {
                pendingMessageManager.sendMessage({
                    messageId,
                    messageToSend,
                    action,
                    resetMessage,
                    ticketId: ticketIdParam,
                    replyAreaState,
                })
                return
            }
            pendingMessageManager.skipExistingTimer()
            return sendTicketMessage(
                messageId,
                messageToSend,
                action,
                resetMessage,
            )
        } catch (error) {
            if (
                !(error instanceof TicketMessageInvalidSendDataError) &&
                !(error instanceof TicketMessageActionValidationError)
            ) {
                throw error
            }
        }
    }

    const submit = async ({
        status,
        action,
        resetMessage = true,
    }: SubmitArgs) => {
        // For the MS1 of the Helpdesk 2.0, we don't really on the submit function to perform the ticket fields validation.
        if (
            !hasUIVisionMS1 &&
            status === TicketStatus.Closed &&
            checkTicketFieldErrors({ includeMacro: true })
        ) {
            return
        }
        if (newMessage.getIn(['_internal', 'loading', 'submitMessage'])) {
            // We're already submitting something, we dont want to POST twice.
            // Or the ticket isn't dirty, and we don't want to send an empty message.
            return
        }

        if (!canSendMessage) {
            return
        }

        // flush any pending updates from the TicketReplyEditor debouncer
        updateMessageText.flush()

        // The ticket does not exist yet.
        if (!ticket.get('id')) {
            const { error } = ((await prepareAndSubmitNewTicket({
                status,
                action,
                resetMessage,
            })) || {}) as { error: unknown }

            if (error) {
                return
            }
            localForageManager.clearTable(DRAFT_TICKET_STORE)
        } else {
            await submitNewMessage({ status, action, resetMessage })
        }

        const callback = onGoToNextTicket || maybeGoToNextTicket

        if (status === TicketStatus.Closed) {
            callback()
        }
    }

    useEffect(() => {
        shortcutManager.bind('TicketDetailContainer', {
            GO_BACK: {
                action: () => {
                    if (!isGoToPrevOrNextTicketPending) {
                        logEvent(
                            SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
                        )
                        void goToPrevOrNextTicket('prev')
                    }
                },
            },
            GO_FORWARD: {
                action: () => {
                    if (!isGoToPrevOrNextTicketPending) {
                        logEvent(
                            SegmentEvent.TicketKeyboardShortcutsNextNavigation,
                        )
                        void goToPrevOrNextTicket('next')
                    }
                },
            },
            SUBMIT_TICKET: {
                action: (e) => {
                    if (e.preventDefault) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                    }

                    if (!isTranslationPending) {
                        void submit({})
                    }
                },
            },
            SUBMIT_CLOSE_TICKET: {
                action: (e) => {
                    if (e.preventDefault) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                    }

                    const { hasErrors } = validateTicketFields(
                        getMacroTicketFieldValues(
                            appliedMacro?.toJS() as Macro,
                        ),
                    )
                    if (
                        hasUIVisionMS1 &&
                        hasErrors &&
                        ticketIdParam !== 'new'
                    ) {
                        dispatch(
                            notify({
                                status: NotificationStatus.Error,
                                message:
                                    'This ticket cannot be closed. Please fill the required fields.',
                            }),
                        )
                        return
                    }

                    if (!isTranslationPending) {
                        void submit({ status: TicketStatus.Closed })
                    }
                },
            },
        })
        return () => {
            shortcutManager.unbind('TicketDetailContainer')
        }
    })

    // if the ticket in the reducer is not the one asked, we fetch it and display it
    useEffect(() => {
        if ((ticket.get('id', '') as number).toString() !== ticketIdParam) {
            clearTicket()
            void fetchTicket(ticketIdParam || '', { isCurrentlyOnTicket: true })
        }

        showTicket()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketIdParam])

    useEffect(() => {
        if (prevCustomer) {
            // set customer and receiver from query
            // map default channel (email) to address, for the receivers select.
            const receiver = activeCustomer.set(
                'address',
                activeCustomer.get('email'),
            )

            if (
                ticketIdParam === 'new' &&
                customerId &&
                (activeCustomer.get('id') as number) === parseInt(customerId) &&
                !prevCustomer.equals(receiver)
            ) {
                // set customer on ticket (to show in infobar and be used in macros)
                void setCustomer(receiver)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCustomer, customerId, prevCustomer, ticketIdParam])

    useEffect(() => {
        if (
            source &&
            Object.values<string>(TicketMessageSourceType).includes(source)
        ) {
            prepare(source as TicketMessageSourceType)
            if (sender) {
                setSender(sender)
            }
        }
    }, [source, sender, setSender, prepare])

    // We update the cursor when we display the ticket for the first time.
    // If an attribute of the ticket changes, we don't want to update the cursor because
    // its position in the view has maybe changed.
    useEffect(() => {
        if (ticketId) {
            updateCursor(ticket.get(activeView.get('order_by')))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId])

    useEffect(() => {
        // When we're on a new ticket, that the recipients have changed, and
        // that there's now exactly one recipient,
        // set this recipient as customer of the ticket
        if (ticketIdParam === 'new' && recipients.size === 1) {
            const recipient = recipients.first() as Map<any, any>
            let shouldSetCustomer = true

            // The recipient address may be in the channels of the customer, and not be in his customer.email address, so
            // to be sure we are not re-setting the same customer as customer of the current ticket, we need to check every channel of the
            // current customer.
            if (customer && !customer.isEmpty()) {
                ;(
                    (customer.get('channels') || fromJS([])) as List<any>
                ).forEach((channel: Map<any, any>) => {
                    if (
                        channel.get('type') === 'email' &&
                        channel.get('address') === recipient.get('address')
                    ) {
                        shouldSetCustomer = false
                    }
                })
            }
            if (typeof recipient.get('id') === 'undefined') {
                shouldSetCustomer = false
            }
            if (shouldSetCustomer) {
                void findAndSetCustomer(recipient.get('id'))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipients])

    // When we're on a new ticket and the agent has removed the receivers of the new message, empty the
    // customer of the ticket
    // If the channel change to internal-note we don't want to unset the customer set by the user
    useEffect(() => {
        if (
            ticketIdParam === 'new' &&
            recipients.isEmpty() &&
            newMessageSource.get('type') !== 'internal-note'
        ) {
            void setCustomer(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipients])

    useEffectOnce(() => {
        if (ticketIdParam === 'new' && receiver) {
            setReceivers(
                {
                    to: [receiver],
                },
                false,
            )
        }
    })

    useEffect(() => {
        if (ticket.get('id')) {
            const ticketJS = ticket.toJS() as Ticket
            const ticketCustomer = ticketJS.customer || {}

            const pickedTicket = _pick(ticketJS, pickedTicketFields)
            const pickedCustomer = _pick(ticketCustomer, [
                'id',
                'name',
                'email',
            ]) as PickedTicket['customer']

            void setRecentItem({
                ...pickedTicket,
                customer: pickedCustomer,
            })
        }
    }, [ticket, setRecentItem])

    const trackCtrlFKeyCombo = () => {
        logEvent(SegmentEvent.TicketMessageSearchKeyPressed)
    }

    const ctrlFPredicate = (event: KeyboardEvent) => {
        return (
            ticketIdParam !== 'new' &&
            (isMacOs
                ? event.metaKey && event.key === 'f'
                : event.ctrlKey && event.key === 'f')
        )
    }

    useKey(ctrlFPredicate, trackCtrlFKeyCombo, { event: 'keydown' })

    const showTicket = () => {
        setIsTicketHidden(false)
    }

    const hideTicket = () => {
        return new Promise<void>((resolve) => {
            setIsTicketHidden(true)
            // 100ms to let the animation goes
            return setTimeout(resolve, 100)
        })
    }

    const maybeGoToNextTicket = () => {
        // If the history is open, we don't want to go to the next ticket
        if (!ticket.getIn(['_internal', 'displayHistory'])) {
            const promise = hideTicket().then(clearTicket)
            void goToNextTicket(parseInt(ticketIdParamRef.current), promise)
        }
    }

    const handleStatusChange = (status: string) => {
        if (status === TicketStatus.Closed) {
            if (checkTicketFieldErrors()) return
            logEvent(SegmentEvent.TicketCloseAction, {
                ticketId,
            })
        }

        return setStatus(status, () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Ticket has been closed',
                }),
            )

            const callback = onGoToNextTicket || maybeGoToNextTicket
            callback()
        })
    }

    const handleAblyEvent = useCallback(
        (event: DomainEvent) => {
            handleTicketMessageTranslationEvents(event)
        },
        [handleTicketMessageTranslationEvents],
    )

    const handleAblyEventRef = useRef(handleAblyEvent)

    useEffect(() => {
        handleAblyEventRef.current = handleAblyEvent
    }, [handleAblyEvent])

    const { joinTicket, leaveTicket } = useAgentActivity()

    useEffect(() => {
        joinTicket(Number(ticketIdParam), {
            onEvent: (event: DomainEvent) => {
                handleAblyEventRef.current(event)
            },
        })

        return () => {
            leaveTicket()
        }
    }, [ticketIdParam, joinTicket, leaveTicket])

    const isMobileResolution = useIsMobileResolution()

    if (isLoading || isLoadingPhoneTicketData) {
        return <Loader className={css.loader} message="Loading ticket..." />
    }

    const ticketView = (
        <TicketView
            hideTicket={hideTicket}
            isTicketHidden={isTicketHidden}
            submit={submit}
            setStatus={handleStatusChange}
            onGoToNextTicket={onGoToNextTicket}
            onToggleUnread={onToggleUnread}
        />
    )

    // Only wrap with provider on mobile, desktop already has it in TicketDetailWithInfobar
    if (isMobileResolution) {
        return (
            <KnowledgeSourceSideBarProvider>
                <MobileViewWithSidebar ticketView={ticketView} />
            </KnowledgeSourceSideBarProvider>
        )
    }

    if (hasUIVisionMS3) {
        return <TicketThread submit={submit} />
    }

    return ticketView
}

const connector = connect(
    (state: RootState) => ({
        activeView: getActiveView(state),
        activeCustomer: DEPRECATED_getActiveCustomer(state),
        currentUser: state.currentUser,
        ticket: state.ticket,
        newMessage: state.newMessage,
        canSendMessage: canSend(state),
        newMessageSource: getNewMessageSource(state),
    }),
    {
        clearTicket,
        fetchCustomer,
        fetchTicket,
        findAndSetCustomer,
        goToNextTicket,
        prepare,
        prepareTicketMessage,
        sendTicketMessage,
        setCustomer,
        setSender,
        setReceivers,
        setStatus,
        submitTicket,
        updateCursor,
    },
)

// Helper component to access the sidebar context
function MobileViewWithSidebar({
    ticketView,
}: {
    ticketView: React.ReactNode
}) {
    const { mode } = useKnowledgeSourceSideBar()

    return (
        <>
            {ticketView}
            {mode && <KnowledgeSourceSidebarWrapper />}
        </>
    )
}

export default connector(TicketDetailContainer)
