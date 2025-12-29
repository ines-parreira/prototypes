import type { ReactElement } from 'react'

import { NavigationProvider } from '@repo/navigation'
import { CookiesProvider } from 'react-cookie'

import { BannersContextProvider } from 'AlertBanners'
import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { NotificationsProvider } from 'common/notifications'
import { ThemeProvider } from 'core/theme'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import VoiceDeviceProvider from 'pages/integrations/integration/components/voice/VoiceDeviceProvider'
import AblyRealtimeProviders from 'providers/realtime-ably/AblyRealtimeProviders'
import { SpotlightProvider } from 'providers/ui/SpotlightProvider'
import { SplitTicketViewProvider } from 'split-ticket-view-toggle'

import App from './App'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function Main({ children }: Props) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <NotificationsProvider>
                    <BannersContextProvider>
                        <AblyRealtimeProviders>
                            <SpotlightProvider>
                                <VoiceDeviceProvider>
                                    <SplitTicketViewProvider>
                                        <CookiesProvider
                                            defaultSetOptions={{
                                                path: '/',
                                            }}
                                        >
                                            <NavigationProvider>
                                                <NavBarProvider>
                                                    <App>{children}</App>
                                                </NavBarProvider>
                                            </NavigationProvider>
                                        </CookiesProvider>
                                    </SplitTicketViewProvider>
                                </VoiceDeviceProvider>
                            </SpotlightProvider>
                        </AblyRealtimeProviders>
                    </BannersContextProvider>
                </NotificationsProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}
