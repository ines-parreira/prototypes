import { render } from '@repo/testing'

import '@testing-library/jest-dom'

import { screen } from '@testing-library/react'

import { DataTable } from '@gorgias/axiom'
import type { DataTableColumnDef } from '@gorgias/axiom'

import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import type { GroupedKnowledgeItem } from '../../types'
import { KnowledgeType, KnowledgeVisibility } from '../../types'
import type { SyncStatusData } from '../columns'
import { getColumns } from '../columns'

const renderColumn = (
    column: DataTableColumnDef<GroupedKnowledgeItem>,
    item: GroupedKnowledgeItem,
) =>
    render(<DataTable<GroupedKnowledgeItem> data={[item]} columns={[column]} />)

// Mock the DrillDownModalTrigger component
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModalTrigger',
    () => ({
        DrillDownModalTrigger: ({ children, enabled, metricData }: any) => (
            <span
                data-testid="drill-down-trigger"
                data-enabled={enabled}
                data-metric-name={metricData?.metricName}
                data-title={metricData?.title}
            >
                {children}
            </span>
        ),
    }),
)

describe('getColumns - Metrics Columns', () => {
    const mockOnClick = jest.fn()
    const mockAvailableActions: GuidanceAction[] = []
    const mockGuidanceHelpCenterId = 123
    const mockMetricsDateRange = {
        start_datetime: '2025-01-01T00:00:00Z',
        end_datetime: '2025-01-28T23:59:59Z',
    }
    const mockOutcomeCustomFieldId = 456
    const mockIntentCustomFieldId = 789

    const createMockMetrics = (
        overrides?: Partial<GroupedKnowledgeItem['metrics']>,
    ): GroupedKnowledgeItem['metrics'] => ({
        tickets: 100,
        handoverTickets: 15,
        csat: 4.5,
        resourceSourceSetId: 1,
        ...overrides,
    })

    const createMockItem = (
        overrides?: Partial<GroupedKnowledgeItem>,
    ): GroupedKnowledgeItem => ({
        id: '1',
        type: KnowledgeType.Guidance,
        title: 'Test Article',
        lastUpdatedAt: '2025-01-01T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        metrics: createMockMetrics(),
        ...overrides,
    })

    const renderCell = (
        item: GroupedKnowledgeItem,
        columnIndex: number,
        dateRange?: { start_datetime: string; end_datetime: string },
    ) => {
        const columns = getColumns(
            '',
            mockOnClick,
            mockAvailableActions,
            mockGuidanceHelpCenterId,
            dateRange,
            mockOutcomeCustomFieldId,
            mockIntentCustomFieldId,
        )
        return renderColumn(columns[columnIndex], item)
    }

    describe('Tickets Column', () => {
        const TICKETS_COLUMN_INDEX = 1

        it('should display ticket count when metrics are available', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ tickets: 42 }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('42')).toBeInTheDocument()
        })

        it('should render DrillDownModalTrigger when tickets > 0 and dateRange is provided', () => {
            const item = createMockItem({
                id: '100',
                metrics: createMockMetrics({ tickets: 42 }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toBeInTheDocument()
            expect(trigger).toHaveAttribute('data-enabled', 'true')
            expect(trigger).toHaveAttribute(
                'data-metric-name',
                'knowledge_tickets',
            )
        })

        it('should set correct title for DrillDownModalTrigger', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ tickets: 42 }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toHaveAttribute('data-title', 'Tickets')
        })

        it('should not enable DrillDownModalTrigger when tickets = 0', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ tickets: 0 }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toHaveAttribute('data-enabled', 'false')
        })

        it('should display "--" when tickets metric is null', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ tickets: null }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('should display "--" when tickets metric is undefined', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ tickets: undefined as any }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('should display "0" when tickets count is 0', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ tickets: 0 }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should display "--" when metrics object is missing', () => {
            const item = createMockItem({
                metrics: undefined,
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('should display "--" for grouped rows', () => {
            const item = createMockItem({
                isGrouped: true,
                metrics: createMockMetrics({ tickets: 42 }),
            })

            renderCell(item, TICKETS_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('--')).toBeInTheDocument()
        })
    })

    describe('Handover Tickets Column', () => {
        const HANDOVER_TICKETS_COLUMN_INDEX = 2

        it('should display handover ticket count when metrics are available', () => {
            const item = createMockItem()

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )
            expect(screen.getByText('15')).toBeInTheDocument()
        })

        it('should render DrillDownModalTrigger when handoverTickets > 0 and dateRange is provided', () => {
            const item = createMockItem({
                id: '200',
                metrics: createMockMetrics({ handoverTickets: 10 }),
            })

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toBeInTheDocument()
            expect(trigger).toHaveAttribute('data-enabled', 'true')
            expect(trigger).toHaveAttribute(
                'data-metric-name',
                'knowledge_handover',
            )
        })

        it('should set correct title for DrillDownModalTrigger', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ handoverTickets: 10 }),
            })

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toHaveAttribute('data-title', 'Handover tickets')
        })

        it('should not enable DrillDownModalTrigger when handoverTickets = 0', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ handoverTickets: 0 }),
            })

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toHaveAttribute('data-enabled', 'false')
        })

        it('should display "--" when handoverTickets metric is null', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ handoverTickets: null }),
            })

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )
            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('should display "0" when handover tickets count is 0', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ handoverTickets: 0 }),
            })

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )
            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should display "--" for grouped rows', () => {
            const item = createMockItem({
                isGrouped: true,
            })

            renderCell(
                item,
                HANDOVER_TICKETS_COLUMN_INDEX,
                mockMetricsDateRange,
            )
            expect(screen.getByText('--')).toBeInTheDocument()
        })
    })

    describe('CSAT Column', () => {
        const AVG_CSAT_COLUMN_INDEX = 3

        it('should display CSAT formatted to 1 decimal place', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ csat: 4.567 }),
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('4.6')).toBeInTheDocument()
        })

        it('should render DrillDownModalTrigger when CSAT is available and dateRange is provided', () => {
            const item = createMockItem({
                id: '300',
                metrics: createMockMetrics({ csat: 4.5 }),
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toBeInTheDocument()
            expect(trigger).toHaveAttribute('data-enabled', 'true')
            expect(trigger).toHaveAttribute(
                'data-metric-name',
                'knowledge_csat',
            )
        })

        it('should set correct title for DrillDownModalTrigger', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ csat: 4.5 }),
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toHaveAttribute('data-title', 'Average CSAT')
        })

        it('should enable DrillDownModalTrigger even when CSAT is 0', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ csat: 0 }),
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)

            const trigger = screen.getByTestId('drill-down-trigger')
            expect(trigger).toHaveAttribute('data-enabled', 'true')
            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should display CSAT formatted to 1 decimal place', () => {
            const item = createMockItem()

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('4.5')).toBeInTheDocument()
        })

        it('should display "--" when CSAT metric is null', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ csat: null }),
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('should display "0" when CSAT is 0', () => {
            const item = createMockItem({
                metrics: createMockMetrics({ csat: 0 }),
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should display "--" for grouped rows', () => {
            const item = createMockItem({
                isGrouped: true,
            })

            renderCell(item, AVG_CSAT_COLUMN_INDEX, mockMetricsDateRange)
            expect(screen.getByText('--')).toBeInTheDocument()
        })
    })

    describe('Column Structure', () => {
        it('should have correct number of columns', () => {
            const columns = getColumns(
                '',
                mockOnClick,
                mockAvailableActions,
                mockGuidanceHelpCenterId,
                mockMetricsDateRange,
                mockOutcomeCustomFieldId,
                mockIntentCustomFieldId,
            )

            expect(columns).toHaveLength(6)
        })

        it('should have metrics columns in correct order', () => {
            const columns = getColumns(
                '',
                mockOnClick,
                mockAvailableActions,
                mockGuidanceHelpCenterId,
                mockMetricsDateRange,
                mockOutcomeCustomFieldId,
                mockIntentCustomFieldId,
            )

            // Check column accessors/IDs
            expect((columns[1] as any).accessorKey).toBe('metrics.tickets')
            expect((columns[2] as any).accessorKey).toBe(
                'metrics.handoverTickets',
            )
            expect((columns[3] as any).accessorKey).toBe('metrics.csat')
        })
    })

    describe('In Use by AI Agent Column', () => {
        const IN_USE_BY_AI_COLUMN_INDEX = 5

        const renderInUseByAICell = (
            item: GroupedKnowledgeItem,
            syncStatusData?: SyncStatusData,
        ) => {
            const columns = getColumns(
                '',
                mockOnClick,
                mockAvailableActions,
                mockGuidanceHelpCenterId,
                mockMetricsDateRange,
                mockOutcomeCustomFieldId,
                mockIntentCustomFieldId,
                false,
                undefined,
                undefined,
                undefined,
                syncStatusData,
            )
            return renderColumn(columns[IN_USE_BY_AI_COLUMN_INDEX], item)
        }

        it('should show check icon for Guidance with publishedVersionId and PUBLIC visibility', () => {
            const item = createMockItem({
                type: KnowledgeType.Guidance,
                inUseByAI: KnowledgeVisibility.PUBLIC,
                publishedVersionId: 1,
            })

            renderInUseByAICell(item)
            expect(
                screen.getByRole('img', { name: 'check' }),
            ).toBeInTheDocument()
        })

        it('should show close icon for Guidance with no publishedVersionId even with PUBLIC visibility', () => {
            const item = createMockItem({
                type: KnowledgeType.Guidance,
                inUseByAI: KnowledgeVisibility.PUBLIC,
                publishedVersionId: null,
            })

            renderInUseByAICell(item)
            expect(
                screen.getByRole('img', { name: 'close' }),
            ).toBeInTheDocument()
        })

        it('should show close icon for Guidance with publishedVersionId but UNLISTED visibility', () => {
            const item = createMockItem({
                type: KnowledgeType.Guidance,
                inUseByAI: KnowledgeVisibility.UNLISTED,
                publishedVersionId: 1,
            })

            renderInUseByAICell(item)
            expect(
                screen.getByRole('img', { name: 'close' }),
            ).toBeInTheDocument()
        })

        it('should show loader for syncing grouped URL', () => {
            const item = createMockItem({
                type: KnowledgeType.URL,
                isGrouped: true,
                source: 'https://syncing.com',
            })

            renderInUseByAICell(item, {
                syncingUrls: ['https://syncing.com'],
                domainSyncStatus: undefined,
                failedUrls: [],
            })

            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })

        it('should show loader for syncing grouped Domain', () => {
            const item = createMockItem({
                type: KnowledgeType.Domain,
                isGrouped: true,
            })

            renderInUseByAICell(item, {
                syncingUrls: [],
                domainSyncStatus: 'PENDING',
                failedUrls: [],
            })

            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })

        it('should show warning for failed grouped URL', () => {
            const item = createMockItem({
                type: KnowledgeType.URL,
                isGrouped: true,
                source: 'https://failed.com',
                itemCount: 2,
            })

            renderInUseByAICell(item, {
                syncingUrls: [],
                domainSyncStatus: undefined,
                failedUrls: ['https://failed.com'],
            })

            expect(
                screen.getByRole('img', { name: 'warning-triangle' }),
            ).toBeInTheDocument()
        })

        it('should show warning for failed grouped Domain', () => {
            const item = createMockItem({
                type: KnowledgeType.Domain,
                isGrouped: true,
                itemCount: 1,
            })

            renderInUseByAICell(item, {
                syncingUrls: [],
                domainSyncStatus: 'FAILED',
                failedUrls: [],
            })

            expect(
                screen.getByRole('img', { name: 'warning-triangle' }),
            ).toBeInTheDocument()
        })

        it('should show "--" for grouped items that are neither syncing nor failed', () => {
            const item = createMockItem({
                type: KnowledgeType.URL,
                isGrouped: true,
                source: 'https://normal.com',
            })

            renderInUseByAICell(item, {
                syncingUrls: [],
                domainSyncStatus: undefined,
                failedUrls: [],
            })

            expect(screen.getByText('--')).toBeInTheDocument()
        })
    })
})
