import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { getHasAutomate } from 'state/billing/selectors'

export function AutomateUpgradeBadge() {
    const hasAutomate = useAppSelector(getHasAutomate)
    const integrations = useStoreIntegrations()

    if (hasAutomate && integrations.length === 0) {
        return null
    }

    return (
        <Badge type="magenta" className={cssNavbar.badge}>
            <i className="material-icons">auto_awesome</i>
            UPGRADE
        </Badge>
    )
}
