import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import PageHeader from 'pages/common/components/PageHeader'
import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import { SuccessModalIcon } from 'pages/common/components/SuccessModal/SuccessModal'
import BackToConvertButton from 'pages/convert/onboarding/components/BackToConvertButton'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import { Tab } from 'pages/integrations/integration/types'
import type { deleteIntegration } from 'state/integrations/actions'
import { getStoreIntegrations } from 'state/integrations/selectors'

import useChatMigrationBanner from '../hooks/useChatMigrationBanner'
import useThemeAppExtensionInstallation from '../hooks/useThemeAppExtensionInstallation'
import GorgiasChatIntegrationConnectStore from './GorgiasChatIntegrationConnectStore'
import GorgiasChatIntegrationManualInstallationCard from './GorgiasChatIntegrationManualInstallationCard'
import GorgiasChatIntegrationOneClickInstallationCard from './GorgiasChatIntegrationOneClickInstallationCard'
import GorgiasChatIntegrationShopifyCheckoutChatInstallationCard from './GorgiasChatIntegrationShopifyCheckoutChatInstallationCard'

import css from './GorgiasChatIntegrationInstall.less'

type Props = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: any
        deleteIntegration: typeof deleteIntegration
    }
    isUpdate: boolean
}

const GorgiasChatIntegrationInstall = ({
    integration,
    actions: { updateOrCreateIntegration, deleteIntegration },
    isUpdate,
}: Props) => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const applicationId: string = integration.getIn(['meta', 'app_id'])
    const { installed } = useInstallationStatus(applicationId)
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([]),
    )

    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId,
          )
        : undefined

    const isConnected = Boolean(storeIntegration)
    const isConnectedToShopify =
        storeIntegration?.type === IntegrationType.Shopify
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : undefined

    const { hasShopifyScriptTagScope } = useChatMigrationBanner(integration)
    const {
        shouldUseThemeAppExtensionInstallation,
        themeAppExtensionInstallationUrl,
    } = useThemeAppExtensionInstallation(
        isConnectedToShopify ? storeIntegration : undefined,
    )

    return (
        <>
            <NavigatedSuccessModal
                name={NavigatedSuccessModalName.GorgiasChatManualInstallation}
                icon={SuccessModalIcon.PinchingHand}
                buttonLabel="See instructions"
            >
                <div className="heading-page-semibold mb-2">Almost there!</div>
                <div className="heading-subsection-regular">
                    Install the chat on your website by following the{' '}
                    <b>Manual installation</b> instructions.
                </div>
            </NavigatedSuccessModal>
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                                >
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <GorgiasChatIntegrationHeader
                    integration={integration}
                    tab={Tab.Installation}
                />

                <Container fluid className={css.container}>
                    <div className={css.content}>
                        <div>
                            <div className={css.connectStoreTitle}>
                                Connect store
                            </div>
                            <div className={css.connectStoreDescription}>
                                A store connection is required to use AI Agent
                                features in chat and to enable{' '}
                                {shouldUseThemeAppExtensionInstallation
                                    ? 'quick'
                                    : '1-click'}{' '}
                                installation for Shopify stores.
                            </div>
                            <GorgiasChatIntegrationConnectStore
                                integration={integration}
                                storeIntegration={storeIntegration}
                                storeIntegrations={storeIntegrations}
                                isOneClickInstallation={
                                    isOneClickInstallation ?? false
                                }
                            />
                        </div>

                        <div className={css.installationMethodContainer}>
                            <div className={css.installationMethodTitle}>
                                Installation method
                            </div>

                            <div className={css.installationMethods}>
                                {(!isConnected || isConnectedToShopify) && (
                                    <>
                                        <GorgiasChatIntegrationOneClickInstallationCard
                                            integration={integration}
                                            updateOrCreateIntegration={
                                                updateOrCreateIntegration
                                            }
                                            themeAppExtensionInstallation={
                                                shouldUseThemeAppExtensionInstallation
                                            }
                                            themeAppExtensionInstallationUrl={
                                                themeAppExtensionInstallationUrl
                                            }
                                            isConnected={isConnected}
                                            isInstalled={
                                                isOneClickInstallation ?? false
                                            }
                                            hasShopifyScriptTagScope={
                                                hasShopifyScriptTagScope
                                            }
                                        />
                                        <GorgiasChatIntegrationShopifyCheckoutChatInstallationCard
                                            integration={integration}
                                            isOneClickInstallation={
                                                !!isConnected &&
                                                !!isOneClickInstallation
                                            }
                                        />
                                    </>
                                )}
                                <GorgiasChatIntegrationManualInstallationCard
                                    integration={integration}
                                    applicationId={applicationId}
                                    isConnected={isConnected}
                                    isConnectedToShopify={isConnectedToShopify}
                                    isInstalledManually={
                                        installed && !isOneClickInstallation
                                    }
                                />
                            </div>
                        </div>

                        {isUpdate && (
                            <ConfirmButton
                                className={css.deleteButton}
                                onConfirm={() => {
                                    deleteIntegration(integration)
                                }}
                                confirmationTitle="Delete chat?"
                                confirmationContent={
                                    isOneClickInstallation ? (
                                        'Deleting this chat will remove it from your store and disable any associated views and rules.'
                                    ) : (
                                        <span>
                                            Deleting this chat will remove it
                                            from your store and disable any
                                            associated views and rules. <br />
                                            <br />
                                            For manually installed chats, you
                                            also need to
                                            <b> delete the script</b>
                                            {` from the
                                            store's theme, website code, or
                                            Google Tag Manager to remove it from
                                            your website.`}
                                        </span>
                                    )
                                }
                                confirmationButtonIntent="destructive"
                                confirmLabel="Delete Chat"
                                cancelLabel="Cancel"
                                showCancelButton={true}
                                intent="destructive"
                                fillStyle="ghost"
                                leadingIcon="delete"
                            >
                                Delete Chat
                            </ConfirmButton>
                        )}
                    </div>
                    <BackToConvertButton
                        integrationId={integration.get('id')}
                    />
                </Container>
            </div>
        </>
    )
}

export default GorgiasChatIntegrationInstall
