import React from 'react'
import {fromJS, List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import {deleteIntegration} from 'state/integrations/actions'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {NotificationStatus} from 'state/notifications/types'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import {getStoreIntegrations} from 'state/integrations/selectors'

import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import GorgiasChatIntegrationOneClickInstallationCard from './NewGorgiasChatIntegrationOneClickInstallationCard'
import GorgiasChatIntegrationManualInstallationCard from './GorgiasChatIntegrationManualInstallationCard'
import GorgiasChatIntegrationConnectStore from './GorgiasChatIntegrationConnectStore'

import css from './NewGorgiasChatIntegrationInstall.less'

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
    const installationStatus = useAppSelector(getChatInstallationStatus)
    const applicationId = integration.getIn(['meta', 'app_id'])
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([])
    )

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) => storeIntegration.id === shopIntegrationId
    )

    const isConnected = Boolean(storeIntegration)
    const isConnectedToShopify =
        storeIntegration?.type === IntegrationType.Shopify
    const isOneClickInstallation =
        shopifyIntegrationIds.includes(shopIntegrationId)

    return (
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

            <GorgiasChatIntegrationNavigation integration={integration} />

            {!installationStatus.installed && (
                <BannerNotification
                    status={NotificationStatus.Error}
                    showIcon
                    message="Your chat widget was not seen installed on your website
                        in the past 72 hours. Check its installation and your
                        website to resolve."
                    actionHTML={
                        <a
                            href="https://docs.gorgias.com/en-US/chat-getting-started-81789#installation-monitoring"
                            target="_blank"
                            rel="noreferrer"
                        >
                            More Information
                        </a>
                    }
                    borderless
                    dismissible={false}
                />
            )}
            <Container fluid className={css.container}>
                <div className={css.content}>
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
                            isOneClickInstallation={isOneClickInstallation}
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
                                    isInstalled={isOneClickInstallation}
                                />
                            )}
                            <GorgiasChatIntegrationManualInstallationCard
                                applicationId={applicationId}
                                isConnected={isConnected}
                                isConnectedToShopify={isConnectedToShopify}
                            />
                        </div>
                    </div>

                    {isUpdate && (
                        <ConfirmButton
                            className={css.deleteButton}
                            onConfirm={() => {
                                deleteIntegration(integration)
                            }}
                            confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
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
    )
}

export default GorgiasChatIntegrationInstall
