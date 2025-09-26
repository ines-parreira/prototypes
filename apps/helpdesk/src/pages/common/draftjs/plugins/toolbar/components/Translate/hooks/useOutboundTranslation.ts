import { useCallback, useEffect, useMemo } from 'react'

import { EditorState } from 'draft-js'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { Language, useTranslateTicketDraft } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider/OutboundTranslationProvider'
import { clearTranslationState } from 'state/newMessage/actions'
import {
    getOriginalContentState,
    hasTranslation as hasTranslationSelector,
} from 'state/newMessage/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { convertToHTML } from 'utils/editor'

export function useOutboundTranslation(
    getEditorState: () => EditorState,
    setEditorState: (editorState: EditorState) => void,
) {
    const dispatch = useAppDispatch()
    const { ticketId } = useParams<{ ticketId: string }>()
    const hasTranslation = useAppSelector(hasTranslationSelector)
    const originalContent = useAppSelector(getOriginalContentState)
    const {
        registerTranslationDraft,
        unregisterTranslationDraft,
        isTranslationPending,
        registerEditorMethods,
    } = useOutboundTranslationContext()

    const {
        mutate: translateTicketDraft,
        isLoading: isLoadingTranslationRequest,
        isError: isErrorTranslationRequest,
    } = useTranslateTicketDraft()

    useEffect(() => {
        registerEditorMethods({ getEditorState, setEditorState })
    }, [getEditorState, setEditorState, registerEditorMethods])

    const requestTranslation = useCallback(
        async (languageCode: Language) => {
            const editorState = getEditorState()
            const contentState = editorState.getCurrentContent()

            const strippedHtml = convertToHTML(contentState)
            const strippedText = contentState.getPlainText()

            if (!strippedText.trim()) {
                return
            }

            const draftId = uuidv4()

            if (ticketId) {
                registerTranslationDraft(ticketId, draftId)
            }

            translateTicketDraft({
                data: {
                    language: languageCode,
                    draft_id: draftId,
                    ...(strippedHtml
                        ? { stripped_html: strippedHtml }
                        : { stripped_text: strippedText }),
                },
            })
        },
        [
            translateTicketDraft,
            ticketId,
            registerTranslationDraft,
            getEditorState,
        ],
    )

    useEffect(() => {
        if (isErrorTranslationRequest) {
            unregisterTranslationDraft(ticketId)
            dispatch(
                notify({
                    message:
                        ticketId !== 'new'
                            ? `Translation on ticket ${ticketId} failed. Please retry.`
                            : 'Translation failed. Please retry.',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [
        isErrorTranslationRequest,
        unregisterTranslationDraft,
        ticketId,
        dispatch,
    ])

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
        originalContent,
        hasTranslation,
        getEditorState,
        setEditorState,
    ])

    const isTranslating = useMemo(
        () =>
            (ticketId ? isTranslationPending : false) ||
            isLoadingTranslationRequest,
        [ticketId, isTranslationPending, isLoadingTranslationRequest],
    )

    return {
        isTranslating,
        hasTranslation,
        requestTranslation,
        toggleOriginal,
    }
}
