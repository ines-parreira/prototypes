import React, {ReactElement} from 'react'

import {NotificationsProvider} from 'common/notifications'
import {SpotlightProvider} from 'providers/ui/SpotlightProvider'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {SplitTicketViewProvider} from 'split-ticket-view-toggle'
import {ThemeProvider} from 'theme'

import VoiceDeviceProvider from 'pages/integrations/integration/components/voice/VoiceDeviceProvider'
import App from './App'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function Core({children}: Props) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <NotificationsProvider>
                    <SpotlightProvider>
                        <VoiceDeviceProvider>
                            <SplitTicketViewProvider>
                                <App>{children}</App>
                            </SplitTicketViewProvider>
                        </VoiceDeviceProvider>
                    </SpotlightProvider>
                </NotificationsProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}
