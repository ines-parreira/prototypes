import {useCallback, useReducer} from 'react'
import {Entrypoint} from 'pages/automate/common/components/WorkflowsFeatureList'
import {logEvent} from 'common/segment/segment'
import {SegmentEvent} from 'common/segment'

export type UseHelpCenterAutomationFormState = {
    orderManagementEnabled: boolean
    articleRecommendationEnabled: boolean
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

type UseHelpCenterAutomationFormActions =
    | OrderManagementUpdateAction
    | ArticleRecommendationUpdateAction
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
        case 'flowsUpdate':
            return {...state, flows: action.payload}
    }
}

const defaultState: UseHelpCenterAutomationFormState = {
    orderManagementEnabled: true,
    articleRecommendationEnabled: false,
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

    const updateFlows = useCallback((flows: Entrypoint[]) => {
        logEvent(SegmentEvent.AutomateChannelUpdateFromHelpCenterWizard, {
            page: 'HelpCenterWizard',
        })
        dispatch({type: 'flowsUpdate', payload: flows})
    }, [])

    return {
        state,
        updateOrderManagementEnabled,
        updateArticleRecommendationEnabled,
        updateFlows,
    }
}
