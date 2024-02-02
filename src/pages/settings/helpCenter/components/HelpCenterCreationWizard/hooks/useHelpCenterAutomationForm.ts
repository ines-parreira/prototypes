import {useCallback, useReducer} from 'react'

type UseHelpCenterAutomationFormState = {
    orderManagementEnabled: boolean
}

type OrderManagementUpdateAction = {
    type: 'orderManagement'
    payload: boolean
}

type UseHelpCenterAutomationFormActions = OrderManagementUpdateAction

const reducer = (
    state: UseHelpCenterAutomationFormState,
    action: UseHelpCenterAutomationFormActions
): UseHelpCenterAutomationFormState => {
    switch (action.type) {
        case 'orderManagement':
            return {...state, orderManagementEnabled: action.payload}
    }
}

const defaultState: UseHelpCenterAutomationFormState = {
    orderManagementEnabled: true,
}

export const useHelpCenterAutomationForm = (
    initialState: Partial<UseHelpCenterAutomationFormState>
) => {
    const [state, dispatch] = useReducer(reducer, {
        ...defaultState,
        ...initialState,
    })

    const updateOrderManagementEnabled = useCallback((enabled: boolean) => {
        dispatch({type: 'orderManagement', payload: enabled})
    }, [])

    return {state, updateOrderManagementEnabled}
}
