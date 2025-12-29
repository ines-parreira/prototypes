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
import './initServiceWorker'
import './initNotifications'
import './initQueryClient'
import './initSocketManager'

import React from 'react'

import { render } from 'react-dom'

import 'init'

import { store } from 'common/store'
import Root from 'pages/Root'
// eslint-disable-next-line
import mobileScrollManager from 'services/mobileScrollManager'

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
    // `createRoot` enables concurrent rendering features, but that
    // currently causes issues with our editor. If you are reading
    // this from the future and want to replace this with `createRoot`,
    // please ensure you test the editor properly (also in places like
    // editing macros etc).
    //
    // Or, once we fix up our editor, feel free to try again. :)
    //
    // For more context: https://linear.app/gorgias/issue/SUPXP-3770
    render(<Root store={store} />, container)
}
