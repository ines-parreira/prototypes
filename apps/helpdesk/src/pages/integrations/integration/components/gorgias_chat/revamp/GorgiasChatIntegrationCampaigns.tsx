import type { Map } from 'immutable'

import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'

type Props = {
    integration: Map<any, any>
}

export const GorgiasChatIntegrationCampaignsRevamp = ({
    integration,
}: Props) => {
    return (
        <GorgiasChatRevampLayout integration={integration}>
            {null}
        </GorgiasChatRevampLayout>
    )
}
