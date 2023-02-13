import React, {useState} from 'react'
import {useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Container} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {PolicyKey as FlowKey} from 'models/selfServiceConfiguration/types'

import OrderManagementFlowItem from './components/OrderManagementFlowItem'

import css from './OrderManagementView.less'

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
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const handleOrderManagementFlowUpdate = (
        flow: FlowKey,
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

    return (
        <div className="full-width">
            <PageHeader title="Order management" />
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(selfServiceConfiguration),
                })}
            >
                {!selfServiceConfiguration ? (
                    <Loader />
                ) : (
                    <div>
                        <div className={css.descriptionContainer}>
                            <p className="mb-1">
                                Allow customers to take actions depending on
                                their order status from your chat widget and
                                Help Center.
                            </p>
                            <a
                                href="https://docs.gorgias.com/en-US/installing-self-service-81861"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <i className="material-icons mr-2">menu_book</i>
                                How To Set Up Order Management Flows
                            </a>
                        </div>

                        <OrderManagementFlowItem
                            isEnabled={
                                selfServiceConfiguration.track_order_policy
                                    .enabled
                            }
                            isDisabled={isUpdatePending}
                            title="Track order"
                            description="Allow customers to view order tracking information."
                            onChange={(isEnabled: boolean) => {
                                handleOrderManagementFlowUpdate(
                                    'track_order_policy',
                                    isEnabled
                                )
                            }}
                            action={null}
                        />
                        <OrderManagementFlowItem
                            isEnabled={
                                selfServiceConfiguration.return_order_policy
                                    .enabled
                            }
                            isDisabled={isUpdatePending}
                            title="Return order"
                            description="Allow customers to request returns based on custom criteria."
                            onChange={(isEnabled: boolean) => {
                                handleOrderManagementFlowUpdate(
                                    'return_order_policy',
                                    isEnabled
                                )
                            }}
                        />
                        <OrderManagementFlowItem
                            isEnabled={
                                selfServiceConfiguration.cancel_order_policy
                                    .enabled
                            }
                            isDisabled={isUpdatePending}
                            title="Cancel order"
                            description="Allow customers to request order cancellations based on custom criteria."
                            onChange={(isEnabled: boolean) => {
                                handleOrderManagementFlowUpdate(
                                    'cancel_order_policy',
                                    isEnabled
                                )
                            }}
                        />
                        <OrderManagementFlowItem
                            isEnabled={
                                selfServiceConfiguration.report_issue_policy
                                    .enabled
                            }
                            isDisabled={isUpdatePending}
                            title="Report order issue"
                            description="Allow customers to report order issues based on custom scenarios."
                            onChange={(isEnabled: boolean) => {
                                handleOrderManagementFlowUpdate(
                                    'report_issue_policy',
                                    isEnabled
                                )
                            }}
                            {...(!hasAutomationAddOn
                                ? {action: <AutomationSubscriptionAction />}
                                : {})}
                        />
                    </div>
                )}
            </Container>
        </div>
    )
}

export default OrderManagementView
