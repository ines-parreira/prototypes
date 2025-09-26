import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react'

import { ContentState, convertToRaw, EditorState } from 'draft-js'

import { DomainEvent } from '@gorgias/events'
import { useChannel } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { setTranslationState } from 'state/newMessage/actions'
import ticketReplyCache from 'state/newMessage/ticketReplyCache'
import { ExtractEvent } from 'tickets/core/hooks/translations/types'
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

export const OutboundTranslationProvider = ({
    children,
    ticketId,
}: OutboundTranslationProviderProps) => {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const dispatch = useAppDispatch()
    //const { ticketId } = useParams<{ ticketId: string }>()

    const getEditorStateRef = useRef<(() => EditorState) | undefined>()
    const setEditorStateRef = useRef<
        ((editorState: EditorState) => void) | undefined
    >()

    const [ticketIdToDraftIdMap, setTicketIdToDraftIdMap] = useState<
        Map<string, string>
    >(new Map())

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
        },
        [],
    )

    const unregisterTranslationDraft = useCallback((ticketId: string) => {
        setTicketIdToDraftIdMap((prev) => {
            const newMap = new Map(prev)
            newMap.delete(ticketId)
            return newMap
        })
    }, [])

    const handleTranslationCompletedEvent = useCallback(
        (
            event: ExtractEvent<'//helpdesk/draft-ticket-message-translation.completed/1.0.0'>,
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
                    const newEditorState = EditorState.push(
                        currentEditorState,
                        translatedContentState,
                        'insert-characters',
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

            setTicketIdToDraftIdMap((prev) => {
                const newMap = new Map(prev)
                newMap.delete(translationTicketId as string)
                return newMap
            })
        },
        [ticketId, ticketIdToDraftIdMap, dispatch],
    )

    const handleTranslationFailedEvent = useCallback(
        (
            event: ExtractEvent<'//helpdesk/draft-ticket-message-translation.failed/1.0.0'>,
        ) => {
            const { id: draft_id } = event.data

            if (draft_id) {
                setTicketIdToDraftIdMap((prev) => {
                    const newMap = new Map(prev)
                    for (const [ticketId, draftId] of newMap.entries()) {
                        if (draftId === draft_id) {
                            newMap.delete(ticketId)
                            break
                        }
                    }
                    return newMap
                })
            }
        },
        [],
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
