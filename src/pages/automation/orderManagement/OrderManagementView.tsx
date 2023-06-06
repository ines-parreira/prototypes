import React, {useEffect, useMemo, useState} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'
import {createMemoryHistory} from 'history'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {PolicyKey} from 'models/selfServiceConfiguration/types'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import {TicketChannel} from 'business/types/ticket'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import AutomationView from 'pages/automation/common/components/AutomationView'
import AutomationViewContent from 'pages/automation/common/components/AutomationViewContent'

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
            <AutomationSubscriptionButton
                label="Get Automation Features"
                size="small"
                onClick={() => {
                    setIsAutomationSubscriptionModalOpen(true)
                }}
            />
            <AutomationSubscriptionModal
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
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const {channels} = useOrderManagementPreviewContext()
    const previewHistory = useMemo(
        () => createMemoryHistory(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selfServiceConfiguration?.id]
    )
    const chatApplicationIds = useMemo(
        () =>
            channels
                .filter(
                    (channel): channel is SelfServiceChatChannel =>
                        channel.type === TicketChannel.Chat
                )
                .map(({value}) => value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels]
    )

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationIds)

    const [hoveredOrderManagementFlow, setHoveredOrderManagementFlow] =
        useState<PolicyKey>()
    const [isTrackOrderPreviewPlaying, setIsTrackOrderPreviewPlaying] =
        useState(false)

    useEffect(() => {
        const unregister = previewHistory.listen((location) => {
            if (location.pathname === SELF_SERVICE_PREVIEW_ROUTES.HOME) {
                setIsTrackOrderPreviewPlaying(false)
            } else {
                setIsTrackOrderPreviewPlaying(true)
            }
        })

        return () => {
            setIsTrackOrderPreviewPlaying(false)
            unregister()
        }
    }, [previewHistory])

    const handleOrderManagementFlowUpdate = (
        flow: PolicyKey,
        isEnabled: boolean
    ) => {
        if (!selfServiceConfiguration) {
            return
        }

        void handleSelfServiceConfigurationUpdate({
            ...selfServiceConfiguration,
            [flow]: {...selfServiceConfiguration[flow], enabled: isEnabled},
        })
    }
    const handleFlowItemMouseLeave = () => {
        setHoveredOrderManagementFlow(undefined)
    }
    const handleTrackOrderPreviewClick = () => {
        previewHistory.push(SELF_SERVICE_PREVIEW_ROUTES.ORDERS)
    }

    const isLoading =
        !selfServiceConfiguration ||
        chatApplicationIds.some((id) => !(id in applicationsAutomationSettings))

    return (
        <AutomationView title="Order management flows" isLoading={isLoading}>
            <AutomationViewContent
                description="Allow customers to take actions depending on their order status from your chat widget and Help Center."
                helpUrl="https://docs.gorgias.com/en-US/installing-self-service-81861"
                helpTitle="How To Set Up Order Management Flows"
            >
                <OrderManagementFlowItem
                    isEnabled={
                        selfServiceConfiguration!.track_order_policy.enabled
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
                    action={
                        <Button
                            fillStyle="ghost"
                            onClick={handleTrackOrderPreviewClick}
                            isDisabled={
                                !selfServiceConfiguration!.track_order_policy
                                    .enabled
                            }
                        >
                            <ButtonIconLabel
                                icon={
                                    isTrackOrderPreviewPlaying
                                        ? 'motion_photos_on'
                                        : 'play_circle_filled'
                                }
                                iconClassName={
                                    isTrackOrderPreviewPlaying ? 'md-spin' : ''
                                }
                            >
                                Preview
                            </ButtonIconLabel>
                        </Button>
                    }
                    onMouseEnter={() => {
                        setHoveredOrderManagementFlow('track_order_policy')
                    }}
                    onMouseLeave={handleFlowItemMouseLeave}
                />
                <OrderManagementFlowItem
                    isEnabled={
                        selfServiceConfiguration!.return_order_policy.enabled
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
                />
                <OrderManagementFlowItem
                    isEnabled={
                        selfServiceConfiguration!.cancel_order_policy.enabled
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
                />
                <OrderManagementFlowItem
                    isEnabled={
                        selfServiceConfiguration!.report_issue_policy.enabled
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
                    {...(!hasAutomationAddOn
                        ? {action: <AutomationSubscriptionAction />}
                        : {
                              onClick: () => {
                                  history.push(`${pathname}/report-issue`)
                              },
                          })}
                />
            </AutomationViewContent>
            <OrderManagementPreview
                history={previewHistory}
                hoveredOrderManagementFlow={hoveredOrderManagementFlow}
                selfServiceConfiguration={selfServiceConfiguration!}
            />
        </AutomationView>
    )
}

export default OrderManagementView
