import type { Map } from 'immutable'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import GorgiasChatCreationWizardLegacy from './GorgiasChatCreationWizard'
import GorgiasChatCreationWizardRevamp from './revamp/GorgiasChatCreationWizard'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

export default function GorgiasChatCreationWizardSwitcher({
    integration,
    loading,
    isUpdate,
}: Props) {
    const { shouldShowRevamp } = useShouldShowChatSettingsRevamp()

    const Component = shouldShowRevamp
        ? GorgiasChatCreationWizardRevamp
        : GorgiasChatCreationWizardLegacy

    return (
        <Component
            integration={integration}
            loading={loading}
            isUpdate={isUpdate}
        />
    )
}
