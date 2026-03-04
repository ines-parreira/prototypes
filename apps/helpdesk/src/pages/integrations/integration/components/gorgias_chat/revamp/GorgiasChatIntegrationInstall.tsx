import type { Map } from 'immutable'

import AdvancedInstallationCard from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/AdvancedInstallationCard/AdvancedInstallationCard'
import DeleteCard from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/DeleteCard/DeleteCard'
import css from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall.less'
import InstallationCard from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/InstallationCard/InstallationCard'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import type {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

type Props = {
    integration: Map<any, any>
    actions: {
        updateOrCreateIntegration: typeof updateOrCreateIntegration
        deleteIntegration: typeof deleteIntegration
    }
}

export const GorgiasChatIntegrationInstallRevamp = ({
    integration,
    actions: { deleteIntegration, updateOrCreateIntegration },
}: Props) => {
    return (
        <GorgiasChatRevampLayout integration={integration}>
            <div className={css.installationTab}>
                <div className={css.cardsWrapper}>
                    <InstallationCard
                        integration={integration}
                        actions={{
                            updateOrCreateIntegration,
                        }}
                    />
                    <AdvancedInstallationCard integration={integration} />
                    <DeleteCard
                        integration={integration}
                        onDeleteIntegration={deleteIntegration}
                    />
                </div>
            </div>
        </GorgiasChatRevampLayout>
    )
}
