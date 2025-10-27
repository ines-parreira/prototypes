import { Badge } from '@gorgias/axiom'

import cssNavbar from 'assets/css/navbar.less'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

export function AutomateUpgradeBadge() {
    const { hasAccess } = useAiAgentAccess()
    const integrations = useStoreIntegrations()

    if (hasAccess && integrations.length === 0) {
        return null
    }

    return (
        <Badge type="magenta" className={cssNavbar.badge}>
            <i className="material-icons">auto_awesome</i>
            UPGRADE
        </Badge>
    )
}
