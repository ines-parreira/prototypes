import { useMemo } from 'react'

import type { Map } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import ChatSettingsPageHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/ChatSettingsPageHeader'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import { Tab } from 'pages/integrations/integration/types'
import type { deleteIntegration } from 'state/integrations/actions'

import AdvancedInstallationCard from './AdvancedInstallationCard/AdvancedInstallationCard'
import DeleteCard from './DeleteCard/DeleteCard'
import InstallationCard from './InstallationCard/InstallationCard'

import css from './GorgiasChatIntegrationInstall.less'

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
