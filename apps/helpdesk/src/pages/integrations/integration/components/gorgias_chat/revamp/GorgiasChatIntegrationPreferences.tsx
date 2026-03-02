import type { Map } from 'immutable'

import { GorgiasChatRevampLayout } from './GorgiasChatRevampLayout'
import { useChatPreviewPanel } from './hooks/useChatPreviewPanel'

type Props = {
    integration: Map<any, any>
}

export const GorgiasChatIntegrationPreferencesRevamp = ({
    integration,
}: Props) => {
    useChatPreviewPanel()

    return (
        <GorgiasChatRevampLayout integration={integration}>
            {null}
        </GorgiasChatRevampLayout>
    )
}
