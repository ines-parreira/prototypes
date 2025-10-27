import { ReactNode } from 'react'

import { ConfigurationProvider } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { CoreProvider } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { EventsProvider } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { MessagesProvider } from 'pages/aiAgent/PlaygroundV2/contexts/MessagesContext'

type PlaygroundProviderProps = {
    children: ReactNode
    shopName: string
    arePlaygroundActionsAllowed?: boolean
}

export const PlaygroundProvider = (props: PlaygroundProviderProps) => {
    return (
        <EventsProvider>
            <ConfigurationProvider shopName={props.shopName}>
                <CoreProvider
                    arePlaygroundActionsAllowed={
                        props.arePlaygroundActionsAllowed
                    }
                >
                    <MessagesProvider>{props.children}</MessagesProvider>
                </CoreProvider>
            </ConfigurationProvider>
        </EventsProvider>
    )
}
