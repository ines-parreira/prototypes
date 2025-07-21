import { useCallback, useReducer } from 'react'

import { Value } from 'pages/common/forms/SelectField/types'

export type CustomFieldsAction =
    | { type: 'SET_SELECTED_FIELDS'; payload: Value[] }
    | { type: 'SET_SELECT_DISABLED'; payload: boolean }
    | { type: 'SET_REQUIRED_VALUES_SET'; payload: boolean }
    | { type: 'CLEAR_SELECTED_FIELDS' }
    | { type: 'REMOVE_FIELD'; payload: number }
    | { type: 'AUTO_FILL_REQUIRED_FIELDS'; payload: number[] }

export type CustomFieldsState = {
    selectedCustomFields: Value[]
    isSelectDisabled: boolean
    haveRequiredValuesBeenSet: boolean
}

const initialState: CustomFieldsState = {
    selectedCustomFields: [],
    isSelectDisabled: false,
    haveRequiredValuesBeenSet: false,
}

function customFieldsReducer(
    state: CustomFieldsState,
    action: CustomFieldsAction,
): CustomFieldsState {
    switch (action.type) {
        case 'SET_SELECTED_FIELDS':
            return { ...state, selectedCustomFields: action.payload }
        case 'SET_SELECT_DISABLED':
            return { ...state, isSelectDisabled: action.payload }
        case 'SET_REQUIRED_VALUES_SET':
            return { ...state, haveRequiredValuesBeenSet: action.payload }
        case 'CLEAR_SELECTED_FIELDS':
            return { ...state, selectedCustomFields: [] }
        case 'REMOVE_FIELD':
            // Removal is managed by the parent update; no local state change.
            return state
        case 'AUTO_FILL_REQUIRED_FIELDS':
            return { ...state, haveRequiredValuesBeenSet: true }
        default:
            return state
    }
}

export const useCustomFieldsState = () => {
    const [state, dispatch] = useReducer(customFieldsReducer, initialState)

    const setSelectedFields = useCallback((fields: Value[]) => {
        dispatch({ type: 'SET_SELECTED_FIELDS', payload: fields })
    }, [])

    const clearSelectedFields = useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTED_FIELDS' })
    }, [])

    const setSelectDisabled = useCallback((disabled: boolean) => {
        dispatch({ type: 'SET_SELECT_DISABLED', payload: disabled })
    }, [])

    const autoFillRequiredFields = useCallback((fieldIds: number[]) => {
        dispatch({ type: 'AUTO_FILL_REQUIRED_FIELDS', payload: fieldIds })
    }, [])

    const removeField = useCallback((id: number) => {
        dispatch({ type: 'REMOVE_FIELD', payload: id })
    }, [])

    return {
        state,
        dispatch, // in case you want to use dispatch directly
        setSelectedFields,
        clearSelectedFields,
        setSelectDisabled,
        autoFillRequiredFields,
        removeField,
    }
}
