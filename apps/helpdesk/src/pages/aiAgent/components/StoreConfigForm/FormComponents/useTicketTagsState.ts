import { useCallback, useReducer } from 'react'

import { Value } from 'pages/common/forms/SelectField/types'

export type TicketTagsAction =
    | { type: 'SET_SELECTED_TAGS'; payload: Value[] }
    | { type: 'SET_SELECT_DISABLED'; payload: boolean }
    | { type: 'SET_REQUIRED_VALUES_SET'; payload: boolean }
    | { type: 'CLEAR_SELECTED_TAGS' }
    | { type: 'REMOVE_TAG'; payload: string }

export type TicketTagsState = {
    selectedTicketTags: Value[]
    isSelectDisabled: boolean
}

const initialState: TicketTagsState = {
    selectedTicketTags: [],
    isSelectDisabled: false,
}

function ticketTagsReducer(
    state: TicketTagsState,
    action: TicketTagsAction,
): TicketTagsState {
    switch (action.type) {
        case 'SET_SELECTED_TAGS':
            return { ...state, selectedTicketTags: action.payload }
        case 'SET_SELECT_DISABLED':
            return { ...state, isSelectDisabled: action.payload }
        case 'CLEAR_SELECTED_TAGS':
            return { ...state, selectedTicketTags: [] }
        case 'REMOVE_TAG':
            // Removal is managed by the parent update; no local state change.
            return state
        default:
            return state
    }
}

export const useTicketTagsState = () => {
    const [state, dispatch] = useReducer(ticketTagsReducer, initialState)

    const setSelectedTags = useCallback((tags: Value[]) => {
        dispatch({ type: 'SET_SELECTED_TAGS', payload: tags })
    }, [])

    const clearSelectedTags = useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTED_TAGS' })
    }, [])

    const setSelectDisabled = useCallback((disabled: boolean) => {
        dispatch({ type: 'SET_SELECT_DISABLED', payload: disabled })
    }, [])

    const removeTag = useCallback((name: string) => {
        dispatch({ type: 'REMOVE_TAG', payload: name })
    }, [])

    return {
        state,
        dispatch,
        setSelectedTags,
        clearSelectedTags,
        setSelectDisabled,
        removeTag,
    }
}
