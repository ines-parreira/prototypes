import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Spinner from 'pages/common/components/Spinner'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {AiAgentLayout} from '../components/AiAgentLayout/AiAgentLayout'
import {StoreConfigForm} from '../components/StoreConfigForm/StoreConfigForm'
import css from './AiAgentConfigurationView.less'

export const READ_FULFILLMENTS_PERMISSION = 'read_fulfillments'

type AiAgentConfigurationViewProps = {
    shopName: string
    shopType: string
    accountDomain: string
}
export const AiAgentConfigurationView = ({
    shopName,
    shopType,
    accountDomain,
}: AiAgentConfigurationViewProps) => {
    const dispatch = useAppDispatch()

    const {isLoading: isStoreConfigLoading} =
        useAiAgentStoreConfigurationContext()

    const {integration} = useShopifyIntegrationAndScope(shopName)

    const {data: helpCenterListData, isLoading: isLoadingHelpCenters} =
        useGetHelpCenterList(
            {type: 'faq', per_page: HELP_CENTER_MAX_CREATION},
            {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
            }
        )

    const helpCenters = useMemo(
        () =>
            (helpCenterListData?.data.data ?? []).filter(
                (hc) => hc.shop_name === shopName || hc.shop_name === null
            ),
        [helpCenterListData, shopName]
    )

    if (!integration) {
        void dispatch(
            notify({
                message: 'Could not find the integration for this store.',
                status: NotificationStatus.Error,
            })
        )

        return <Redirect to="/app/automation" />
    }

    if (isStoreConfigLoading || isLoadingHelpCenters) {
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
    }

    const integrationNeedMorePermissions =
        !integration.meta.oauth.scope.includes(READ_FULFILLMENTS_PERMISSION)

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
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
                    shopType={shopType}
                    accountDomain={accountDomain}
                    faqHelpCenters={helpCenters}
                />
            </div>
        </AiAgentLayout>
    )
}
