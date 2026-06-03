import { useLocation } from 'react-router-dom'

import { useGetWizard } from 'models/helpCenter/queries'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useSkillsAccess } from 'pages/aiAgent/hooks/useSkillsAccess'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

type Params = {
    selectedStore?: string
    guidanceHelpCenterId?: number
}

export const useSkillsTagLabel = ({
    selectedStore,
    guidanceHelpCenterId,
}: Params): 'New' | 'Resume' => {
    const isSkillsAccessEnabled = useSkillsAccess()
    const { pathname } = useLocation()

    const helpCenterId = guidanceHelpCenterId ?? 0
    const { data: wizard } = useGetWizard(helpCenterId, {
        enabled: isSkillsAccessEnabled && !!helpCenterId,
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
