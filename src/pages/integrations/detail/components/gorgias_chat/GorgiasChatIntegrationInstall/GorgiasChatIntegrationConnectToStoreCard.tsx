import React, {useState} from 'react'
import {Map, List, fromJS} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody, Button} from 'reactstrap'
import {Link} from 'react-router-dom'

import Modal from '../../../../../common/components/Modal'
import {StoreNameDropdown} from '../GorgiasChatIntegrationAppearance/StoreNameDropdown'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../constants/integration'

import css from './GorgiasChatIntegrationConnectToStoreCard.less'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    shopifyIntegrations: List<Map<any, any>>
    gorgiasChatIntegrations: List<Map<any, any>>
}

export const GorgiasChatIntegrationConnectToStoreCard = ({
    integration,
    updateOrCreateIntegration,
    shopifyIntegrations,
    gorgiasChatIntegrations,
}: Props) => {
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
                            By connecting your live chat to an online store, you
                            can leverage all the store's information for
                            automation such as self-service flows and help
                            articles.
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
            <Modal
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
                    one click. Note that this will automatically enable{' '}
                    <Link to={`/app/settings/self-service`}>Self-Service</Link>.
                </p>
                <StoreNameDropdown
                    value={selectedShopifyIntegration?.getIn([
                        'meta',
                        'shop_name',
                    ])}
                    placeholder={'Select a store'}
                    gorgiasChatIntegrations={gorgiasChatIntegrations}
                    shopifyIntegrations={shopifyIntegrations}
                    onChange={(
                        shopName: string,
                        storeIntegrationId: number
                    ) => {
                        const shopifyIntegration = shopifyIntegrations.find(
                            (integration) =>
                                integration?.get('id') === storeIntegrationId
                        )
                        setSelectedShopifyIntegration(shopifyIntegration)
                    }}
                />
            </Modal>
        </>
    )
}
