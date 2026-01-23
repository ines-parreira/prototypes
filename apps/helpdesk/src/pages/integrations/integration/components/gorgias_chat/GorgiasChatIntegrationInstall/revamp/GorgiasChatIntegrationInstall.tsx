import { type Map } from 'immutable'

import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'
import DeleteCard from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationInstall/revamp/DeleteCard'
import { Tab } from 'pages/integrations/integration/types'
import type { deleteIntegration } from 'state/integrations/actions'

import css from './GorgiasChatIntegrationInstall.less'

type Props = {
    integration: Map<any, any>
    actions: {
        deleteIntegration: typeof deleteIntegration
    }
}

const GorgiasChatIntegrationInstall = ({
    integration,
    actions: { deleteIntegration: onDeleteIntegration },
}: Props) => {
    return (
        <div className={css.installationTab}>
            <GorgiasChatIntegrationHeader
                integration={integration}
                tab={Tab.Installation}
            />
            <div className={css.cardsWrapper}>
                <DeleteCard
                    integration={integration}
                    onDeleteIntegration={onDeleteIntegration}
                />
            </div>
        </div>
    )
}

export default GorgiasChatIntegrationInstall
