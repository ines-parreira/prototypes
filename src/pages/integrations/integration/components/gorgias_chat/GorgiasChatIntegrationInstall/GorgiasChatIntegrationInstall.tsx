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
import {Tab} from 'pages/integrations/integration/Integration'

import GorgiasChatIntegrationHeader from '../GorgiasChatIntegrationHeader'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import GorgiasChatIntegrationOneClickInstallationCard from './GorgiasChatIntegrationOneClickInstallationCard'
import GorgiasChatIntegrationManualInstallationCard from './GorgiasChatIntegrationManualInstallationCard'
import GorgiasChatIntegrationConnectStore from './GorgiasChatIntegrationConnectStore'

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
    actions: {updateOrCreateIntegration, deleteIntegration},
    isUpdate,
}: Props) => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)
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
        </>
    )
}

export default GorgiasChatIntegrationInstall
