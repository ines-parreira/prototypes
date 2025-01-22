import React, {ComponentProps} from 'react'

import {useParams} from 'react-router-dom'

import {useDesktopOnlyShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import Toggle from 'split-ticket-view-toggle/components/Toggle'

export function TicketHeaderToggle({
    withLeftMargin = true,
}: ComponentProps<typeof Toggle>) {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const params = useParams<{viewId?: string}>()

    const isSplitView = params.viewId !== undefined

    if (showGlobalNav && !isSplitView) {
        return <Toggle withLeftMargin={withLeftMargin} />
    }

    return null
}
