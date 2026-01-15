import { Panel } from '@repo/layout'

import { GlobalNavigation } from 'common/navigation'

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
