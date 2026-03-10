import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import type { ContentState } from 'draft-js'
import { convertToRaw, EditorState } from 'draft-js'

import type { DomainEvent, DomainEventWithType } from '@gorgias/events'
import { useChannel } from '@gorgias/realtime-ably'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { setTranslationState } from 'state/newMessage/actions'
import ticketReplyCache from 'state/newMessage/ticketReplyCache'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { contentStateFromTextOrHTML } from 'utils/editor'

export type OutboundTranslationData = {
    translatedContent: ContentState
    ticketId?: string | number
}

export type OutboundTranslationContextValue = {
    ticketIdToDraftIdMap: Map<string, string>
    registerTranslationDraft: (ticketId: string, draftId: string) => void
    registerEditorMethods: ({
        getEditorState,
        setEditorState,
    }: {
        getEditorState: () => EditorState
        setEditorState: (editorState: EditorState) => void
    }) => void
    unregisterTranslationDraft: (ticketId: string) => void
    isTranslationPending: boolean
}

export const OutboundTranslationContext = createContext<
    OutboundTranslationContextValue | undefined
>(undefined)

export const useOutboundTranslationContext =
    (): OutboundTranslationContextValue => {
        const context = useContext(OutboundTranslationContext)
        if (!context) {
            throw new Error(
                'useOutboundTranslationContext must be used within OutboundTranslationProvider',
            )
        }
        return context
    }

type OutboundTranslationProviderProps = {
    children: React.ReactNode
    ticketId?: string | number
}

const PENDING_TRANSLATION_TIMEOUT = 60_000

export const OutboundTranslationProvider = ({
    children,
    ticketId,
}: OutboundTranslationProviderProps) => {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const dispatch = useAppDispatch()

    const getEditorStateRef = useRef<(() => EditorState) | undefined>()
    const setEditorStateRef = useRef<
        ((editorState: EditorState) => void) | undefined
    >()

    const [ticketIdToDraftIdMap, setTicketIdToDraftIdMap] = useState<
        Map<string, string>
    >(new Map())

    const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

    const registerEditorMethods = useCallback(
        ({
            getEditorState,
            setEditorState,
        }: {
            getEditorState: () => EditorState
            setEditorState: (editorState: EditorState) => void
        }) => {
            getEditorStateRef.current = getEditorState
            setEditorStateRef.current = setEditorState
        },
        [],
    )

    const registerTranslationDraft = useCallback(
        (ticketId: string, draftId: string) => {
            setTicketIdToDraftIdMap((prev) => {
                const newMap = new Map(prev)
                newMap.set(ticketId, draftId)
                return newMap
            })

            const existingTimeout = timeoutRefs.current.get(ticketId)
            if (existingTimeout) {
                clearTimeout(existingTimeout)
            }

            const timeout = setTimeout(() => {
                setTicketIdToDraftIdMap((prev) => {
                    const newMap = new Map(prev)
                    newMap.delete(ticketId)
                    return newMap
                })
                timeoutRefs.current.delete(ticketId)

                dispatch(
                    notify({
                        message:
                            ticketId !== 'new'
                                ? `Translation on ticket ${ticketId} timed out. Please retry.`
                                : 'Translation timed out. Please retry.',
                        status: NotificationStatus.Info,
                    }),
                )
            }, PENDING_TRANSLATION_TIMEOUT)

            timeoutRefs.current.set(ticketId, timeout)
        },
        [dispatch],
    )

    const clearDraftTimeout = useCallback((ticketId: string) => {
        const timeout = timeoutRefs.current.get(ticketId)
        if (timeout) {
            clearTimeout(timeout)
            timeoutRefs.current.delete(ticketId)
        }
    }, [])

    const unregisterTranslationDraft = useCallback(
        (ticketId: string) => {
            setTicketIdToDraftIdMap((prev) => {
                const newMap = new Map(prev)
                newMap.delete(ticketId)
                return newMap
            })

            clearDraftTimeout(ticketId)
        },
        [clearDraftTimeout],
    )

    const handleTranslationCompletedEvent = useCallback(
        (
            event: DomainEventWithType<'//helpdesk/draft-ticket-message-translation.completed'>,
        ) => {
            const { stripped_html, stripped_text, id: draft_id } = event.data

            const translatedContentState = contentStateFromTextOrHTML(
                stripped_text || undefined,
                stripped_html || undefined,
            )

            let translationTicketId: string | undefined
            for (const [
                translationid,
                draftId,
            ] of ticketIdToDraftIdMap.entries()) {
                if (draftId === draft_id) {
                    translationTicketId = translationid
                    break
                }
            }

            if (!translationTicketId) {
                return
            }

            if (ticketId && String(ticketId) === translationTicketId) {
                dispatch(
                    setTranslationState({
                        translatedContentState: translatedContentState,
                    }),
                )

                if (getEditorStateRef.current && setEditorStateRef.current) {
                    const currentEditorState = getEditorStateRef.current?.()
                    const newEditorState = EditorState.createWithContent(
                        translatedContentState,
                        currentEditorState.getDecorator(),
                    )
                    setEditorStateRef.current?.(newEditorState)
                }
            } else {
                const cachedTicket = ticketReplyCache.get(translationTicketId)

                const originalContentState = cachedTicket.get('contentState')

                if (originalContentState) {
                    ticketReplyCache.set(translationTicketId, {
                        contentState: convertToRaw(translatedContentState),
                        originalContentState: originalContentState,
                    })
                }
            }

            clearDraftTimeout(translationTicketId as string)

            setTicketIdToDraftIdMap((prev) => {
                const newMap = new Map(prev)
                newMap.delete(translationTicketId as string)
                return newMap
            })
        },
        [ticketId, ticketIdToDraftIdMap, dispatch, clearDraftTimeout],
    )

    const handleTranslationFailedEvent = useCallback(
        (
            event: DomainEventWithType<'//helpdesk/draft-ticket-message-translation.failed'>,
        ) => {
            const { id: draft_id } = event.data

            if (draft_id) {
                setTicketIdToDraftIdMap((prev) => {
                    let failedTicketId: string | undefined

                    const newMap = new Map(prev)
                    for (const [ticketId, draftId] of newMap.entries()) {
                        if (draftId === draft_id) {
                            failedTicketId = ticketId
                            newMap.delete(ticketId)
                            break
                        }
                    }

                    if (failedTicketId) {
                        clearDraftTimeout(failedTicketId as string)
                        dispatch(
                            notify({
                                message:
                                    failedTicketId !== 'new'
                                        ? `Translation on ticket ${failedTicketId} failed. Please retry.`
                                        : 'Translation failed. Please retry.',
                                status: NotificationStatus.Error,
                            }),
                        )
                    }

                    return newMap
                })
            }
        },
        [dispatch, clearDraftTimeout],
    )

    const handleChannelEvent = useCallback(
        (event: DomainEvent) => {
            if (
                event.dataschema ===
                '//helpdesk/draft-ticket-message-translation.completed/1.0.0'
            ) {
                handleTranslationCompletedEvent(event)
            } else if (
                event.dataschema ===
                '//helpdesk/draft-ticket-message-translation.failed/1.0.0'
            ) {
                handleTranslationFailedEvent(event)
            }
        },
        [handleTranslationCompletedEvent, handleTranslationFailedEvent],
    )

    useChannel({
        channel: {
            name: 'user',
            accountId,
            userId,
        },
        onEvent: handleChannelEvent,
    })

    useEffect(() => {
        return () => {
            // we want to access the current value of timeoutRefs.current
            // eslint-disable-next-line react-hooks/exhaustive-deps
            timeoutRefs.current.forEach((timeout) => {
                clearTimeout(timeout)
            })
            // eslint-disable-next-line react-hooks/exhaustive-deps
            timeoutRefs.current.clear()
        }
    }, [])

    const isTranslationPending = useMemo(() => {
        const draftId = ticketIdToDraftIdMap.get(String(ticketId))
        return !!draftId
    }, [ticketIdToDraftIdMap, ticketId])

    const value = useMemo(
        () => ({
            ticketIdToDraftIdMap,
            registerEditorMethods,
            registerTranslationDraft,
            unregisterTranslationDraft,
            isTranslationPending,
        }),
        [
            ticketIdToDraftIdMap,
            registerEditorMethods,
            registerTranslationDraft,
            unregisterTranslationDraft,
            isTranslationPending,
        ],
    )

    return (
        <OutboundTranslationContext.Provider value={value}>
            {children}
        </OutboundTranslationContext.Provider>
    )
}
