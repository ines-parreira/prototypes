import React from 'react'
import {Redirect} from 'react-router-dom'
import {notify} from 'state/notifications/actions'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import Loader from 'pages/common/components/Loader/Loader'
import {getIntegrationsByType} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import {useGetStoreConfigurationPure} from '../../../models/aiAgent/queries'
import {EditAiAgentSettingsForm} from './EditAiAgentSettingsForm'
import {CreateAiAgentSettingsForm} from './CreateAiAgentSettingsForm'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import css from './AiAgentStoreView.less'

type AiAgentStoreViewProps = {
    shopName: string
    accountDomain: string
}

const READ_FULFILLMENTS_PERMISSION = 'read_fulfillments'

export const AiAgentStoreView = ({
    shopName,
    accountDomain,
}: AiAgentStoreViewProps) => {
    const dispatch = useAppDispatch()

    const currentIntegration = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    ).find((integration) => integration.meta.shop_name === shopName)

    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    const {
        isLoading: getStoreConfigurationIsLoading,
        data: getStoreConfigurationResponse,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    if (!currentIntegration) {
        void dispatch(
            notify({
                message: 'Could not find the integration for this store.',
                status: NotificationStatus.Error,
            })
        )
        return <Redirect to="/app/automation" />
    }

    const storeIntegrationHasShopifyPermissions =
        currentIntegration.meta.oauth.scope.includes(
            READ_FULFILLMENTS_PERMISSION
        )

    if (getStoreConfigurationIsLoading) {
        return <Loader />
    }

    const serverStoreConfig =
        getStoreConfigurationResponse?.data.storeConfiguration

    if (serverStoreConfig) {
        return (
            <AutomateView
                title={AI_AGENT}
                headerNavbarItems={headerNavbarItems}
            >
                <div>
                    <div className={css.configurationWarningContainer}>
                        {!storeIntegrationHasShopifyPermissions && (
                            <Alert icon type={AlertType.Warning}>
                                <a
                                    href={`/api/integrations/${currentIntegration.id}/sync_permissions`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Update your Shopify permissions
                                </a>{' '}
                                to allow AI Agent access to order fulfillment
                                knowledge.
                            </Alert>
                        )}
                        <EditAiAgentSettingsForm
                            shopName={shopName}
                            accountDomain={accountDomain}
                            storeConfiguration={serverStoreConfig}
                        />
                    </div>
                </div>
            </AutomateView>
        )
    }

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <div>
                <div className={css.configurationWarningContainer}>
                    {!storeIntegrationHasShopifyPermissions && (
                        <Alert icon type={AlertType.Warning}>
                            <a
                                href={`/api/integrations/${currentIntegration.id}/sync_permissions`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Update your Shopify permissions
                            </a>{' '}
                            to allow AI Agent access to order fulfillment
                            knowledge.
                        </Alert>
                    )}
                </div>
                <CreateAiAgentSettingsForm
                    shopName={shopName}
                    accountDomain={accountDomain}
                />
            </div>
        </AutomateView>
    )
}
