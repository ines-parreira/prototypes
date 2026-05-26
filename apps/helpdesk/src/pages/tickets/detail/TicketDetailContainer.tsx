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
import { useRealtimeTicketUpdates } from '@repo/ticket-thread'
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

import { Button, Text, toast } from '@gorgias/axiom'
import type { DomainEvent } from '@gorgias/events'
import type { Macro } from '@gorgias/helpdesk-types'
import { useAgentActivity } from '@gorgias/realtime'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
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
import { TicketThreadLegacyBridge } from 'pages/tickets/detail/components/TicketThread/TicketThreadLegacyBridge'
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
    TicketMessageIdentityMismatchError,
    TicketMessageInvalidSendDataError,
} from 'state/newMessage/errors'
import { canSend, getNewMessageSource } from 'state/newMessage/selectors'
import {
    getBrowserTicketSubmissionDiagnostics,
    getTicketMessageDiagnostics,
    haveDifferentTicketIds,
    reportTicketMessageSubmissionIdentityMismatch,
} from 'state/newMessage/ticketSubmissionDiagnostics'
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
    const appliedMacro = useAppSelector(getAppliedMacro)
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const hasUIVisionMS3 = useHelpdeskV2MS3Flag()
    const { ticketId: ticketIdParam } = useParams<{ ticketId: string }>()
    const { customer: customerId } = useSearch<{ customer?: string }>()
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
    const { handleTicketUpdateEvents } = useRealtimeTicketUpdates({
        ticketId: ticket.get('id'),
    })

    const [isTicketHidden, setIsTicketHidden] = useState(false)

    const ticketId = useMemo(() => ticket.get('id') as number, [ticket])
    const routeTicketId = useMemo(() => {
        if (!ticketIdParam || ticketIdParam === 'new') {
            return undefined
        }

        const parsedTicketId = Number(ticketIdParam)
        return Number.isNaN(parsedTicketId) ? undefined : parsedTicketId
    }, [ticketIdParam])
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

    const { checkTicketFieldErrors } = useTicketFieldsCheck(routeTicketId)
    const { validateTicketFields } = useTicketFieldsValidation(routeTicketId)

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
    const isTicketMessageSubmissionIdentityReportingEnabled = useFlag(
        FeatureFlagKey.TicketMessagesAssignedToWrongTicketDebugging,
    )
    const isDebugMenuFlagEnabled = useFlag(FeatureFlagKey.DebugMenu, false)
    const isTicketIdentityDebugMenuEnabled =
        isDebugMenuFlagEnabled || !!window.USER_IMPERSONATED

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

    const prepareAndSubmitNewTicket = useCallback(
        ({ status, resetMessage }: SubmitArgs) => {
            let submittedTicket
            const receiver = newMessage.getIn(['newMessage', 'receiver'])
            const sender = { id: currentUser.get('id') }

            const sourceType = newMessage.getIn([
                'newMessage',
                'source',
                'type',
            ])
            submittedTicket = ticket.setIn(['newMessage', 'sender'], sender)

            const hasInternalNoteAction = (
                ticket.getIn(
                    ['state', 'appliedMacro', 'actions'],
                    fromJS([]),
                ) as List<Map<any, any>>
            ).some(
                (action) =>
                    action?.get('name') === MacroActionName.AddInternalNote,
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
        },
        [currentUser, newMessage, submitTicket, temporaryId, ticket],
    )

    const showTicket = useCallback(() => {
        setIsTicketHidden(false)
    }, [])

    const hideTicket = useCallback(() => {
        return new Promise<void>((resolve) => {
            setIsTicketHidden(true)
            // 100ms to let the animation goes
            return setTimeout(resolve, 100)
        })
    }, [])

    const getSubmitDiagnosticsContext = useCallback(
        ({
            action,
            reduxTicketId,
            resetMessage,
            status,
            ticketIdUrl,
            submittedTicketId,
        }: SubmitArgs & {
            reduxTicketId: Maybe<number>
            submittedTicketId: Maybe<number | string>
            ticketIdUrl: Maybe<string>
        }) => ({
            ...getBrowserTicketSubmissionDiagnostics(),
            ticket_id_url: ticketIdUrl,
            ticket_id_redux: reduxTicketId,
            ticket_id_submitted: submittedTicketId,
            status,
            action,
            reset_message: resetMessage,
            source_type: newMessage.getIn(['newMessage', 'source', 'type']),
            is_helpdesk_v2: hasUIVisionMS1 || hasUIVisionMS3,
            ticket_message_submission_identity_reporting_enabled:
                isTicketMessageSubmissionIdentityReportingEnabled,
        }),
        [
            hasUIVisionMS1,
            hasUIVisionMS3,
            isTicketMessageSubmissionIdentityReportingEnabled,
            newMessage,
        ],
    )

    const maybeGoToNextTicket = useCallback(
        (closedTicketId: Maybe<number | string> = ticketIdParam) => {
            const closedTicketIdNumber = Number(closedTicketId)
            if (Number.isNaN(closedTicketIdNumber)) {
                return
            }

            // If the history is open, we don't want to go to the next ticket
            if (!ticket.getIn(['_internal', 'displayHistory'])) {
                const promise = hideTicket().then(clearTicket)
                void goToNextTicket(closedTicketIdNumber, promise)
            }
        },
        [clearTicket, goToNextTicket, hideTicket, ticket, ticketIdParam],
    )

    /**
     * If the FF is ON we will avoid appending entire thread to body_html and body_text
     * For consistency and less chance of breaking existing implementation we will only remap values
     * using "userInput" that represents what user has entered in the text area
     */
    const submitNewMessage = useCallback(
        async (
            { status, action, resetMessage = true }: SubmitArgs,
            submittedTicketId: string,
        ) => {
            try {
                const baseSubmitDiagnosticsContext =
                    getSubmitDiagnosticsContext({
                        reduxTicketId: ticket.get('id') as Maybe<number>,
                        ticketIdUrl: submittedTicketId,
                        submittedTicketId,
                        status,
                        action,
                        resetMessage,
                    })
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
                        submittedTicketId,
                        submissionContext: baseSubmitDiagnosticsContext,
                    })
                const submitDiagnosticsContext = {
                    ...baseSubmitDiagnosticsContext,
                    ticket_id_redux: ticket.get('id'),
                    ticket_id_submitted: submittedTicketId,
                    ...getTicketMessageDiagnostics(messageToSend),
                }

                if (
                    haveDifferentTicketIds(ticketIdParam, submittedTicketId) ||
                    haveDifferentTicketIds(
                        ticket.get('id'),
                        submittedTicketId,
                    ) ||
                    haveDifferentTicketIds(
                        messageToSend.ticket_id,
                        submittedTicketId,
                    )
                ) {
                    reportTicketMessageSubmissionIdentityMismatch(
                        'after_prepare',
                        submitDiagnosticsContext,
                    )
                }

                if (messageToSend.source.type === 'email') {
                    pendingMessageManager.sendMessage({
                        messageId,
                        messageToSend,
                        action,
                        resetMessage,
                        ticketId: submittedTicketId,
                        replyAreaState,
                        submissionContext: submitDiagnosticsContext,
                    })
                    return
                }
                pendingMessageManager.skipExistingTimer()
                return sendTicketMessage(
                    messageId,
                    messageToSend,
                    action,
                    resetMessage,
                    submittedTicketId,
                    submitDiagnosticsContext,
                )
            } catch (error) {
                if (error instanceof TicketMessageIdentityMismatchError) {
                    void fetchTicket(submittedTicketId, {
                        isCurrentlyOnTicket: true,
                    })
                    toast.error(error.message)
                    return
                }

                if (
                    !(error instanceof TicketMessageInvalidSendDataError) &&
                    !(error instanceof TicketMessageActionValidationError)
                ) {
                    throw error
                }
            }
        },
        [
            emailThreadSizeFF,
            fetchTicket,
            getSubmitDiagnosticsContext,
            prepareTicketMessage,
            sendTicketMessage,
            ticket,
            ticketIdParam,
        ],
    )

    const submit = useCallback(
        async ({ status, action, resetMessage = true }: SubmitArgs) => {
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

            const reduxTicketId = ticket.get('id') as Maybe<number>
            const submittedTicketId = ticketIdParam
            let closedTicketId = submittedTicketId
            if (haveDifferentTicketIds(submittedTicketId, reduxTicketId)) {
                reportTicketMessageSubmissionIdentityMismatch(
                    'submit_click',
                    getSubmitDiagnosticsContext({
                        reduxTicketId,
                        ticketIdUrl: submittedTicketId,
                        submittedTicketId,
                        status,
                        action,
                        resetMessage,
                    }),
                )
            }

            // The ticket does not exist yet.
            if (!submittedTicketId || submittedTicketId === 'new') {
                const { error, resp } = ((await prepareAndSubmitNewTicket({
                    status,
                    action,
                    resetMessage,
                })) || {}) as {
                    error: unknown
                    resp?: Pick<Ticket, 'id'>
                }

                if (error) {
                    return
                }
                if (resp?.id) {
                    closedTicketId = String(resp.id)
                }
                localForageManager.clearTable(DRAFT_TICKET_STORE)
            } else {
                await submitNewMessage(
                    { status, action, resetMessage },
                    submittedTicketId,
                )
            }

            if (status === TicketStatus.Closed) {
                if (onGoToNextTicket) {
                    onGoToNextTicket()
                } else {
                    maybeGoToNextTicket(closedTicketId)
                }
            }
        },
        [
            canSendMessage,
            checkTicketFieldErrors,
            hasUIVisionMS1,
            maybeGoToNextTicket,
            newMessage,
            onGoToNextTicket,
            prepareAndSubmitNewTicket,
            getSubmitDiagnosticsContext,
            submitNewMessage,
            ticket,
            ticketIdParam,
        ],
    )

    useEffect(() => {
        shortcutManager.bind('TicketDetailContainer', {
            ...(hasUIVisionMS1
                ? {}
                : {
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
                  }),
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
                        toast.error(
                            'This ticket cannot be closed. Please fill the required fields.',
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

    const handleStatusChange = (status: string) => {
        if (status === TicketStatus.Closed) {
            if (checkTicketFieldErrors()) return
            logEvent(SegmentEvent.TicketCloseAction, {
                ticketId,
            })
        }

        return setStatus(status, () => {
            toast.success('Ticket has been closed')

            const callback = onGoToNextTicket || maybeGoToNextTicket
            callback()
        })
    }

    const handleAblyEvent = useCallback(
        (event: DomainEvent) => {
            handleTicketMessageTranslationEvents(event)
            if (hasUIVisionMS3) {
                handleTicketUpdateEvents(event)
            }
        },
        [
            handleTicketMessageTranslationEvents,
            handleTicketUpdateEvents,
            hasUIVisionMS3,
        ],
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
    const ticketIdentityDebugMenu = isTicketIdentityDebugMenuEnabled ? (
        <TicketIdentityDebugMenu
            reduxTicketId={ticket.get('id') as Maybe<number>}
            ticket={ticket}
            urlTicketId={ticketIdParam}
            newMessage={newMessage}
        />
    ) : null

    if (isLoading || isLoadingPhoneTicketData) {
        return (
            <>
                <Loader className={css.loader} message="Loading ticket..." />
                {ticketIdentityDebugMenu}
            </>
        )
    }

    const ticketView = (
        <>
            <TicketView
                hideTicket={hideTicket}
                isTicketHidden={isTicketHidden}
                submit={submit}
                setStatus={handleStatusChange}
                onGoToNextTicket={onGoToNextTicket}
                onToggleUnread={onToggleUnread}
            />
            {ticketIdentityDebugMenu}
        </>
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
        return (
            <>
                <TicketThreadLegacyBridge>
                    <TicketThread submit={submit} />
                </TicketThreadLegacyBridge>
                {ticketIdentityDebugMenu}
                <DrillDownModal isLegacy={false} />
            </>
        )
    }

    return <>{ticketView}</>
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
            <DrillDownModal isLegacy={false} />
        </>
    )
}

type TicketIdentityDebugMenuProps = {
    reduxTicketId: Maybe<number | string>
    ticket: Map<any, any>
    urlTicketId: Maybe<string>
    newMessage: Map<any, any>
}

function TicketIdentityDebugMenu({
    reduxTicketId,
    ticket,
    urlTicketId,
    newMessage,
}: TicketIdentityDebugMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const debugState = useMemo(
        () => ({
            ticket_id_redux: reduxTicketId,
            ticket_id_url: urlTicketId,
            ticket_fetch: getTicketFetchDebugState(ticket, urlTicketId),
            composer: getComposerDebugState(newMessage),
        }),
        [newMessage, reduxTicketId, ticket, urlTicketId],
    )
    const debugStateJson = useMemo(
        () => JSON.stringify(debugState, null, 2),
        [debugState],
    )

    const copyDebugState = useCallback(() => {
        console.warn('Ticket identity debug state', debugState)
        const clipboard = window.navigator.clipboard

        if (!clipboard) {
            return
        }

        void clipboard.writeText(debugStateJson).then(() => {
            toast.success('Ticket debug state copied')
        })
    }, [debugState, debugStateJson])

    return (
        <div className={css.ticketIdentityDebugMenu}>
            <Button
                aria-controls="ticket-identity-debug-panel"
                aria-expanded={isOpen}
                aria-label="Toggle ticket identity debug menu"
                icon="system-window-terminal"
                onClick={() => setIsOpen((current) => !current)}
                size="sm"
                variant={isOpen ? 'secondary' : 'tertiary'}
            />
            {isOpen && (
                <div
                    aria-label="Ticket identity debug details"
                    className={css.ticketIdentityDebugPanel}
                    id="ticket-identity-debug-panel"
                    role="dialog"
                >
                    <div className={css.ticketIdentityDebugHeader}>
                        <Text size="sm" variant="bold">
                            Ticket identity debug
                        </Text>
                        <Button
                            aria-label="Copy ticket identity debug state"
                            icon="copy"
                            onClick={copyDebugState}
                            size="sm"
                            variant="tertiary"
                        />
                    </div>
                    <dl className={css.ticketIdentityDebugRows}>
                        <div>
                            <dt>Redux ticket id</dt>
                            <dd>{String(reduxTicketId ?? 'empty')}</dd>
                        </div>
                        <div>
                            <dt>URL ticket id</dt>
                            <dd>{String(urlTicketId ?? 'empty')}</dd>
                        </div>
                        <div>
                            <dt>Fetch loading</dt>
                            <dd>
                                {String(debugState.ticket_fetch.is_loading)}
                            </dd>
                        </div>
                        <div>
                            <dt>Latest fetch id</dt>
                            <dd>
                                {String(
                                    debugState.ticket_fetch
                                        .latest_requested_ticket_id ?? 'empty',
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>Fetch guard cleared</dt>
                            <dd>
                                {String(
                                    debugState.ticket_fetch
                                        .is_latest_fetch_guard_cleared,
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>Fetch matches URL</dt>
                            <dd>
                                {String(
                                    debugState.ticket_fetch
                                        .does_latest_fetch_match_url_ticket,
                                )}
                            </dd>
                        </div>
                    </dl>
                    <pre className={css.ticketIdentityDebugJson}>
                        {debugStateJson}
                    </pre>
                </div>
            )}
        </div>
    )
}

const toDebugValue = (value: unknown) => {
    if (
        value &&
        typeof value === 'object' &&
        typeof (value as { toJS?: () => unknown }).toJS === 'function'
    ) {
        return (value as { toJS: () => unknown }).toJS()
    }

    return value
}

const getContentStateTextLength = (contentState: unknown) => {
    if (
        !contentState ||
        typeof (contentState as { getPlainText?: () => string })
            .getPlainText !== 'function'
    ) {
        return null
    }

    return (contentState as { getPlainText: () => string }).getPlainText()
        .length
}

const isComparableDebugTicketId = (ticketId: unknown) =>
    ticketId !== undefined &&
    ticketId !== null &&
    ticketId !== '' &&
    ticketId !== 'new' &&
    !Number.isNaN(Number(ticketId))

const doDebugTicketIdsMatch = (
    firstTicketId: unknown,
    secondTicketId: unknown,
) =>
    isComparableDebugTicketId(firstTicketId) &&
    isComparableDebugTicketId(secondTicketId) &&
    Number(firstTicketId) === Number(secondTicketId)

const getTicketFetchDebugState = (
    ticket: Map<any, any>,
    urlTicketId: Maybe<string>,
) => {
    const latestRequestedTicketId = ticket.getIn([
        '_internal',
        'latestFetchTicketRequestedId',
    ])
    const reduxTicketId = ticket.get('id')

    return {
        is_loading: !!ticket.getIn(['_internal', 'loading', 'fetchTicket']),
        latest_requested_ticket_id: latestRequestedTicketId ?? null,
        is_latest_fetch_guard_cleared: latestRequestedTicketId == null,
        does_latest_fetch_match_url_ticket: doDebugTicketIdsMatch(
            latestRequestedTicketId,
            urlTicketId,
        ),
        does_redux_ticket_match_url_ticket: doDebugTicketIdsMatch(
            reduxTicketId,
            urlTicketId,
        ),
        is_latest_fetch_stale_for_url_ticket:
            isComparableDebugTicketId(latestRequestedTicketId) &&
            isComparableDebugTicketId(urlTicketId) &&
            !doDebugTicketIdsMatch(latestRequestedTicketId, urlTicketId),
    }
}

const getComposerDebugState = (newMessage: Map<any, any>) => {
    const replyAreaState = newMessage.get('state') as Maybe<Map<any, any>>
    const message = newMessage.get('newMessage') as Maybe<Map<any, any>>

    return {
        internal: toDebugValue(newMessage.get('_internal')),
        reply_area_state: {
            dirty: replyAreaState?.get('dirty'),
            email_extra_added: replyAreaState?.get('emailExtraAdded'),
            cache_added: replyAreaState?.get('cacheAdded'),
            force_update: replyAreaState?.get('forceUpdate'),
            force_focus: replyAreaState?.get('forceFocus'),
            first_new_message: replyAreaState?.get('firstNewMessage'),
            has_selection_state: !!replyAreaState?.get('selectionState'),
            content_text_length: getContentStateTextLength(
                replyAreaState?.get('contentState'),
            ),
            original_content_text_length: getContentStateTextLength(
                replyAreaState?.get('originalContentState'),
            ),
            applied_macro: toDebugValue(replyAreaState?.get('appliedMacro')),
            inserted_discounts: toDebugValue(
                replyAreaState?.get('inserted_discounts'),
            ),
        },
        new_message: {
            ticket_id: message?.get('ticket_id'),
            source_type: message?.getIn(['source', 'type']),
            channel: message?.get('channel'),
            public: message?.get('public'),
            from_agent: message?.get('from_agent'),
            subject: message?.get('subject'),
            body_text_length: String(message?.get('body_text') ?? '').length,
            body_html_length: String(message?.get('body_html') ?? '').length,
            attachments_count: message?.get('attachments')?.size ?? 0,
            actions_count: message?.get('actions')?.size ?? 0,
            source: toDebugValue(message?.get('source')),
        },
    }
}

export default connector(TicketDetailContainer)
