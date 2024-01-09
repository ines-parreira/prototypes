import React, {useMemo, useState} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'
import {createMemoryHistory} from 'history'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {
    PolicyKey,
    ReturnActionType,
} from 'models/selfServiceConfiguration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import EmptyResponseMessageContentError from 'pages/automate/common/components/EmptyResponseMessageContentError'
import useEffectOnce from 'hooks/useEffectOnce'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'

import {ORDER_MANAGEMENT} from '../common/components/constants'
import {
    isSelfServiceChatChannel,
    isSelfServiceStandaloneContactFormChannel,
} from '../common/hooks/useSelfServiceChannels'
import OrderManagementFlowItem from './components/OrderManagementFlowItem'
import OrderManagementPreview from './OrderManagementPreview'
import {useOrderManagementPreviewContext} from './OrderManagementPreviewContext'

const AutomationSubscriptionAction = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            <AutomateSubscriptionButton
                label="Get Automate Features"
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
    const {pathname} = useLocation()
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)
    const hasAutomate = useAppSelector(getHasAutomate)
    const {channels} = useOrderManagementPreviewContext()
    const previewHistory = useMemo(
        () => createMemoryHistory(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selfServiceConfiguration?.id]
    )
    const chatApplicationIds = useMemo(
        () =>
            channels
                .filter(isSelfServiceChatChannel)
                .map(({value}) => value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels]
    )
    const contactFormIds = useMemo(
        () =>
            channels
                .filter(isSelfServiceStandaloneContactFormChannel)
                .map(({value}) => value.id),
        [channels]
    )

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Order Management',
        })
    })

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationIds)
    const {contactFormsAutomationSettings} =
        useContactFormsAutomationSettings(contactFormIds)

    const [hoveredOrderManagementFlow, setHoveredOrderManagementFlow] =
        useState<PolicyKey>()

    const handleOrderManagementFlowUpdate = (
        flow: PolicyKey,
        isEnabled: boolean
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
            case 'track_order_policy':
                return !selfServiceConfiguration?.track_order_policy
                    .unfulfilled_message?.text
            case 'return_order_policy':
                return (
                    selfServiceConfiguration?.return_order_policy?.action
                        ?.type !== ReturnActionType.LoopReturns &&
                    !selfServiceConfiguration?.return_order_policy?.action
                        ?.response_message_content?.text
                )
            case 'cancel_order_policy':
                return !selfServiceConfiguration?.cancel_order_policy?.action
                    ?.response_message_content?.text
            case 'report_issue_policy':
                return selfServiceConfiguration?.report_issue_policy?.cases?.some(
                    ({reasons}) =>
                        reasons.some(
                            (reason) =>
                                !reason.action?.responseMessageContent.text
                        )
                )
        }
    }
    const getAlert = (flow: PolicyKey) => {
        if (!hasAutomate || !selfServiceConfiguration?.[flow].enabled) {
            return null
        }

        return isResponseMessageEmpty(flow) ? (
            <EmptyResponseMessageContentError />
        ) : null
    }

    const isLoading =
        !selfServiceConfiguration ||
        chatApplicationIds.some(
            (id) => !(id in applicationsAutomationSettings)
        ) ||
        contactFormIds.some(
            (id) => !(id.toString() in contactFormsAutomationSettings)
        )

    return (
        <AutomateView title={ORDER_MANAGEMENT} isLoading={isLoading}>
            <AutomateViewContent
                description="Let customers track and manage orders in Chat, Help Center, and Contact Form with personalized options based on order status."
                helpUrl="https://docs.gorgias.com/en-US/installing-self-service-81861"
                helpTitle={`How To Set Up ${ORDER_MANAGEMENT}`}
            >
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.track_order_policy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Track order"
                    description="Allow customers to view order tracking information."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'track_order_policy',
                            isEnabled
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('track_order_policy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    alert={getAlert('track_order_policy')}
                    {...(!hasAutomate
                        ? {action: <AutomationSubscriptionAction />}
                        : {
                              onClick: () => {
                                  history.push(`${pathname}/track`)
                              },
                          })}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.return_order_policy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Return order"
                    description="Allow customers to request returns based on custom criteria."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'return_order_policy',
                            isEnabled
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('return_order_policy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    onClick={() => {
                        history.push(`${pathname}/return`)
                    }}
                    alert={getAlert('return_order_policy')}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.cancel_order_policy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Cancel order"
                    description="Allow customers to request order cancellations based on custom criteria."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'cancel_order_policy',
                            isEnabled
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('cancel_order_policy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    onClick={() => {
                        history.push(`${pathname}/cancel`)
                    }}
                    alert={getAlert('cancel_order_policy')}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        !!selfServiceConfiguration?.report_issue_policy.enabled
                    }
                    isDisabled={isUpdatePending}
                    title="Report order issue"
                    description="Allow customers to report order issues based on custom scenarios."
                    onChange={(isEnabled) => {
                        handleOrderManagementFlowUpdate(
                            'report_issue_policy',
                            isEnabled
                        )
                    }}
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('report_issue_policy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                    alert={getAlert('report_issue_policy')}
                    {...(!hasAutomate
                        ? {action: <AutomationSubscriptionAction />}
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
