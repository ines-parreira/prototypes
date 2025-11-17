import type { ReactNode } from 'react'

import { AIJourneyProvider } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { ConfigurationProvider } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { EventsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { MessagesProvider } from 'pages/aiAgent/PlaygroundV2/contexts/MessagesContext'
import { SettingsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import type { SupportedPlaygroundModes } from 'pages/aiAgent/PlaygroundV2/types'

type PlaygroundProviderProps = {
    children: ReactNode
    shopName: string
    arePlaygroundActionsAllowed?: boolean
    supportedModes?: SupportedPlaygroundModes
}

export const PlaygroundProvider = (props: PlaygroundProviderProps) => {
    const { shopName, arePlaygroundActionsAllowed, children, supportedModes } =
        props

    return (
        <EventsProvider>
            <ConfigurationProvider {...{ shopName }}>
                <CoreProvider {...{ arePlaygroundActionsAllowed }}>
                    <MessagesProvider>
                        <AIJourneyProvider shopName={shopName}>
                            <SettingsProvider supportedModes={supportedModes}>
                                {children}
                            </SettingsProvider>
                        </AIJourneyProvider>
                    </MessagesProvider>
                </CoreProvider>
            </ConfigurationProvider>
        </EventsProvider>
    )
}
