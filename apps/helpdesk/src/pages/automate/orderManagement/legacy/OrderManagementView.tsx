import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { createMemoryHistory } from 'history'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/constants'
import type { PolicyKey } from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import EmptyResponseMessageContentError from 'pages/automate/common/components/EmptyResponseMessageContentError'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { ORDER_MANAGEMENT } from '../../common/components/constants'
import {
    isSelfServiceChatChannel,
    isSelfServiceStandaloneContactFormChannel,
} from '../../common/hooks/useSelfServiceChannels'
import OrderManagementFlowItem from './components/OrderManagementFlowItem'
import OrderManagementPreview from './OrderManagementPreview'
import { useOrderManagementPreviewContext } from './OrderManagementPreviewContext'

const AutomationSubscriptionAction = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            <AutomateSubscriptionButton
                label="Get AI Agent Features"
                size="small"
                onClick={() => {
                    setIsAutomationSubscriptionModalOpen(true)
                }}
            />
            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModalOpen(false)}
            />
        </>
    )
}

const OrderManagementView = () => {
    const history = useHistory()
    const { pathname } = useLocation()
    const { shopName } = useParams<{ shopName: string }>()
    const isAutomateSettings = useIsAutomateSettings()

    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)
    const { hasAccess } = useAiAgentAccess(shopName)
    const { channels } = useOrderManagementPreviewContext()
    const previewHistory = useMemo(
        () => createMemoryHistory(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selfServiceConfiguration?.id],
    )
    const chatApplicationIds = useMemo(
        () =>
            channels
                .filter(isSelfServiceChatChannel)
                .map(({ value }) => value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels],
    )
    const contactFormIds = useMemo(
        () =>
            channels
                .filter(isSelfServiceStandaloneContactFormChannel)
                .map(({ value }) => value.id),
        [channels],
    )

    const changeAutomateSettingButtomPosition = useFlag(
        FeatureFlagKey.ChangeAutomateSettingButtomPosition,
    )

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Order Management',
        })
    })

    const { applicationsAutomationSettings } =
        useApplicationsAutomationSettings(chatApplicationIds)
    const { contactFormsAutomationSettings } =
        useContactFormsAutomationSettings(contactFormIds)

    const [hoveredOrderManagementFlow, setHoveredOrderManagementFlow] =
        useState<PolicyKey>()

    const handleOrderManagementFlowUpdate = (
        flow: PolicyKey,
        isEnabled: boolean,
    ) => {
        void handleSelfServiceConfigurationUpdate((draft) => {
            draft[flow].enabled = isEnabled
        })
    }
    const handleFlowItemMouseLeave = () => {
        setHoveredOrderManagementFlow(undefined)
    }

    const isResponseMessageEmpty = (flow: PolicyKey) => {
        switch (flow) {
            case 'trackOrderPolicy':
                return !selfServiceConfiguration?.trackOrderPolicy
                    .unfulfilledMessage?.text
            case 'returnOrderPolicy':
                return (
                    selfServiceConfiguration?.returnOrderPolicy?.action
                        ?.type !== ReturnActionType.LoopReturns &&
                    !selfServiceConfiguration?.returnOrderPolicy?.action
                        ?.responseMessageContent?.text
                )
            case 'cancelOrderPolicy':
                return !selfServiceConfiguration?.cancelOrderPolicy?.action
                    ?.responseMessageContent?.text
            case 'reportIssuePolicy':
                return selfServiceConfiguration?.reportIssuePolicy?.cases?.some(
                    ({ newReasons }) =>
                        newReasons.some(
                            (reason) =>
                                !reason.action?.responseMessageContent.text,
                        ),
                )
        }
    }
    const getAlert = (flow: PolicyKey) => {
        if (!hasAccess || !selfServiceConfiguration?.[flow].enabled) {
            return null
        }

        return isResponseMessageEmpty(flow) ? (
            <EmptyResponseMessageContentError />
        ) : null
    }

    const isLoading =
        !selfServiceConfiguration ||
        chatApplicationIds.some(
            (id) => !(id in applicationsAutomationSettings),
        ) ||
        contactFormIds.some(
            (id) => !(id.toString() in contactFormsAutomationSettings),
        )

    return (
        <AutomateView
            title={isAutomateSettings ? undefined : ORDER_MANAGEMENT}
            isLoading={isLoading}
        >
            <AutomateViewContent
                description="Let customers track and manage orders in Chat, Help Center, and Contact Form with personalized options based on order status."
                helpUrl="https://docs.gorgias.com/en-US/installing-self-service-81861"
                helpTitle={`How To Set Up ${ORDER_MANAGEMENT}`}
            >
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.trackOrderPolicy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Track order"
                    description="Allow customers to view order tracking information."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'trackOrderPolicy',
                            isEnabled,
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('trackOrderPolicy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    alert={getAlert('trackOrderPolicy')}
                    {...(!hasAccess
                        ? { action: <AutomationSubscriptionAction /> }
                        : {
                              onClick: () => {
                                  history.push(`${pathname}/track`)
                              },
                          })}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.returnOrderPolicy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Return order"
                    description="Allow customers to request returns based on custom criteria."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'returnOrderPolicy',
                            isEnabled,
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('returnOrderPolicy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    onClick={() => {
                        history.push(`${pathname}/return`)
                    }}
                    alert={getAlert('returnOrderPolicy')}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.cancelOrderPolicy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Cancel order"
                    description="Allow customers to request order cancellations based on custom criteria."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'cancelOrderPolicy',
                            isEnabled,
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('cancelOrderPolicy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    onClick={() => {
                        history.push(`${pathname}/cancel`)
                    }}
                    alert={getAlert('cancelOrderPolicy')}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.reportIssuePolicy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Report order issue"
                    description="Allow customers to report order issues based on custom scenarios."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'reportIssuePolicy',
                            isEnabled,
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('reportIssuePolicy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    alert={getAlert('reportIssuePolicy')}
                    {...(!hasAccess
                        ? { action: <AutomationSubscriptionAction /> }
                        : {
                              onClick: () => {
                                  history.push(`${pathname}/report-issue`)
                              },
                          })}
                />
            </AutomateViewContent>
            <OrderManagementPreview
                history={previewHistory}
                hoveredOrderManagementFlow={hoveredOrderManagementFlow}
                selfServiceConfiguration={selfServiceConfiguration!}
            />
        </AutomateView>
    )
}

export default OrderManagementView
