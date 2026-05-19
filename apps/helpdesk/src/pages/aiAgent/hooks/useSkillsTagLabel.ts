import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocation } from 'react-router-dom'

import { useGetWizard } from 'models/helpCenter/queries'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

type Params = {
    selectedStore?: string
    guidanceHelpCenterId?: number
}

export const useSkillsTagLabel = ({
    selectedStore,
    guidanceHelpCenterId,
}: Params): 'New' | 'Resume' => {
    const isSkillWizardEnabled = useFlag(FeatureFlagKey.SkillWizard)
    const { pathname } = useLocation()

    const helpCenterId = guidanceHelpCenterId ?? 0
    const { data: wizard } = useGetWizard(helpCenterId, {
        enabled: isSkillWizardEnabled && !!helpCenterId,
    })

    const skillsWizardPath = selectedStore
        ? getAiAgentNavigationRoutes(selectedStore).skillsWizard
        : ''
    const isOnSkillsWizard =
        !!skillsWizardPath && pathname.startsWith(skillsWizardPath)

    const shouldResume =
        wizard?.status === SkillWizardStatus.InProgress && !isOnSkillsWizard

    return shouldResume ? 'Resume' : 'New'
}
