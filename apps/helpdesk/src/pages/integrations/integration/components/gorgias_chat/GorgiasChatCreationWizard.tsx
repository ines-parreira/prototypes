import type { Map } from 'immutable'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import GorgiasChatCreationWizardLegacy from './legacy/GorgiasChatCreationWizard/GorgiasChatCreationWizard'
import GorgiasChatCreationWizardRevamp from './legacy/GorgiasChatCreationWizard/revamp/GorgiasChatCreationWizard'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

export const GorgiasChatCreationWizard = (props: Props) => {
    const { shouldShowRevamp } = useShouldShowChatSettingsRevamp()

    if (shouldShowRevamp) {
        return <GorgiasChatCreationWizardRevamp {...props} />
    }
    return <GorgiasChatCreationWizardLegacy {...props} />
}
