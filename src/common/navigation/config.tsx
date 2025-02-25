import React from 'react'

import type { PanelLayoutConfig } from 'pages/PanelLayout'

import GlobalNavigation from './components/GlobalNavigation'

export const globalNavigationPanel: PanelLayoutConfig = {
    key: 'global-navbar-panel',
    content: <GlobalNavigation />,
    panelConfig: [49, 49, 49],
}
