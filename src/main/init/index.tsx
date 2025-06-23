// This is to force react-scan to be imported always before 'React'
// and guarantee that the rule is applied
// eslint-disable-next-line no-empty-pattern
let reactScan = { scan: ({}) => {} }
if (process.env.NODE_ENV === 'development') {
    reactScan = require('react-scan')
}

// in order to prevent issues with overriding third-party (bootstrap)
// styles, it is important that this import remain here as the very
// first thing that is imported. This ensures they are loaded first
// and any selectors imported later that have the same specificity
// will take precedence.
import 'assets/css/main.less'
import './initNotifications'
import './initQueryClient'
import './initSocketManager'

import React from 'react'

import {createRoot} from 'react-dom/client'

import 'init'

import { store } from 'common/store'
import Root from 'pages/Root'
// eslint-disable-next-line
import mobileScrollManager from 'services/mobileScrollManager.js'

// Only import and run scan in development
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render')

    whyDidYouRender(React, {
        trackAllPureComponents: false,
    })

    reactScan.scan({
        enabled: false,
        log: false,
        showFPS: true,
        showNotificationCount: true,
        showToolbar: true
    })
}

const container = document.getElementById('App')

if (container) {
    const root = createRoot(container)
    root.render(<Root store={store} />)
}
