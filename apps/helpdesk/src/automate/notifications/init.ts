import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'

import { registerCategory, registerNotification } from 'common/notifications'
import { AUTOMATE_ICON } from 'pages/common/components/SourceIcon'

import AiAgentNotification from './components/AiAgentNotification'
import WorkflowConfigurationUpdatedNotification from './components/WorkflowConfigurationUpdatedNotification'
import {
    AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
    WORKFLOWS_CONFIGURATION_UPDATED_TYPE,
    WORKFLOWS_CONFIGURATION_UPDATED_WORKFLOW,
} from './constants'

const getIsAiAgentOnboardingNotificationEnabled = () => {
    const launchDarklyClient = getLDClient()
    return !!launchDarklyClient?.variation(
        FeatureFlagKey.AiAgentOnboardingNotification,
    )
}

registerCategory({
    type: 'account-and-system-updates',
    label: 'Account & system updates',
    description:
        'Get notified about updates and alerts related to account set up, system functionality and security.',
    typeLabel: 'Event',
    isEnabled: getIsAiAgentOnboardingNotificationEnabled,
})

registerNotification({
    type: AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    component: AiAgentNotification,
    workflow: AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
    settings: {
        type: 'account-and-system-updates',
        icon: AUTOMATE_ICON,
        label: 'AI Agent set up and optimization tips',
    },
    isEnabled: getIsAiAgentOnboardingNotificationEnabled,
})

// System notification cannot be disabled
registerNotification({
    type: WORKFLOWS_CONFIGURATION_UPDATED_TYPE,
    component: WorkflowConfigurationUpdatedNotification,
    workflow: WORKFLOWS_CONFIGURATION_UPDATED_WORKFLOW,
    isEnabled: () => true,
})
