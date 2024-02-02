import {useCallback, useReducer} from 'react'

type UseHelpCenterAutomationFormState = {
    orderManagementEnabled: boolean
    articleRecommendationEnabled: boolean
    chatIntegrationId: null | number
}

type OrderManagementUpdateAction = {
    type: 'orderManagementUpdate'
    payload: boolean
}

type ArticleRecommendationUpdateAction = {
    type: 'articleRecommendationUpdate'
    payload: boolean
}

type ChatIntegrationIdUpdateAction = {
    type: 'chatIntegrationIdUpdate'
    payload: null | number
}

type UseHelpCenterAutomationFormActions =
    | OrderManagementUpdateAction
    | ArticleRecommendationUpdateAction
    | ChatIntegrationIdUpdateAction

const reducer = (
    state: UseHelpCenterAutomationFormState,
    action: UseHelpCenterAutomationFormActions
): UseHelpCenterAutomationFormState => {
    switch (action.type) {
        case 'orderManagementUpdate':
            return {...state, orderManagementEnabled: action.payload}
        case 'articleRecommendationUpdate':
            return {...state, articleRecommendationEnabled: action.payload}
        case 'chatIntegrationIdUpdate':
            return {...state, chatIntegrationId: action.payload}
    }
}

const defaultState: UseHelpCenterAutomationFormState = {
    orderManagementEnabled: true,
    articleRecommendationEnabled: true,
    chatIntegrationId: null,
}

export const useHelpCenterAutomationForm = (
    initialState: Partial<UseHelpCenterAutomationFormState>
) => {
    const [state, dispatch] = useReducer(reducer, {
        ...defaultState,
        ...initialState,
    })

    const updateOrderManagementEnabled = useCallback((enabled: boolean) => {
        dispatch({type: 'orderManagementUpdate', payload: enabled})
    }, [])

    const updateArticleRecommendationEnabled = useCallback(
        (enabled: boolean) => {
            dispatch({type: 'articleRecommendationUpdate', payload: enabled})
        },
        []
    )

    const updateChatIntegrationId = useCallback((chatId: null | number) => {
        dispatch({type: 'chatIntegrationIdUpdate', payload: chatId})
    }, [])

    return {
        state,
        updateOrderManagementEnabled,
        updateArticleRecommendationEnabled,
        updateChatIntegrationId,
    }
}
