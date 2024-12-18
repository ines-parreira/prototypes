import React, {ReactElement} from 'react'

import {CookiesProvider} from 'react-cookie'

import {BannersContextProvider} from 'AlertBanners'
import {NotificationsProvider} from 'common/notifications'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import VoiceDeviceProvider from 'pages/integrations/integration/components/voice/VoiceDeviceProvider'
import {SpotlightProvider} from 'providers/ui/SpotlightProvider'
import {SplitTicketViewProvider} from 'split-ticket-view-toggle'
import {ThemeProvider} from 'theme'

import App from './App'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function Main({children}: Props) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <NotificationsProvider>
                    <BannersContextProvider>
                        <SpotlightProvider>
                            <VoiceDeviceProvider>
                                <SplitTicketViewProvider>
                                    <CookiesProvider
                                        defaultSetOptions={{path: '/'}}
                                    >
                                        <App>{children}</App>
                                    </CookiesProvider>
                                </SplitTicketViewProvider>
                            </VoiceDeviceProvider>
                        </SpotlightProvider>
                    </BannersContextProvider>
                </NotificationsProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}
