import type { ReactNode } from 'react'

import { Panel } from '@repo/layout'

import { Box } from '@gorgias/axiom'
import type { ViewField } from '@gorgias/helpdesk-types'

import { TicketTable } from '../ticket-list'
import type { DirtyViewInput } from '../ticket-list/hooks/useTicketTableData'
import { ViewHeader } from './ViewHeader'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

type ViewPanelProps = {
    viewId: number
    onExpand?: () => void
    onEditView?: () => void
    onFixFilters?: () => void
    onNavigateToTicket?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
    topContent?: ReactNode
    dirtyView?: DirtyViewInput
    titleOverride?: string
    hideCreateTicket?: boolean
    isDraftView?: boolean
    draftFields?: ViewField[]
    onDraftFieldsChange?: (fields: ViewField[]) => void
}

export function ViewPanel({
    viewId,
    onExpand,
    onEditView,
    onFixFilters,
    onNavigateToTicket,
    onApplyMacro,
    topContent,
    dirtyView,
    titleOverride,
    hideCreateTicket,
    isDraftView,
    draftFields,
    onDraftFieldsChange,
}: ViewPanelProps) {
    return (
        <Panel name="views" config={panelConfig}>
            <Box height="100%" width="100%" flexDirection="column">
                <ViewHeader
                    viewId={viewId}
                    onExpand={onExpand}
                    onEditView={onEditView}
                    titleOverride={titleOverride}
                    hideCreateTicket={hideCreateTicket}
                    isDraftView={isDraftView}
                />
                {topContent}
                <TicketTable
                    viewId={viewId}
                    onFixFilters={onFixFilters}
                    onNavigateToTicket={onNavigateToTicket}
                    onApplyMacro={onApplyMacro}
                    dirtyView={dirtyView}
                    isDraftView={isDraftView}
                    draftFields={draftFields}
                    onDraftFieldsChange={onDraftFieldsChange}
                />
            </Box>
        </Panel>
    )
}
