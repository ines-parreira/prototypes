import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { ViewPanel } from '@repo/tickets/views'

import { useSplitTicketView } from 'split-ticket-view-toggle'
import { useViewId } from 'tickets/core/hooks'

import LegacyViewPanel from './ViewPanel'

export function ViewPanelEntrypoint() {
    const hasUIVisionMS4Dot5 = useHelpdeskV2MS4Dot5Flag()
    const { setIsEnabled } = useSplitTicketView()
    const viewId = useViewId()

    if (hasUIVisionMS4Dot5) {
        return <ViewPanel viewId={viewId} onExpand={() => setIsEnabled(true)} />
    }

    return <LegacyViewPanel />
}
