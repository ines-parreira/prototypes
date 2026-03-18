import type { ReactNode } from 'react'

import { AIJourneyProvider } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { ConfigurationProvider } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { EventsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { MessagesProvider } from 'pages/aiAgent/PlaygroundV2/contexts/MessagesContext'
import { SettingsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import type {
    DraftKnowledge,
    SupportedPlaygroundModes,
} from 'pages/aiAgent/PlaygroundV2/types'

type PlaygroundProviderProps = {
    children: ReactNode
    shopName: string
    arePlaygroundActionsAllowed?: boolean
    supportedModes?: SupportedPlaygroundModes
    draftKnowledge?: DraftKnowledge
}

export const PlaygroundProvider = (props: PlaygroundProviderProps) => {
    const {
        shopName,
        arePlaygroundActionsAllowed,
        children,
        supportedModes,
        draftKnowledge,
    } = props

    return (
        <EventsProvider>
            <ConfigurationProvider shopName={shopName}>
                <CoreProvider
                    draftKnowledge={draftKnowledge}
                    arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                >
                    <AIJourneyProvider shopName={shopName}>
                        <MessagesProvider>
                            <SettingsProvider supportedModes={supportedModes}>
                                {children}
                            </SettingsProvider>
                        </MessagesProvider>
                    </AIJourneyProvider>
                </CoreProvider>
            </ConfigurationProvider>
        </EventsProvider>
    )
}
