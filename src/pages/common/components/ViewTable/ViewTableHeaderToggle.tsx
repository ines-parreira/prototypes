import React from 'react'

import {useDesktopOnlyShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import Toggle from 'split-ticket-view-toggle/components/Toggle'

export function ViewTableHeaderToggle() {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()

    if (showGlobalNav) {
        return <Toggle />
    }

    return null
}
