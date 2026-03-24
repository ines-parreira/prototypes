import { useEffect, useState } from 'react'

import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { ViewPanel } from '@repo/tickets/views'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { setViewActive } from 'state/views/actions'
import { getViewPlainJS } from 'state/views/selectors'
import ApplyMacro from 'ticket-list-view/components/bulk-actions/ApplyMacro'
import { useViewId } from 'tickets/core/hooks'

import LegacyViewPanel from './ViewPanel'

export function ViewPanelEntrypoint() {
    const hasUIVisionMS4Dot5 = useHelpdeskV2MS4Dot5Flag()
    const dispatch = useAppDispatch()
    const { setIsEnabled } = useSplitTicketView()
    const viewId = useViewId()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))

    useEffect(() => {
        if (hasUIVisionMS4Dot5 && view) {
            dispatch(setViewActive(fromJS(view)))
        }
    }, [hasUIVisionMS4Dot5, dispatch, view])

    const [macroTicketIds, setMacroTicketIds] = useState<number[] | null>(null)

    if (hasUIVisionMS4Dot5) {
        return (
            <>
                <ViewPanel
                    viewId={viewId}
                    onExpand={() => setIsEnabled(true)}
                    onApplyMacro={setMacroTicketIds}
                />
                {macroTicketIds !== null && (
                    <ApplyMacro
                        ticketIds={macroTicketIds}
                        setIsOpen={(v) => {
                            if (!v) setMacroTicketIds(null)
                        }}
                        onApplyMacro={() => setMacroTicketIds(null)}
                    />
                )}
            </>
        )
    }

    return <LegacyViewPanel />
}
