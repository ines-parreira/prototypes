import {
    isAtLeastMilestone,
    useActionCentralizedLibraryEnabled,
} from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import { ACTIONS, SUPPORT_ACTIONS } from 'pages/aiAgent/constants'

export function useActionsLabel(): string {
    const { milestone } = useActionCentralizedLibraryEnabled()
    return isAtLeastMilestone(milestone, 'MILESTONE-2')
        ? ACTIONS
        : SUPPORT_ACTIONS
}
