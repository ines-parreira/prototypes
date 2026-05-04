import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Quantity,
    Text,
} from '@gorgias/axiom'

import type { SearchSection } from '../types'

type SearchSpotlightTabsProps = {
    buttonCounts: Record<SearchSection, number | null>
    selectedSection: SearchSection
    showCalls: boolean
    onSelectionChange: (section: SearchSection) => void
}

function SearchSpotlightTabItem({
    count,
    id,
    label,
}: {
    count: number | null
    id: SearchSection
    label: string
}) {
    return (
        <ButtonGroupItem id={id}>
            <Box alignItems="center" gap="xs">
                <Text>{label}</Text>
                {count !== null ? <Quantity quantity={count} compact /> : null}
            </Box>
        </ButtonGroupItem>
    )
}

export function SearchSpotlightTabs({
    buttonCounts,
    selectedSection,
    showCalls,
    onSelectionChange,
}: SearchSpotlightTabsProps) {
    return (
        <ButtonGroup
            selectedKey={selectedSection}
            onSelectionChange={(key) => {
                onSelectionChange(key as SearchSection)
            }}
        >
            <SearchSpotlightTabItem
                count={buttonCounts.all}
                id="all"
                label="All"
            />
            <SearchSpotlightTabItem
                count={buttonCounts.customers}
                id="customers"
                label="Customers"
            />
            <SearchSpotlightTabItem
                count={buttonCounts.tickets}
                id="tickets"
                label="Tickets"
            />
            {showCalls ? (
                <SearchSpotlightTabItem
                    count={buttonCounts.calls}
                    id="calls"
                    label="Calls"
                />
            ) : null}
        </ButtonGroup>
    )
}
