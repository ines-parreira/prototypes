import { useCallback, useEffect } from 'react'

import { EditorState } from 'draft-js'

import { DomainEvent } from '@gorgias/events'
import { Language, useTranslateTicketDraft } from '@gorgias/helpdesk-queries'
import { useChannel } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import {
    clearTranslationState,
    setTranslationPending,
    setTranslationState,
} from 'state/newMessage/actions'
import {
    getIsTranslationPending,
    getOriginalContentState,
    hasTranslation as hasTranslationSelector,
} from 'state/newMessage/selectors'
import { contentStateFromTextOrHTML, convertToHTML } from 'utils/editor'

export function useTranslation(
    getEditorState: () => EditorState,
    setEditorState: (editorState: EditorState) => void,
) {
    const dispatch = useAppDispatch()
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const hasTranslation = useAppSelector(hasTranslationSelector)
    const originalContent = useAppSelector(getOriginalContentState)
    const isTranslationPending = useAppSelector(getIsTranslationPending)

    const {
        mutate: translateTicketDraft,
        isLoading: isLoadingTranslationRequest,
        isError: isTranslationError,
    } = useTranslateTicketDraft()

    const isTranslating = isLoadingTranslationRequest || isTranslationPending

    const handleChannelEvent = useCallback(
        (event: DomainEvent) => {
            if (
                event.dataschema ===
                '//helpdesk/draft-ticket-message-translation.completed/1.0.0'
            ) {
                const { stripped_html, stripped_text } = event.data

                const translatedContentState = contentStateFromTextOrHTML(
                    stripped_text || undefined,
                    stripped_html || undefined,
                )

                dispatch(
                    setTranslationState({
                        translatedContentState,
                    }),
                )

                const currentEditorState = getEditorState()
                const newEditorState = EditorState.push(
                    currentEditorState,
                    translatedContentState,
                    'insert-characters',
                )

                setEditorState(newEditorState)
                dispatch(setTranslationPending(false))
            } else if (
                event.dataschema ===
                '//helpdesk/draft-ticket-message-translation.failed/1.0.0'
            ) {
                dispatch(setTranslationPending(false))
            }
        },
        [dispatch, getEditorState, setEditorState],
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
        if (isTranslationError) {
            dispatch(setTranslationPending(false))
        }
    }, [dispatch, isTranslationError])

    const requestTranslation = useCallback(
        async (languageCode: Language) => {
            const editorState = getEditorState()
            const contentState = editorState.getCurrentContent()

            const strippedHtml = convertToHTML(contentState)
            const strippedText = contentState.getPlainText()

            if (!strippedText.trim()) {
                return
            }

            dispatch(setTranslationPending(true))
            translateTicketDraft({
                data: {
                    language: languageCode,
                    ...(strippedHtml
                        ? { stripped_html: strippedHtml }
                        : { stripped_text: strippedText }),
                },
            })
        },
        [dispatch, getEditorState, translateTicketDraft],
    )

    const toggleOriginal = useCallback(() => {
        if (hasTranslation) {
            dispatch(clearTranslationState())

            const currentEditorState = getEditorState()
            const newEditorState = EditorState.push(
                currentEditorState,
                originalContent,
                'insert-characters',
            )
            setEditorState(newEditorState)
        }
    }, [
        dispatch,
        getEditorState,
        originalContent,
        setEditorState,
        hasTranslation,
    ])

    return {
        isTranslating,
        hasTranslation,
        requestTranslation,
        toggleOriginal,
    }
}
