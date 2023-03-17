import React, {useState} from 'react'
import {Map, List, fromJS} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody, Button} from 'reactstrap'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import {SHOPIFY_INTEGRATION_TYPE} from 'constants/integration'
import {FeatureFlagKey} from 'config/featureFlags'

import {StoreNameDropdown} from '../GorgiasChatIntegrationAppearance/StoreNameDropdown'

import css from './GorgiasChatIntegrationConnectToStoreCard.less'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    shopifyIntegrations: List<Map<any, any>>
    gorgiasChatIntegrations: List<Map<any, any>>
    hasOrderManagement: boolean
}

export const GorgiasChatIntegrationConnectToStoreCard = ({
    integration,
    updateOrCreateIntegration,
    shopifyIntegrations,
    gorgiasChatIntegrations,
    hasOrderManagement,
}: Props) => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedShopifyIntegration, setSelectedShopifyIntegration] =
        useState<Map<any, any> | null>(null)

    const onClose = () => {
        setIsModalOpen(false)
        setSelectedShopifyIntegration(null)
    }

    const onConnect = async () => {
        setIsLoading(true)
        const meta: Map<any, any> = integration.get('meta')
        const updatedMeta: Map<any, any> = meta
            .set('shop_name', selectedShopifyIntegration?.get('name'))
            .set('shop_type', SHOPIFY_INTEGRATION_TYPE)
            .set('shop_integration_id', selectedShopifyIntegration?.get('id'))
            .set('shopify_integration_ids', [
                selectedShopifyIntegration?.get('id'),
            ])
            // automatically enable the SSP when connecting a store
            .set('self_service_deactivated_datetime', null)

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: updatedMeta,
        }

        await updateOrCreateIntegration(fromJS(form))

        setIsLoading(false)
    }

    return (
        <>
            <Card className={css['card']}>
                <CardBody className={css['card-body']}>
                    <div>
                        <h3>Connect to store</h3>
                        <p>
                            {hasOrderManagement
                                ? 'By connecting your chat to an online store, you can leverage the store’s information for automation features including quick response flows, order management flows, and help center article recommendation.'
                                : "By connecting your chat to an online store, you can leverage all the store's information for automation such as self-service flows and help articles."}
                        </p>
                    </div>
                    <div className={css['connect-button-wrapper']}>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            color="primary"
                        >
                            Connect
                        </Button>
                    </div>
                </CardBody>
            </Card>
            <DEPRECATED_Modal
                isOpen={isModalOpen}
                header="Connect a Shopify store"
                onClose={onClose}
                style={{maxWidth: '600px'}}
                footerClassName={css['modal-footer']}
                bodyClassName={css['modal-body']}
                footer={
                    <>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            onClick={onConnect}
                            disabled={!selectedShopifyIntegration || isLoading}
                            className={classnames({
                                'btn-loading': isLoading,
                            })}
                            color="primary"
                        >
                            Connect & install
                        </Button>
                    </>
                }
            >
                <p>
                    Activate the customer chat widget on your Shopify store in
                    one click.
                    {hasOrderManagement && (
                        <span>
                            {' '}
                            Note that this will automatically enable{' '}
                            {isAutomationSettingsRevampEnabled ? (
                                'order management flows'
                            ) : (
                                <Link to="/app/settings/self-service">
                                    Self-Service
                                </Link>
                            )}
                            .
                        </span>
                    )}
                </p>
                <StoreNameDropdown
                    storeIntegrationId={selectedShopifyIntegration?.get('id')}
                    gorgiasChatIntegrations={gorgiasChatIntegrations}
                    storeIntegrations={shopifyIntegrations}
                    onChange={(storeIntegrationId: number) => {
                        const shopifyIntegration = shopifyIntegrations.find(
                            (integration) =>
                                integration?.get('id') === storeIntegrationId
                        )
                        setSelectedShopifyIntegration(shopifyIntegration)
                    }}
                />
            </DEPRECATED_Modal>
        </>
    )
}
