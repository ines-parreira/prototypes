import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { TablesSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/TablesSection'
import type {
    AnalyticsChartType,
    LayoutSection,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { AiAgentAnalyticsDashboardsTables: 'tables-flag' },
    useFlag: jest.fn(),
}))

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: { chart: string }) => (
        <div>DashboardComponent: {chart}</div>
    ),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const { createContext, useContext } =
    jest.requireActual<typeof import('react')>('react')

const ButtonGroupContext = createContext<{
    selectedKey: string | undefined
    onSelectionChange: (key: string) => void
}>({ selectedKey: undefined, onSelectionChange: () => {} })

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    ButtonGroup: ({
        children,
        selectedKey,
        onSelectionChange,
    }: {
        children: React.ReactNode
        selectedKey?: string
        onSelectionChange?: (key: string) => void
    }) => (
        <ButtonGroupContext.Provider
            value={{
                selectedKey,
                onSelectionChange: onSelectionChange ?? (() => {}),
            }}
        >
            <div role="group">{children}</div>
        </ButtonGroupContext.Provider>
    ),
    ButtonGroupItem: ({
        children,
        id,
    }: {
        children: React.ReactNode
        id?: string
    }) => {
        const { selectedKey, onSelectionChange } =
            useContext(ButtonGroupContext)
        return (
            <button
                role="radio"
                aria-checked={id === selectedKey}
                onClick={() => id && onSelectionChange(id)}
            >
                {children}
            </button>
        )
    },
}))

const reportConfigMock = {
    charts: {
        table1: { chartComponent: () => null, label: 'Table One' },
        table2: { chartComponent: () => null, label: 'Table Two' },
        table3: { chartComponent: () => null, label: 'Table Three' },
    },
} as any

const makeSection = (
    items: Array<{ chartId: string; requiresFeatureFlag?: boolean }>,
    tableTitle?: string,
): LayoutSection => ({
    id: 'tables',
    type: ChartType.Table,
    tableTitle,
    items: items.map(({ chartId, requiresFeatureFlag }) => ({
        chartId: chartId as AnalyticsChartType,
        gridSize: 12,
        visibility: true,
        ...(requiresFeatureFlag !== undefined && { requiresFeatureFlag }),
    })),
})

describe('TablesSection', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })
    describe('title', () => {
        it('should render tableTitle when provided', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }], 'My Tables')}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(screen.getByText('My Tables')).toBeInTheDocument()
        })

        it('should not render a title when tableTitle is not provided', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(screen.queryByText('My Tables')).not.toBeInTheDocument()
        })
    })

    describe('single table', () => {
        it('should not render ButtonGroup when there is only one table', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.queryByRole('button', { name: 'Table One' }),
            ).not.toBeInTheDocument()
        })

        it('should render the single table', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
        })
    })

    describe('multiple tables', () => {
        it('should render ButtonGroup with a button per table', () => {
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByRole('radio', { name: 'Table One' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Table Two' }),
            ).toBeInTheDocument()
        })

        it('should render the first table by default', () => {
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table2'),
            ).not.toBeInTheDocument()
        })

        it('should switch to the selected table when a button is clicked', async () => {
            const user = userEvent.setup()

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            await user.click(screen.getByRole('radio', { name: 'Table Two' }))

            expect(
                screen.queryByText('DashboardComponent: table1'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('DashboardComponent: table2'),
            ).toBeInTheDocument()
        })

        it('should call onTabChange with the selected chartId when switching tabs', async () => {
            const user = userEvent.setup()
            const onTabChange = jest.fn()

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    reportConfig={reportConfigMock}
                    onTabChange={onTabChange}
                />,
            )

            await user.click(screen.getByRole('radio', { name: 'Table Two' }))

            expect(onTabChange).toHaveBeenCalledWith('table2')
            expect(onTabChange).toHaveBeenCalledTimes(1)
        })

        it('should not throw when onTabChange is not provided', async () => {
            const user = userEvent.setup()

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            await expect(
                user.click(screen.getByRole('radio', { name: 'Table Two' })),
            ).resolves.not.toThrow()
        })

        it('should only mount one DashboardComponent at a time', async () => {
            const user = userEvent.setup()

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                        { chartId: 'table3' },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table2'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table3'),
            ).not.toBeInTheDocument()

            await user.click(screen.getByRole('radio', { name: 'Table Two' }))

            expect(
                screen.queryByText('DashboardComponent: table1'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('DashboardComponent: table2'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table3'),
            ).not.toBeInTheDocument()
        })

        it('should render all button labels from reportConfig', () => {
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                        { chartId: 'table3' },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByRole('radio', { name: 'Table One' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Table Two' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: 'Table Three' }),
            ).toBeInTheDocument()
        })
    })

    describe('feature flag filtering', () => {
        it('should always render tables without requiresFeatureFlag regardless of flag value', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
        })

        it('should hide tables with requiresFeatureFlag when the flag is off', () => {
            mockUseFlag.mockReturnValue(false)

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', requiresFeatureFlag: true },
                        { chartId: 'table2', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.queryByText('DashboardComponent: table1'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table2'),
            ).not.toBeInTheDocument()
        })

        it('should show tables with requiresFeatureFlag when the flag is on', () => {
            mockUseFlag.mockReturnValue(true)

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
        })

        it('should show only non-flagged tables when the flag is off and some tables are flagged', () => {
            mockUseFlag.mockReturnValue(false)

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table2'),
            ).not.toBeInTheDocument()
        })

        it('should render nothing when all tables require the flag and it is off', () => {
            mockUseFlag.mockReturnValue(false)

            const { container } = render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })
})
