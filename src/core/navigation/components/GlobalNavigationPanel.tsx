import React from 'react'

import {GlobalNavigation} from 'common/navigation'
import {Panel} from 'core/layout/panels'

const panelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export default function GlobalNavigationPanel() {
    return (
        <Panel name="global-navigation" config={panelConfig}>
            <GlobalNavigation />
        </Panel>
    )
}
