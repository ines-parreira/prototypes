import type { Map } from 'immutable'

import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useChatPreviewPanel'

type Props = {
    integration: Map<any, any>
}

export const GorgiasAutomateChatIntegrationRevamp = ({
    integration,
}: Props) => {
    useChatPreviewPanel()

    return (
        <GorgiasChatRevampLayout integration={integration}>
            {null}
        </GorgiasChatRevampLayout>
    )
}
