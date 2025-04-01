import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import {
    SplitTicketViewToggle,
    useSplitTicketView,
} from 'split-ticket-view-toggle'

export function TicketHeaderToggle() {
    const { isEnabled } = useSplitTicketView()
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()

    if (showGlobalNav && !isEnabled) {
        return <SplitTicketViewToggle />
    }

    return null
}
