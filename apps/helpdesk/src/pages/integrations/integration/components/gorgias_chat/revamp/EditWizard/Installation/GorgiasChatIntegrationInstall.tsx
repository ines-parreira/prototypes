import type { Map } from 'immutable'

import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout'
import AdvancedInstallationCard from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/components/AdvancedInstallationCard/AdvancedInstallationCard'
import DeleteCard from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/components/DeleteCard/DeleteCard'
import InstallationCard from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/components/InstallationCard/InstallationCard'
import css from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/GorgiasChatIntegrationInstall.less'
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
