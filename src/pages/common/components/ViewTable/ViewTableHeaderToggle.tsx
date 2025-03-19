import { useLocation } from 'react-router-dom'

import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import Toggle from 'split-ticket-view-toggle/components/Toggle'
import { isTicketPath } from 'utils'

export function ViewTableHeaderToggle() {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const location = useLocation()
    const shouldShowToggle = isTicketPath(location.pathname)

    if (showGlobalNav && shouldShowToggle) {
        return <Toggle />
    }

    return null
}
