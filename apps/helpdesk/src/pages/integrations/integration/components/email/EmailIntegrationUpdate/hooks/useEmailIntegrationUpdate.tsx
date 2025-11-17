import { useReducer } from 'react'

import type { Map } from 'immutable'

export enum EmailIntegrationActionType {
    SET_NAME = 'SET_NAME',
    SET_USE_GMAIL_CATEGORIES = 'SET_USE_GMAIL_CATEGORIES',
    SET_ENABLE_GMAIL_SENDING = 'SET_ENABLE_GMAIL_SENDING',
    SET_ENABLE_OUTLOOK_SENDING = 'SET_ENABLE_OUTLOOK_SENDING',
    SET_ENABLE_GMAIL_THREADING = 'SET_ENABLE_GMAIL_THREADING',
    SET_SIGNATURE_TEXT = 'SET_SIGNATURE_TEXT',
    SET_SIGNATURE_HTML = 'SET_SIGNATURE_HTML',
    SET_DIRTY = 'SET_DIRTY',
    SET_ERROR = 'SET_ERROR',
    CLEAR_ERRORS = 'CLEAR_ERRORS',
    INITIALIZE_FROM_INTEGRATION = 'INITIALIZE_FROM_INTEGRATION',
    SHOW_CANCEL_MODAL = 'SHOW_CANCEL_MODAL',
}

export type EmailIntegrationState = {
    name: string
    useGmailCategories: boolean
    enableGmailSending: boolean
    enableOutlookSending: boolean
    enableGmailThreading: boolean
    signatureText: string
    signatureHtml: string
    dirty: boolean
    errors: Record<string, string | null>
    isInitialized: boolean
    showCancelModal: boolean
}

export type EmailIntegrationAction =
    | { type: EmailIntegrationActionType.SET_NAME; payload: string }
    | {
          type: EmailIntegrationActionType.SET_USE_GMAIL_CATEGORIES
          payload: boolean
      }
    | {
          type: EmailIntegrationActionType.SET_ENABLE_GMAIL_SENDING
          payload: boolean
      }
    | {
          type: EmailIntegrationActionType.SET_ENABLE_OUTLOOK_SENDING
          payload: boolean
      }
    | {
          type: EmailIntegrationActionType.SET_ENABLE_GMAIL_THREADING
          payload: boolean
      }
    | { type: EmailIntegrationActionType.SET_SIGNATURE_TEXT; payload: string }
    | { type: EmailIntegrationActionType.SET_SIGNATURE_HTML; payload: string }
    | { type: EmailIntegrationActionType.SET_DIRTY; payload: boolean }
    | {
          type: EmailIntegrationActionType.SET_ERROR
          payload: { field: string; error: string | null }
      }
    | { type: EmailIntegrationActionType.CLEAR_ERRORS }
    | {
          type: EmailIntegrationActionType.INITIALIZE_FROM_INTEGRATION
          payload: Map<any, any>
      }
    | { type: EmailIntegrationActionType.SHOW_CANCEL_MODAL; payload: boolean }

const initialState: EmailIntegrationState = {
    dirty: false,
    name: '',
    useGmailCategories: false,
    enableGmailSending: true,
    enableOutlookSending: true,
    enableGmailThreading: true,
    errors: {},
    isInitialized: false,
    signatureHtml: '',
    signatureText: '',
    showCancelModal: false,
}

function emailIntegrationReducer(
    state: EmailIntegrationState,
    action: EmailIntegrationAction,
): EmailIntegrationState {
    switch (action.type) {
        case EmailIntegrationActionType.SET_NAME:
            return { ...state, name: action.payload, dirty: true }

        case EmailIntegrationActionType.SET_USE_GMAIL_CATEGORIES:
            return { ...state, useGmailCategories: action.payload, dirty: true }

        case EmailIntegrationActionType.SET_ENABLE_GMAIL_SENDING:
            return { ...state, enableGmailSending: action.payload, dirty: true }

        case EmailIntegrationActionType.SET_ENABLE_OUTLOOK_SENDING:
            return {
                ...state,
                enableOutlookSending: action.payload,
                dirty: true,
            }

        case EmailIntegrationActionType.SET_ENABLE_GMAIL_THREADING:
            return {
                ...state,
                enableGmailThreading: action.payload,
                dirty: true,
            }

        case EmailIntegrationActionType.SET_SIGNATURE_TEXT:
            return { ...state, signatureText: action.payload, dirty: true }

        case EmailIntegrationActionType.SET_SIGNATURE_HTML:
            return { ...state, signatureHtml: action.payload, dirty: true }

        case EmailIntegrationActionType.SET_DIRTY:
            return { ...state, dirty: action.payload }

        case EmailIntegrationActionType.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.payload.field]: action.payload.error,
                },
            }

        case EmailIntegrationActionType.CLEAR_ERRORS:
            return { ...state, errors: {} }

        case EmailIntegrationActionType.INITIALIZE_FROM_INTEGRATION: {
            const integration = action.payload
            return {
                ...state,
                name: integration.get('name', ''),
                useGmailCategories: integration.getIn(
                    ['meta', 'use_gmail_categories'],
                    false,
                ),
                enableGmailSending: integration.getIn(
                    ['meta', 'enable_gmail_sending'],
                    true,
                ),
                enableOutlookSending: integration.getIn(
                    ['meta', 'enable_outlook_sending'],
                    true,
                ),
                enableGmailThreading: integration.getIn(
                    ['meta', 'enable_gmail_threading'],
                    true,
                ),
                signatureText: integration.getIn(
                    ['meta', 'signature', 'text'],
                    '',
                ),
                signatureHtml: integration.getIn(
                    ['meta', 'signature', 'html'],
                    '',
                ),
                isInitialized: true,
                dirty: false,
            }
        }

        case EmailIntegrationActionType.SHOW_CANCEL_MODAL:
            return { ...state, showCancelModal: action.payload }

        default:
            return state
    }
}

export function useEmailIntegrationUpdate() {
    const [state, dispatch] = useReducer(emailIntegrationReducer, initialState)

    const setName = (value: string) => {
        dispatch({ type: EmailIntegrationActionType.SET_NAME, payload: value })
    }

    const setUseGmailCategories = (value: boolean) => {
        dispatch({
            type: EmailIntegrationActionType.SET_USE_GMAIL_CATEGORIES,
            payload: value,
        })
    }

    const setEnableGmailSending = (value: boolean) => {
        dispatch({
            type: EmailIntegrationActionType.SET_ENABLE_GMAIL_SENDING,
            payload: value,
        })
    }

    const setEnableOutlookSending = (value: boolean) => {
        dispatch({
            type: EmailIntegrationActionType.SET_ENABLE_OUTLOOK_SENDING,
            payload: value,
        })
    }

    const setEnableGmailThreading = (value: boolean) => {
        dispatch({
            type: EmailIntegrationActionType.SET_ENABLE_GMAIL_THREADING,
            payload: value,
        })
    }

    const setSignatureText = (value: string) => {
        dispatch({
            type: EmailIntegrationActionType.SET_SIGNATURE_TEXT,
            payload: value,
        })
    }

    const setSignatureHtml = (value: string) => {
        dispatch({
            type: EmailIntegrationActionType.SET_SIGNATURE_HTML,
            payload: value,
        })
    }

    const setDirty = (value: boolean) => {
        dispatch({ type: EmailIntegrationActionType.SET_DIRTY, payload: value })
    }

    const setError = (field: string, error: string | null) => {
        dispatch({
            type: EmailIntegrationActionType.SET_ERROR,
            payload: { field, error },
        })
    }

    const clearErrors = () => {
        dispatch({ type: EmailIntegrationActionType.CLEAR_ERRORS })
    }

    const initializeFromIntegration = (integration: Map<any, any>) => {
        dispatch({
            type: EmailIntegrationActionType.INITIALIZE_FROM_INTEGRATION,
            payload: integration,
        })
    }

    const showCancelModal = (value: boolean) => {
        dispatch({
            type: EmailIntegrationActionType.SHOW_CANCEL_MODAL,
            payload: value,
        })
    }

    const submitIntegration = async (
        integration: Map<any, any>,
        updateOrCreateIntegration: (
            integration: Map<any, any>,
        ) => Promise<unknown>,
    ) => {
        const updatedIntegration = integration
            .set('name', state.name)
            .setIn(['meta', 'signature', 'text'], state.signatureText)
            .setIn(['meta', 'signature', 'html'], state.signatureHtml)
            .setIn(['meta', 'use_gmail_categories'], state.useGmailCategories)
            .setIn(['meta', 'enable_gmail_sending'], state.enableGmailSending)
            .setIn(
                ['meta', 'enable_outlook_sending'],
                state.enableOutlookSending,
            )
            .setIn(
                ['meta', 'enable_gmail_threading'],
                state.enableGmailThreading,
            )

        await updateOrCreateIntegration(updatedIntegration)
        dispatch({
            type: EmailIntegrationActionType.SET_DIRTY,
            payload: false,
        })
    }

    return {
        state,
        setName,
        setUseGmailCategories,
        setEnableGmailSending,
        setEnableOutlookSending,
        setEnableGmailThreading,
        setSignatureText,
        setSignatureHtml,
        setDirty,
        setError,
        clearErrors,
        initializeFromIntegration,
        showCancelModal,
        submitIntegration,
    }
}
