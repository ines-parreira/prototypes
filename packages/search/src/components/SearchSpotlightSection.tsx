import {
    Fragment,
    memo,
    type MouseEvent,
    type ReactNode,
    useState,
} from 'react'

import { isMacOs } from '@repo/utils'
import { Link as RouterLink } from 'react-router-dom'

import {
    Avatar,
    Box,
    Icon,
    Link,
    OverflowTooltip,
    Quantity,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableLayout,
    TableRow,
    Tag,
    Text,
} from '@gorgias/axiom'

import type { SearchRow, SearchSection, SearchSectionSummary } from '../types'
import { DisplayText } from './DisplayText'
import {
    getRowHiddenMatch,
    hasDisplayTextValue,
    hasTextValue,
} from './utils/searchSpotlightUtils'

import css from './SearchSpotlightRoot.module.less'

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
const EMPTY_LINK_SPACER_HEIGHT = 20

type SectionWithIndexedRows = Omit<SearchSectionSummary, 'rows'> & {
    rows: Array<{
        row: SearchRow
        globalIndex: number
    }>
}

type RowLinkClickHandler = (
    event: MouseEvent<HTMLAnchorElement>,
    row: SearchRow,
    rowIndex: number,
) => void

type SearchSpotlightSectionProps = {
    isSearchMode: boolean
    onOpenRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    onRowLinkClick: RowLinkClickHandler
    onSelectSection: (section: Exclude<SearchSection, 'all'>) => void
    selectedSection: SearchSection
    sections: SectionWithIndexedRows[]
    selectedIndex: number | null
    showLoadingMoreRows?: boolean
    setRowRef: (index: number, element: HTMLTableRowElement | null) => void
    setSelectedIndex: (index: number) => void
}

export function SearchSpotlightSection({
    isSearchMode,
    onOpenRow,
    onRowLinkClick,
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
            onRowLinkClick={onRowLinkClick}
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

function SearchSpotlightSectionGroup(props: SearchSpotlightSectionGroupProps) {
    const {
        isSearchMode,
        onOpenRow,
        onRowLinkClick,
        onSelectSection,
        section,
        selectedIndex,
        selectedSection,
        setRowRef,
        setSelectedIndex,
        showLoadingMoreRows,
    } = props

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
                    <TableBody data-active-hover="">
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
                                        onRowLinkClick={onRowLinkClick}
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

type SearchSpotlightSectionGroupProps = {
    isSearchMode: boolean
    onOpenRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    onRowLinkClick: RowLinkClickHandler
    onSelectSection: (section: Exclude<SearchSection, 'all'>) => void
    section: SectionWithIndexedRows
    selectedIndex: number | null
    selectedSection: SearchSection
    setRowRef: (index: number, element: HTMLTableRowElement | null) => void
    setSelectedIndex: (index: number) => void
    showLoadingMoreRows: boolean
}

function SearchSpotlightSectionRow({
    isHovered,
    isSelected,
    onOpenRow,
    onRowLinkClick,
    row,
    rowIndex,
    setRowRef,
    setSelectedIndex,
    setHoveredIndex,
}: {
    isHovered: boolean
    isSelected: boolean
    onOpenRow: (row: SearchRow, openInNewTab: boolean) => Promise<void>
    onRowLinkClick: RowLinkClickHandler
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
                    if (!row.url) {
                        void onOpenRow(
                            row,
                            (isMacOs && event.metaKey) ||
                                (!isMacOs && event.ctrlKey),
                        )
                    }
                }}
            >
                <SearchSpotlightRowCells
                    isMergedPrimary={Boolean(hiddenMatch)}
                    onRowLinkClick={onRowLinkClick}
                    row={row}
                    rowIndex={rowIndex}
                />
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
                        if (!row.url) {
                            void onOpenRow(
                                row,
                                (isMacOs && event.metaKey) ||
                                    (!isMacOs && event.ctrlKey),
                            )
                        }
                    }}
                >
                    <TableCell
                        colSpan={ENTITY_TABLE_COLUMN_COUNT}
                        data-merged-row-detail-cell
                        h={row.url ? 'auto' : undefined}
                        p={row.url ? 0 : undefined}
                        paddingTop={0}
                    >
                        <SearchSpotlightCellLink
                            isMergedDetail
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            <Box minWidth={0} w="100%">
                                <DisplayText
                                    value={hiddenMatch}
                                    color="content-neutral-tertiary"
                                    size="sm"
                                    overflow="ellipsis"
                                />
                            </Box>
                        </SearchSpotlightCellLink>
                    </TableCell>
                </TableRow>
            ) : null}
        </Fragment>
    )
}

const MemoizedSearchSpotlightSectionRow = memo(SearchSpotlightSectionRow)

function SearchSpotlightCellLink({
    emptyCellLabelledBy,
    children,
    isMergedDetail = false,
    isMergedPrimary = false,
    onRowLinkClick,
    row,
    rowIndex,
}: {
    emptyCellLabelledBy?: string
    children?: ReactNode
    isMergedDetail?: boolean
    isMergedPrimary?: boolean
    onRowLinkClick: RowLinkClickHandler
    row: SearchRow
    rowIndex: number
}) {
    if (!row.url) {
        return children ?? null
    }

    return (
        <RouterLink
            aria-labelledby={children == null ? emptyCellLabelledBy : undefined}
            className={[
                css.resultCellLink,
                isMergedPrimary ? css.resultCellMergedPrimaryLink : null,
                isMergedDetail ? css.resultCellDetailLink : null,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={(event) => {
                onRowLinkClick(event, row, rowIndex)
            }}
            tabIndex={-1}
            to={row.url}
        >
            {children ?? (
                <Box
                    className={css.resultCellLinkSpacer}
                    minHeight={EMPTY_LINK_SPACER_HEIGHT}
                />
            )}
        </RouterLink>
    )
}

function SearchSpotlightRowCells({
    isMergedPrimary,
    onRowLinkClick,
    row,
    rowIndex,
}: {
    isMergedPrimary: boolean
    onRowLinkClick: RowLinkClickHandler
    row: SearchRow
    rowIndex: number
}) {
    const primaryTextId = `search-spotlight-${row.kind}-${row.id}-primary`

    switch (row.kind) {
        case 'customer':
            return (
                <>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.customer.primary}
                    >
                        <SearchSpotlightCellLink
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    alt=""
                                    name="user"
                                    size="sm"
                                    color="content-neutral-default"
                                />
                                <Box
                                    flexGrow={1}
                                    id={primaryTextId}
                                    minWidth={0}
                                >
                                    <DisplayText
                                        value={row.name}
                                        color="content-neutral-default"
                                        variant="medium"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.customer.email}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasDisplayTextValue(row.email) ? (
                                <Box alignItems="center" gap="xs" minWidth={0}>
                                    <Icon
                                        alt=""
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.customer.phone}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasDisplayTextValue(row.phone) ? (
                                <Box alignItems="center" gap="xs" minWidth={0}>
                                    <Icon
                                        alt=""
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                </>
            )
        case 'ticket':
            return (
                <>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.primary}
                    >
                        <SearchSpotlightCellLink
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    alt=""
                                    name={
                                        row.isUnread
                                            ? 'comm-mail'
                                            : 'comm-mail-open'
                                    }
                                    size="sm"
                                    color="content-neutral-default"
                                />
                                <Box
                                    flexGrow={1}
                                    id={primaryTextId}
                                    minWidth={0}
                                >
                                    <DisplayText
                                        value={row.subject}
                                        color="content-neutral-default"
                                        variant="medium"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.status}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasTextValue(row.statusLabel) ? (
                                <Box minWidth={0}>
                                    <Tag color={row.statusColor}>
                                        {row.statusLabel}
                                    </Tag>
                                </Box>
                            ) : null}
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.tertiary}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasDisplayTextValue(row.customerName) ? (
                                <Box alignItems="center" gap="xs" minWidth={0}>
                                    <Icon
                                        alt=""
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.activity}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.agent}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasTextValue(row.agentName) ? (
                                <Box alignItems="center" gap="xs" minWidth={0}>
                                    <Avatar
                                        aria-hidden
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                </>
            )
        case 'call':
            return (
                <>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.primary}
                    >
                        <SearchSpotlightCellLink
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            <Box alignItems="center" gap="xs" minWidth={0}>
                                <Icon
                                    alt=""
                                    name={row.callIcon}
                                    size="sm"
                                    color="content-neutral-default"
                                />
                                <Box
                                    flexGrow={1}
                                    id={primaryTextId}
                                    minWidth={0}
                                >
                                    <DisplayText
                                        value={row.title}
                                        color="content-neutral-default"
                                        variant="medium"
                                        overflow="ellipsis"
                                    />
                                </Box>
                            </Box>
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.status}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasTextValue(row.statusLabel) ? (
                                <Box minWidth={0}>
                                    <Tag color={row.statusColor}>
                                        {row.statusLabel}
                                    </Tag>
                                </Box>
                            ) : null}
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.tertiary}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
                            {hasDisplayTextValue(row.customerPhone) ? (
                                <Box alignItems="center" gap="xs" minWidth={0}>
                                    <Icon
                                        alt=""
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.activity}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        >
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
                        </SearchSpotlightCellLink>
                    </TableCell>
                    <TableCell
                        p={row.url ? 0 : undefined}
                        w={COLUMN_WIDTHS.entity.agent}
                    >
                        <SearchSpotlightCellLink
                            emptyCellLabelledBy={primaryTextId}
                            isMergedPrimary={isMergedPrimary}
                            onRowLinkClick={onRowLinkClick}
                            row={row}
                            rowIndex={rowIndex}
                        />
                    </TableCell>
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
