import { Route } from 'react-router-dom'

import { PHONE_INTEGRATION_BASE_URL as baseURL } from './constants'
import VoiceQueueCreatePage from './VoiceQueueCreatePage'
import VoiceQueueEditPage from './VoiceQueueEditPage'
import VoiceQueueListPage from './VoiceQueueListPage'

export default function VoiceIntegrationQueueRoutes() {
    return (
        <>
            <Route path={`${baseURL}/queues`} exact>
                <VoiceQueueListPage />
            </Route>
            <Route path={`${baseURL}/queues/new`} exact>
                <VoiceQueueCreatePage />
            </Route>
            <Route path={`${baseURL}/queues/:id`} exact>
                <VoiceQueueEditPage />
            </Route>
        </>
    )
}
