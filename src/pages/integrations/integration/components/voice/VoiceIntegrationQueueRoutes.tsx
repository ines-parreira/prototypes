import React from 'react'

import { Route } from 'react-router-dom'

import { PHONE_INTEGRATION_BASE_URL as baseURL } from './constants'
import VoiceQueueCreatePage from './VoiceQueueCreatePage'

export default function VoiceIntegrationQueueRoutes() {
    return (
        <>
            <Route path={`${baseURL}/queues`} exact>
                <div>QUEUE LIST</div>
            </Route>
            <Route path={`${baseURL}/queues/new`} exact>
                <VoiceQueueCreatePage />
            </Route>
        </>
    )
}
