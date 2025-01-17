import React from 'react'

import {GlobalNavigation} from 'common/navigation'
import {Panel} from 'core/layout/panels'

const panelConfig = {
    defaultSize: 48,
    minSize: 48,
    maxSize: 48,
}

export default function GlobalNavigationPanel() {
    return (
        <Panel name="global-navigation" config={panelConfig}>
            <GlobalNavigation />
        </Panel>
    )
}
