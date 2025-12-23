import { useMemo } from 'react'

import { Redirect } from 'react-router-dom'

import {
    Banner,
    Button,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { SETTINGS } from 'pages/aiAgent/constants'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { hasShopifyRequiredPermissions } from 'pages/aiAgent/utils/shopify-integration.utils'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { StoreConfigForm } from '../components/StoreConfigForm/StoreConfigForm'
import AiAgentFormChangesProvider from '../providers/AiAgentFormChangesProvider'

import css from './AiAgentConfigurationView.less'

type AiAgentConfigurationViewProps = {
    shopName: string
    shopType: string
    accountDomain: string
    section?: 'chat' | 'email' | 'sms'
}
export const AiAgentConfigurationView = ({
    shopName,
    shopType,
    accountDomain,
    section,
}: AiAgentConfigurationViewProps) => {
    const dispatch = useAppDispatch()

    const { isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const { integration } = useShopifyIntegrationAndScope(shopName)

    const {
        data: helpCenterListData,
        isInitialLoading: isLoadingHelpCenters,
        isError: isHelpCentersError,
        error: helpCentersError,
        refetch: refetchHelpCenters,
    } = useGetHelpCenterList(
        { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    )

    const helpCenters = useMemo(
        () =>
            (helpCenterListData?.data.data ?? []).filter(
                (hc) => hc.shop_name === shopName || hc.shop_name === null,
            ),
        [helpCenterListData, shopName],
    )

    if (!integration) {
        void dispatch(
            notify({
                message: 'Could not find the integration for this store.',
                status: NotificationStatus.Error,
            }),
        )

        return <Redirect to="/app/automation" />
    }

    const getTitle = () => {
        switch (section) {
            case 'chat':
                return 'Chat'
            case 'email':
                return 'Email'
            case 'sms':
                return 'SMS'
            default:
                return SETTINGS
        }
    }

    if (isHelpCentersError) {
        const is403Error =
            isGorgiasApiError(helpCentersError) &&
            helpCentersError.response?.status === 403

        const retryButton = !is403Error ? (
            <Button
                intent="regular"
                variant="primary"
                size="sm"
                onClick={() => refetchHelpCenters()}
            >
                Retry
            </Button>
        ) : null
        const errorMessage = isGorgiasApiError(helpCentersError)
            ? helpCentersError.response?.data?.error?.msg
            : 'There was an error while trying to fetch help centers. Please try again later.'

        return (
            <div className={css.errorContainer}>
                <Banner
                    variant="inline"
                    intent="destructive"
                    isClosable={false}
                    size="md"
                    title="Failed to load resources"
                    description={errorMessage}
                    children={retryButton}
                />
            </div>
        )
    }

    if (isStoreConfigLoading || isLoadingHelpCenters) {
        return (
            <div className={css.spinner} aria-label="loading">
                <LoadingSpinner size="big" />
            </div>
        )
    }
    const integrationNeedMorePermissions =
        !hasShopifyRequiredPermissions(integration)

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={getTitle()}
        >
            <div className={css.aiAgentConfigurationView}>
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

                <AiAgentFormChangesProvider>
                    <StoreConfigForm
                        shopName={shopName}
                        shopType={shopType}
                        accountDomain={accountDomain}
                        faqHelpCenters={helpCenters}
                        section={section}
                    />
                </AiAgentFormChangesProvider>
            </div>
        </AiAgentLayout>
    )
}
