import React from 'react'
import {fromJS, List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import {deleteIntegration} from 'state/integrations/actions'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import {getStoreIntegrations} from 'state/integrations/selectors'
import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {SuccessModalIcon} from 'pages/common/components/SuccessModal/SuccessModal'
import {Tab} from 'pages/integrations/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import warningIcon from 'assets/img/icons/warning.svg'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'

import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import useChatMigrationBanner from '../hooks/useChatMigrationBanner'
import GorgiasChatIntegrationOneClickInstallationCard from './GorgiasChatIntegrationOneClickInstallationCard'
import GorgiasChatIntegrationManualInstallationCard from './GorgiasChatIntegrationManualInstallationCard'
import GorgiasChatIntegrationConnectStore from './GorgiasChatIntegrationConnectStore'
import css from './GorgiasChatIntegrationInstall.less'
import InstallationStep from './GorgiasChatIntegrationManualInstallationTabs/components/InstallationStep'
import InstallationTab from './GorgiasChatIntegrationManualInstallationTabs/components/InstallationTab'

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
    actions: {updateOrCreateIntegration, deleteIntegration},
    isUpdate,
}: Props) => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const {installed} = useAppSelector(getChatInstallationStatus)
    const applicationId: string = integration.getIn(['meta', 'app_id'])
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([])
    )

    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId
          )
        : undefined

    const isConnected = Boolean(storeIntegration)
    const isConnectedToShopify =
        storeIntegration?.type === IntegrationType.Shopify
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : undefined

    const {showScriptTagMigrationBanner} = useChatMigrationBanner(integration)

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
                >
                    <GorgiasChatIntegrationConnectedChannel
                        integration={integration}
                    />
                </PageHeader>

                <GorgiasChatIntegrationHeader
                    integration={integration}
                    tab={Tab.Installation}
                />

                <Container fluid className={css.container}>
                    <div className={css.content}>
                        {showScriptTagMigrationBanner && (
                            <Alert type={AlertType.Warning}>
                                <p
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img
                                        src={warningIcon}
                                        alt="icon"
                                        className={css.migrationBannerIcon}
                                    />
                                    <b>
                                        Update 1-click installation for Shopify
                                    </b>
                                </p>
                                <p>
                                    We enhanced the 1-click installation for
                                    Shopify to ensure better stability. Please
                                    follow the steps below to update your chat:
                                </p>
                                <InstallationTab>
                                    <InstallationStep index={1}>
                                        Go to the{' '}
                                        <Link
                                            to={`/app/settings/integrations/shopify/${
                                                shopIntegrationId ?? ''
                                            }`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Shopify integration settings page
                                        </Link>{' '}
                                        and click <b>Update App Permissions</b>.
                                    </InstallationStep>
                                    <InstallationStep index={2}>
                                        <b>Uninstall and reinstall</b> your chat
                                        via 1-click installation for Shopify.
                                    </InstallationStep>
                                </InstallationTab>
                            </Alert>
                        )}
                        <div>
                            <div className={css.connectStoreTitle}>
                                Connect store
                            </div>
                            <div className={css.connectStoreDescription}>
                                A store connection is required to use Automation
                                Add-on features in chat and to enable 1-click
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
                                    <GorgiasChatIntegrationOneClickInstallationCard
                                        integration={integration}
                                        updateOrCreateIntegration={
                                            updateOrCreateIntegration
                                        }
                                        isConnected={isConnected}
                                        isInstalled={
                                            isOneClickInstallation ?? false
                                        }
                                    />
                                )}
                                <GorgiasChatIntegrationManualInstallationCard
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
                                            <b> delete the script</b> from the
                                            store's theme, website code, or
                                            Google Tag Manager to remove it from
                                            your website.
                                        </span>
                                    )
                                }
                                confirmationButtonIntent="destructive"
                                confirmLabel="Delete Chat"
                                cancelLabel="Cancel"
                                showCancelButton={true}
                                intent="destructive"
                                fillStyle="ghost"
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete Chat
                                </ButtonIconLabel>
                            </ConfirmButton>
                        )}
                    </div>
                </Container>
            </div>
        </>
    )
}

export default GorgiasChatIntegrationInstall
