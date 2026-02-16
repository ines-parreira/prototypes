import { AiJourneyNavbar } from 'AIJourney/components'
import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'

export function MarketingSidebar() {
    return (
        <IntegrationsProvider>
            <JourneyProvider>
                <AiJourneyNavbar />
            </JourneyProvider>
        </IntegrationsProvider>
    )
}
