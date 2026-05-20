import type { Map } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import GorgiasChatCreationWizardLegacy from './legacy/GorgiasChatCreationWizard/GorgiasChatCreationWizard'
import GorgiasChatCreationWizardRevamp from './revamp/CreationWizard/GorgiasChatCreationWizard'
import { GorgiasChatCreationWizardSkeleton } from './revamp/CreationWizard/GorgiasChatCreationWizardSkeleton'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

export const GorgiasChatCreationWizard = (props: Props) => {
    const { isChatSettingsRevampEnabled, isLoading } =
        useShouldShowChatSettingsRevamp()

    if (isLoading) {
        return <GorgiasChatCreationWizardSkeleton />
    }

    if (isChatSettingsRevampEnabled) {
        return <GorgiasChatCreationWizardRevamp {...props} />
    }
    return <GorgiasChatCreationWizardLegacy {...props} />
}
