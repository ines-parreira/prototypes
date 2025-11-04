import { ReactNode } from 'react'

import { AIJourneyProvider } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { ConfigurationProvider } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { EventsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { MessagesProvider } from 'pages/aiAgent/PlaygroundV2/contexts/MessagesContext'
import { SettingsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'

type PlaygroundProviderProps = {
    children: ReactNode
    shopName: string
    arePlaygroundActionsAllowed?: boolean
}

export const PlaygroundProvider = (props: PlaygroundProviderProps) => {
    const { shopName, arePlaygroundActionsAllowed, children } = props

    return (
        <EventsProvider>
            <ConfigurationProvider {...{ shopName }}>
                <CoreProvider {...{ arePlaygroundActionsAllowed }}>
                    <MessagesProvider>
                        <AIJourneyProvider shopName={shopName}>
                            <SettingsProvider>{children}</SettingsProvider>
                        </AIJourneyProvider>
                    </MessagesProvider>
                </CoreProvider>
            </ConfigurationProvider>
        </EventsProvider>
    )
}
