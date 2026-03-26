import { useCallback } from 'react'

import { useHistory, useLocation, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type {
    PolicyKey,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

export type OrderManagementFlow = {
    key: PolicyKey
    title: string
    routePath: string
    isEnabled: boolean
    hasEmptyResponse: boolean
    canNavigate: boolean
}

const checkEmptyResponseMessage = (
    config: SelfServiceConfiguration,
    flow: PolicyKey,
): boolean => {
    switch (flow) {
        case 'trackOrderPolicy':
            return !config.trackOrderPolicy.unfulfilledMessage?.text
        case 'returnOrderPolicy':
            return (
                config.returnOrderPolicy?.action?.type !==
                    ReturnActionType.LoopReturns &&
                !config.returnOrderPolicy?.action?.responseMessageContent?.text
            )
        case 'cancelOrderPolicy':
            return !config.cancelOrderPolicy?.action?.responseMessageContent
                ?.text
        case 'reportIssuePolicy':
            return (
                config.reportIssuePolicy?.cases?.some(({ newReasons }) =>
                    newReasons.some(
                        (reason) => !reason.action?.responseMessageContent.text,
                    ),
                ) ?? false
            )
    }
}

const buildFlows = (
    config: SelfServiceConfiguration,
    hasAccess: boolean,
): OrderManagementFlow[] => {
    const buildFlow = (
        key: PolicyKey,
        title: string,
        routePath: string,
        canNavigate: boolean,
    ): OrderManagementFlow => {
        const isEnabled = !!config[key].enabled

        return {
            key,
            title,
            routePath,
            isEnabled,
            hasEmptyResponse:
                hasAccess &&
                isEnabled &&
                checkEmptyResponseMessage(config, key),
            canNavigate,
        }
    }

    return [
        buildFlow('trackOrderPolicy', 'Track order', 'track', hasAccess),
        buildFlow('returnOrderPolicy', 'Return order', 'return', true),
        buildFlow('cancelOrderPolicy', 'Cancel order', 'cancel', true),
        buildFlow(
            'reportIssuePolicy',
            'Report issue',
            'report-issue',
            hasAccess,
        ),
    ]
}

export const useOrderManagementFlows = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const history = useHistory()
    const { pathname } = useLocation()
    const { hasAccess } = useAiAgentAccess(shopName)

    const {
        isUpdatePending,
        isFetchPending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(shopType, shopName)

    const handleFlowToggle = useCallback(
        (flow: PolicyKey, isEnabled: boolean) => {
            void handleSelfServiceConfigurationUpdate((draft) => {
                draft[flow].enabled = isEnabled
            })
        },
        [handleSelfServiceConfigurationUpdate],
    )

    const navigateToFlow = useCallback(
        (routePath: string) => {
            history.push(`${pathname}/${routePath}`)
        },
        [history, pathname],
    )

    const flows = selfServiceConfiguration
        ? buildFlows(selfServiceConfiguration, hasAccess)
        : []

    return {
        isLoading: isFetchPending,
        isUpdatePending,
        flows,
        handleFlowToggle,
        navigateToFlow,
    }
}
