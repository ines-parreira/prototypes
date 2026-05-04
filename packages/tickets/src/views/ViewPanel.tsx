import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { Panel as LayoutPanel } from '@repo/layout'

import {
    Box,
    Disclosure,
    DisclosurePanel,
    Panel,
    SearchField,
} from '@gorgias/axiom'
import type { ViewField } from '@gorgias/helpdesk-types'

import { TicketTable } from '../ticket-list'
import { useTicketSearchUrlState } from '../ticket-list/hooks/useTicketSearchUrlState'
import type { DirtyViewInput } from '../ticket-list/hooks/useTicketTableData'
import type { SearchTracking } from '../ticket-list/types/searchTracking'
import { ViewHeader } from './ViewHeader'

const layoutPanelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

type ViewPanelProps = {
    viewId: number
    isSearchMode?: boolean
    onSearchResultCountChange?: (count?: number) => void
    onExpand?: () => void
    onEditView?: () => void
    onFixFilters?: () => void
    onNavigateToTicket?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
    settingsContent?: ReactNode
    isSettingsExpanded?: boolean
    onSettingsExpandedChange?: (isExpanded: boolean) => void
    dirtyView?: DirtyViewInput
    titleOverride?: string
    hideCreateTicket?: boolean
    isDraftView?: boolean
    draftFields?: ViewField[]
    onDraftFieldsChange?: (fields: ViewField[]) => void
    searchTracking?: SearchTracking
}

export function ViewPanel({
    viewId,
    isSearchMode = false,
    onSearchResultCountChange,
    onExpand,
    onEditView,
    onFixFilters,
    onNavigateToTicket,
    onApplyMacro,
    settingsContent,
    isSettingsExpanded = false,
    onSettingsExpandedChange,
    dirtyView,
    titleOverride,
    hideCreateTicket,
    isDraftView,
    draftFields,
    onDraftFieldsChange,
    searchTracking,
}: ViewPanelProps) {
    const { query, setQuery } = useTicketSearchUrlState()
    const [searchInputValue, setSearchInputValue] = useState(query)

    useEffect(() => {
        setSearchInputValue(query)
    }, [query])

    const handleSearchChange = useCallback((value: string) => {
        setSearchInputValue(value)
    }, [])

    const handleSearchSubmit = useCallback(
        (value: string) => {
            setQuery(value.trim())
        },
        [setQuery],
    )

    const handleSearchClear = useCallback(() => {
        setSearchInputValue('')
        setQuery('')
    }, [setQuery])

    return (
        <LayoutPanel name="views" config={layoutPanelConfig}>
            <Panel h="100%" overflow="auto" withoutBorder>
                <ViewHeader
                    viewId={viewId}
                    onExpand={onExpand}
                    onEditView={onEditView}
                    titleOverride={titleOverride}
                    hideCreateTicket={hideCreateTicket}
                    isDraftView={isDraftView}
                    isSearchMode={isSearchMode}
                    isSettingsExpanded={isSettingsExpanded}
                />
                {isSearchMode && (
                    <Box px="lg" pb="sm">
                        <Box width="220px">
                            <SearchField
                                aria-label="Search tickets"
                                placeholder="Search tickets..."
                                value={searchInputValue}
                                onChange={handleSearchChange}
                                onSubmit={handleSearchSubmit}
                                onClear={handleSearchClear}
                                autoFocus
                            />
                        </Box>
                    </Box>
                )}
                {isSearchMode || isDraftView ? (
                    settingsContent
                ) : (
                    <Disclosure
                        isExpanded={isSettingsExpanded}
                        onExpandedChange={onSettingsExpandedChange}
                    >
                        <DisclosurePanel py={0}>
                            {settingsContent}
                        </DisclosurePanel>
                    </Disclosure>
                )}
                <TicketTable
                    key={viewId}
                    viewId={viewId}
                    isSearchMode={isSearchMode}
                    onSearchResultCountChange={onSearchResultCountChange}
                    onFixFilters={onFixFilters}
                    onNavigateToTicket={onNavigateToTicket}
                    onApplyMacro={onApplyMacro}
                    dirtyView={dirtyView}
                    isDraftView={isDraftView}
                    draftFields={draftFields}
                    onDraftFieldsChange={onDraftFieldsChange}
                    searchTracking={searchTracking}
                />
            </Panel>
        </LayoutPanel>
    )
}
