// Import react-scan BEFORE React or ReactDOM
import { scan } from 'react-scan'

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

import { render } from 'react-dom'

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

    scan({
        enabled: true,
        log: false,
        trackUnnecessaryRenders: true,
    })
}

const container = document.getElementById('App')

if (container) {
    render(<Root store={store} />, container)
}
