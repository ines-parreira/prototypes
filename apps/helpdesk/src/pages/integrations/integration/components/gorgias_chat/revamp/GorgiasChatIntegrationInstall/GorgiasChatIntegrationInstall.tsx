import { useMemo } from 'react'

import type { Map } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import ChatSettingsPageHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/ChatSettingsPageHeader'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import AdvancedInstallationCard from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/AdvancedInstallationCard/AdvancedInstallationCard'
import DeleteCard from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/DeleteCard/DeleteCard'
import css from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall.less'
import InstallationCard from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/InstallationCard/InstallationCard'
import { Tab } from 'pages/integrations/integration/types'
import type { deleteIntegration } from 'state/integrations/actions'

type BreadcrumbItemData = {
    link?: string
    label: string
    id: string
}

type Props = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: any
        deleteIntegration: typeof deleteIntegration
    }
}

// TODO [ChatSettingsScreensRevamp]: Delete this component once the feature flag is properly migrated
const GorgiasChatIntegrationInstall = ({
    integration,
    actions: { deleteIntegration, updateOrCreateIntegration },
}: Props) => {
    const chatIntegrationsLink = `/app/settings/channels/${IntegrationType.GorgiasChat}`

    const breadcrumbItems = useMemo<BreadcrumbItemData[]>(
        () => [
            {
                link: chatIntegrationsLink,
                label: 'All chats',
                id: '1',
            },
            {
                label: integration.get('name'),
                id: '2',
            },
        ],
        [integration, chatIntegrationsLink],
    )

    return (
        <div className={css.installationTab}>
            <ChatSettingsPageHeader
                breadcrumbItems={breadcrumbItems}
                title="Settings"
                onSave={() => {}}
            />
            <GorgiasChatIntegrationHeader
                integration={integration}
                tab={Tab.Installation}
            />
            <div className={css.cardsWrapper}>
                <InstallationCard
                    integration={integration}
                    actions={{
                        updateOrCreateIntegration,
                    }}
                ></InstallationCard>
                <AdvancedInstallationCard integration={integration} />
                <DeleteCard
                    integration={integration}
                    onDeleteIntegration={deleteIntegration}
                />
            </div>
        </div>
    )
}

export default GorgiasChatIntegrationInstall
