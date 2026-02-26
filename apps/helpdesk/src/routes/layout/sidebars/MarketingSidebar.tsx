import { AiJourneyNavbar } from 'AIJourney/components'
import { JourneyProvider } from 'AIJourney/providers'

export function MarketingSidebar() {
    return (
        <JourneyProvider>
            <AiJourneyNavbar />
        </JourneyProvider>
    )
}
