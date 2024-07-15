import React from 'react'
import {Redirect} from 'react-router-dom'
import {notify} from 'reapop'
import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/common/components/Loader/Loader'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {NotificationStatus} from 'state/notifications/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useStoreConfiguration} from '../hooks/useStoreConfiguration'

import {AiAgentLayout} from '../components/AiAgentLayout/AiAgentLayout'
import {StoreConfigForm} from '../components/StoreConfigForm/StoreConfigForm'
import css from './AiAgentConfigurationView.less'

const READ_FULFILLMENTS_PERMISSION = 'read_fulfillments'

type AiAgentConfigurationViewProps = {
    shopName: string
    accountDomain: string
}
export const AiAgentConfigurationView = ({
    shopName,
    accountDomain,
}: AiAgentConfigurationViewProps) => {
    const dispatch = useAppDispatch()
    const {storeConfiguration, isLoading} = useStoreConfiguration({
        shopName,
        accountDomain,
    })
    const {integration} = useShopifyIntegrationAndScope(shopName)

    if (!integration) {
        void dispatch(
            notify({
                message: 'Could not find the integration for this store.',
                status: NotificationStatus.Error,
            })
        )

        return <Redirect to="/app/automation" />
    }

    if (isLoading) {
        return <Loader />
    }

    const integrationNeedMorePermissions =
        !integration.meta.oauth.scope.includes(READ_FULFILLMENTS_PERMISSION)

    return (
        <AiAgentLayout shopName={shopName}>
            <div>
                {integrationNeedMorePermissions && (
                    <div className={css.warningContainer}>
                        <Alert icon type={AlertType.Warning}>
                            <a
                                href={`/api/integrations/${integration.id}/sync_permissions`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Update your Shopify permissions
                            </a>{' '}
                            to allow AI Agent access to order fulfillment
                            knowledge.
                        </Alert>
                    </div>
                )}

                <StoreConfigForm
                    shopName={shopName}
                    accountDomain={accountDomain}
                    storeConfiguration={storeConfiguration}
                />
            </div>
        </AiAgentLayout>
    )
}
