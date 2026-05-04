import { Fragment, memo, useState } from 'react'

import { isMacOs } from '@repo/utils'

import {
    Avatar,
    Box,
    Icon,
    Link,
    OverflowTooltip,
    Quantity,
    Skeleton,
    StatusButton,
    Table,
    TableBody,
    TableCell,
    TableLayout,
    TableRow,
    Text,
} from '@gorgias/axiom'

import type { SearchRow, SearchSection, SearchSectionSummary } from '../types'
import { DisplayText } from './DisplayText'
import {
    getRowHiddenMatch,
    hasDisplayTextValue,
    hasTextValue,
} from './utils/searchSpotlightUtils'

const COLUMN_WIDTHS = {
    customer: {
        primary: 300,
        email: 220,
        phone: 150,
    },
    entity: {
        primary: 220,
        status: 80,
        tertiary: 136,
        activity: 88,
        agent: 150,
    },
} as const

const ENTITY_TABLE_COLUMN_COUNT = 5

type SectionWithIndexedRows = Omit<SearchSectionSummary, 'rows'> & {
    rows: Array<{
        row: SearchRow
        globalIndex: number
    }>
}

type SearchSpotlightSectionProps = {
    isSearchMode: boolean
    onOpenRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    onSelectSection: (section: Exclude<SearchSection, 'all'>) => void
    selectedSection: SearchSection
    sections: SectionWithIndexedRows[]
    selectedIndex: number
    showLoadingMoreRows?: boolean
    setRowRef: (index: number, element: HTMLTableRowElement | null) => void
    setSelectedIndex: (index: number) => void
}

export function SearchSpotlightSection({
    isSearchMode,
    onOpenRow,
    onSelectSection,
    selectedSection,
    sections,
    selectedIndex,
    showLoadingMoreRows = false,
    setRowRef,
    setSelectedIndex,
}: SearchSpotlightSectionProps) {
    return sections.map((section) => (
        <SearchSpotlightSectionGroup
            isSearchMode={isSearchMode}
            key={section.id}
            onOpenRow={onOpenRow}
            onSelectSection={onSelectSection}
            section={section}
            selectedIndex={selectedIndex}
            selectedSection={selectedSection}
            setRowRef={setRowRef}
            setSelectedIndex={setSelectedIndex}
            showLoadingMoreRows={showLoadingMoreRows}
        />
    ))
}

function SearchSpotlightSectionGroup({
    isSearchMode,
    onOpenRow,
    onSelectSection,
    section,
    selectedIndex,
    selectedSection,
    setRowRef,
    setSelectedIndex,
    showLoadingMoreRows,
}: {
    isSearchMode: boolean
    onOpenRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    onSelectSection: (section: Exclude<SearchSection, 'all'>) => void
    section: SectionWithIndexedRows
    selectedIndex: number
    selectedSection: SearchSection
    setRowRef: (index: number, element: HTMLTableRowElement | null) => void
    setSelectedIndex: (index: number) => void
    showLoadingMoreRows: boolean
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <Box
            flexDirection="column"
            gap="xs"
            onMouseLeave={() => {
                setHoveredIndex(null)
            }}
        >
            <Box alignItems="center" justifyContent="space-between">
                <Text variant="medium">{section.title}</Text>
                {isSearchMode &&
                selectedSection === 'all' &&
                section.totalCount > section.rows.length ? (
                    <Box alignItems="center" gap="xs">
                        <Link
                            onClick={() => {
                                onSelectSection(section.id)
                            }}
                            size="sm"
                        >
                            More results
                        </Link>
                        <Quantity
                            quantity={section.totalCount - section.rows.length}
                            compact
                        />
                    </Box>
                ) : null}
            </Box>
            <Box w="100%">
                <Table withBorder layout={TableLayout.Fixed}>
                    <TableBody>
                        {section.rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Box justifyContent="center" p="lg">
                                        <Text color="content-neutral-secondary">
                                            {section.emptyMessage}
                                        </Text>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {section.rows.map(({ row, globalIndex }) => (
                                    <MemoizedSearchSpotlightSectionRow
                                        isHovered={globalIndex === hoveredIndex}
                                        isSelected={
                                            globalIndex === selectedIndex
                                        }
                                        key={`${row.kind}-${row.id}`}
                                        onOpenRow={onOpenRow}
                                        row={row}
                                        rowIndex={globalIndex}
                                        setRowRef={setRowRef}
                                        setSelectedIndex={setSelectedIndex}
                                        setHoveredIndex={setHoveredIndex}
                                    />
                                ))}
                                {showLoadingMoreRows ? (
                                    <SearchSpotlightLoadingRows
                                        sectionId={section.id}
                                    />
                                ) : null}
                            </>
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    )
}

function SearchSpotlightSectionRow({
    isHovered,
    isSelected,
    onOpenRow,
    row,
    rowIndex,
    setRowRef,
    setSelectedIndex,
    setHoveredIndex,
}: {
    isHovered: boolean
    isSelected: boolean
    onOpenRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    row: SearchRow
    rowIndex: number
    setRowRef: (index: number, element: HTMLTableRowElement | null) => void
    setSelectedIndex: (index: number) => void
    setHoveredIndex: (index: number | null) => void
}) {
    const hiddenMatch = getRowHiddenMatch(row)

    return (
        <Fragment>
            <TableRow
                ref={(element) => {
                    setRowRef(rowIndex, element)
                }}
                data-selected={isSelected}
                data-hovered={isHovered}
                data-merged-row-primary={hiddenMatch ? true : undefined}
                onMouseEnter={() => {
                    setHoveredIndex(rowIndex)
                }}
                onClick={(event) => {
                    setSelectedIndex(rowIndex)
                    void onOpenRow(
                        row,
                        (isMacOs && event.metaKey) ||
                            (!isMacOs && event.ctrlKey),
                    )
                }}
            >
                <SearchSpotlightRowCells row={row} />
            </TableRow>
            {hiddenMatch ? (
                <TableRow
                    data-selected={isSelected}
                    data-hovered={isHovered}
                    data-merged-row-detail
                    onMouseEnter={() => {
                        setHoveredIndex(rowIndex)
                    }}
                    onClick={(event) => {
                        setSelectedIndex(rowIndex)
                        void onOpenRow(
                            row,
                            (isMacOs && event.metaKey) ||
                                (!isMacOs && event.ctrlKey),
                        )
                    }}
                >
                    <TableCell
                        colSpan={ENTITY_TABLE_COLUMN_COUNT}
                        data-merged-row-detail-cell
                        paddingTop={0}
                    >
                        <Box minWidth={0} w="100%">
                            <DisplayText
                                value={hiddenMatch}
                                color="content-neutral-tertiary"
                                size="sm"
                                overflow="ellipsis"
                            />
                        </Box>
                    </TableCell>
                </TableRow>
            ) : null}
        </Fragment>
    )
}

const MemoizedSearchSpotlightSectionRow = memo(SearchSpotlightSectionRow)

function SearchSpotlightRowCells({ row }: { row: SearchRow }) {
    switch (row.kind) {
        case 'customer':
            return (
                <>
                    <TableCell w={COLUMN_WIDTHS.customer.primary}>
                        <Box alignItems="center" gap="xs" minWidth={0}>
                            <Icon name="user" size="sm" />
                            <Box flexGrow={1} minWidth={0}>
                                <DisplayText
                                    value={row.name}
                                    variant="medium"
                                    overflow="ellipsis"
                                />
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.customer.email}>
                        {hasDisplayTextValue(row.email) ? (
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    name="comm-mail"
                                    size="sm"
                                    color="content-neutral-tertiary"
                                />
                                <Box flexGrow={1} minWidth={0}>
                                    <DisplayText
                                        value={row.email}
                                        color="content-neutral-tertiary"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.customer.phone}>
                        {hasDisplayTextValue(row.phone) ? (
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    name="comm-phone-end"
                                    size="sm"
                                    color="content-neutral-tertiary"
                                />
                                <Box flexGrow={1} minWidth={0}>
                                    <DisplayText
                                        value={row.phone}
                                        color="content-neutral-tertiary"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        ) : null}
                    </TableCell>
                </>
            )
        case 'ticket':
            return (
                <>
                    <TableCell w={COLUMN_WIDTHS.entity.primary}>
                        <Box alignItems="center" gap="xs" minWidth={0}>
                            <Icon
                                name={
                                    row.isUnread
                                        ? 'comm-mail'
                                        : 'comm-mail-open'
                                }
                                size="sm"
                            />
                            <Box flexGrow={1} minWidth={0}>
                                <DisplayText
                                    value={row.subject}
                                    variant="medium"
                                    overflow="ellipsis"
                                />
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.status}>
                        {hasTextValue(row.statusLabel) ? (
                            <Box minWidth={0}>
                                <StatusButton color={row.statusColor}>
                                    {row.statusLabel}
                                </StatusButton>
                            </Box>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.tertiary}>
                        {hasDisplayTextValue(row.customerName) ? (
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    name="user"
                                    size="sm"
                                    color="content-neutral-tertiary"
                                />
                                <Box flexGrow={1} minWidth={0}>
                                    <DisplayText
                                        value={row.customerName}
                                        color="content-neutral-tertiary"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.activity}>
                        {hasTextValue(row.activityLabel) ? (
                            <OverflowTooltip placement="right">
                                <Text
                                    overflow="ellipsis"
                                    size="md"
                                    color="content-neutral-tertiary"
                                >
                                    {row.activityLabel}
                                </Text>
                            </OverflowTooltip>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.agent}>
                        {hasTextValue(row.agentName) ? (
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Avatar
                                    name={row.agentName}
                                    size="md"
                                    url={row.agentAvatarUrl}
                                />
                                <Box flexGrow={1} minWidth={0}>
                                    <OverflowTooltip placement="right">
                                        <Text
                                            overflow="ellipsis"
                                            size="md"
                                            color="content-neutral-tertiary"
                                        >
                                            {row.agentName}
                                        </Text>
                                    </OverflowTooltip>
                                </Box>
                            </Box>
                        ) : null}
                    </TableCell>
                </>
            )
        case 'call':
            return (
                <>
                    <TableCell w={COLUMN_WIDTHS.entity.primary}>
                        <Box alignItems="center" gap="xs" minWidth={0}>
                            <Icon name={row.callIcon} size="sm" />
                            <Box flexGrow={1} minWidth={0}>
                                <DisplayText
                                    value={row.title}
                                    variant="medium"
                                    overflow="ellipsis"
                                />
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.status}>
                        {hasTextValue(row.statusLabel) ? (
                            <Box minWidth={0}>
                                <StatusButton color={row.statusColor}>
                                    {row.statusLabel}
                                </StatusButton>
                            </Box>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.tertiary}>
                        {hasDisplayTextValue(row.customerPhone) ? (
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    name="comm-phone-end"
                                    size="sm"
                                    color="content-neutral-tertiary"
                                />
                                <Box flexGrow={1} minWidth={0}>
                                    <DisplayText
                                        value={row.customerPhone}
                                        color="content-neutral-tertiary"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.activity}>
                        {hasTextValue(row.activityLabel) ? (
                            <OverflowTooltip placement="right">
                                <Text
                                    overflow="ellipsis"
                                    size="md"
                                    color="content-neutral-tertiary"
                                >
                                    {row.activityLabel}
                                </Text>
                            </OverflowTooltip>
                        ) : null}
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.agent} />
                </>
            )
    }
}

function SearchSpotlightLoadingRows({
    sectionId,
}: {
    sectionId: Exclude<SearchSection, 'all'>
}) {
    return Array.from({ length: 3 }, (_, index) => (
        <TableRow key={`loading-row-${sectionId}-${index}`}>
            {sectionId === 'customers' ? (
                <>
                    <TableCell w={COLUMN_WIDTHS.customer.primary}>
                        <Skeleton height={20} width="70%" />
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.customer.email}>
                        <Skeleton height={20} width="80%" />
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.customer.phone}>
                        <Skeleton height={20} width="60%" />
                    </TableCell>
                </>
            ) : (
                <>
                    <TableCell w={COLUMN_WIDTHS.entity.primary}>
                        <Skeleton height={20} width="75%" />
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.status}>
                        <Skeleton height={20} width="100%" />
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.tertiary}>
                        <Skeleton height={20} width="70%" />
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.activity}>
                        <Skeleton height={20} width="100%" />
                    </TableCell>
                    <TableCell w={COLUMN_WIDTHS.entity.agent}>
                        <Skeleton height={20} width="85%" />
                    </TableCell>
                </>
            )}
        </TableRow>
    ))
}
