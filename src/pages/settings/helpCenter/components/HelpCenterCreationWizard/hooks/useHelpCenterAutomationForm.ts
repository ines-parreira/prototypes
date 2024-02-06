import {useCallback, useReducer} from 'react'
import {Entrypoint} from 'pages/automate/common/components/WorkflowsFeatureList'

type UseHelpCenterAutomationFormState = {
    orderManagementEnabled: boolean
    articleRecommendationEnabled: boolean
    chatIntegrationId: null | number
    flows: Entrypoint[]
}

type OrderManagementUpdateAction = {
    type: 'orderManagementUpdate'
    payload: boolean
}

type FlowsUpdateAction = {
    type: 'flowsUpdate'
    payload: Entrypoint[]
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
    | FlowsUpdateAction

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
        case 'flowsUpdate':
            return {...state, flows: action.payload}
    }
}

const defaultState: UseHelpCenterAutomationFormState = {
    orderManagementEnabled: true,
    articleRecommendationEnabled: true,
    chatIntegrationId: null,
    flows: [],
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

    const updateFlows = useCallback((flows: Entrypoint[]) => {
        dispatch({type: 'flowsUpdate', payload: flows})
    }, [])

    return {
        state,
        updateOrderManagementEnabled,
        updateArticleRecommendationEnabled,
        updateChatIntegrationId,
        updateFlows,
    }
}
