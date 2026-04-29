import { useState } from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSaveSelectedTable } from 'domains/reporting/hooks/managed-dashboards/useSaveSelectedTable'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { TablesSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/TablesSection'
import type {
    AnalyticsChartType,
    LayoutSection,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { AiAgentAnalyticsDashboardsTables: 'tables-flag' },
    useFlagWithLoading: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveSelectedTable',
    () => ({
        useSaveSelectedTable: jest.fn(() => ({
            onSelect: (chartId: string) => saveSelectedTableImpl(chartId),
        })),
    }),
)

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: { chart: string }) => (
        <div>DashboardComponent: {chart}</div>
    ),
}))

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockUseSaveSelectedTable = assumeMock(useSaveSelectedTable)
const mockUseIsArticleRecommendationsEnabledWhileSunset = assumeMock(
    useIsArticleRecommendationsEnabledWhileSunset,
)
const mockSaveSelectedTable = jest.fn()
let saveSelectedTableImpl = (chartId: string) => {
    mockSaveSelectedTable(chartId)
}

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
                onClick={() =>
                    id &&
                    act(() => {
                        onSelectionChange(id)
                    })
                }
            >
                {children}
            </button>
        )
    },
}))

const ARTICLE_RECOMMENDATION_TABLE_CHART_ID = 'article_recommendation_table'

const reportConfigMock = {
    charts: {
        table1: { chartComponent: () => null, label: 'Table One' },
        table2: { chartComponent: () => null, label: 'Table Two' },
        table3: { chartComponent: () => null, label: 'Table Three' },
        [ARTICLE_RECOMMENDATION_TABLE_CHART_ID]: {
            chartComponent: () => null,
            label: 'Article Recommendation',
        },
    },
} as any

const makeSection = (
    items: Array<{
        chartId: string
        requiresFeatureFlag?: boolean
        visibility?: boolean
    }>,
    tableTitle?: string,
): LayoutSection => ({
    id: 'tables',
    type: ChartType.Table,
    tableTitle,
    items: items.map(({ chartId, requiresFeatureFlag, visibility }) => ({
        chartId: chartId as AnalyticsChartType,
        gridSize: 12,
        visibility: visibility ?? true,
        ...(requiresFeatureFlag !== undefined && { requiresFeatureFlag }),
    })),
})

const ControlledTablesSection = ({
    initialSection,
    onTabChange,
}: {
    initialSection: LayoutSection
    onTabChange?: (key: ManagedDashboardsTabId) => void
}) => {
    const [section, setSection] = useState(initialSection)

    saveSelectedTableImpl = (chartId: string) => {
        mockSaveSelectedTable(chartId)
        setSection((currentSection) => ({
            ...currentSection,
            items: currentSection.items.map((item) => ({
                ...item,
                visibility: item.chartId === chartId,
            })),
        }))
    }

    return (
        <TablesSection
            section={section}
            reportConfig={reportConfigMock}
            onTabChange={onTabChange}
        />
    )
}

describe('TablesSection', () => {
    beforeEach(() => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockSaveSelectedTable.mockClear()
        saveSelectedTableImpl = (chartId: string) => {
            mockSaveSelectedTable(chartId)
        }
        mockUseSaveSelectedTable.mockReturnValue({
            onSelect: (chartId: string) => saveSelectedTableImpl(chartId),
        })
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: true,
            enabledInSettings: true,
        })
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

            expect(screen.queryByRole('group')).not.toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: 'Table One' }),
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

        it('should render the saved visible table when present', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', visibility: false },
                        { chartId: 'table2', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.queryByText('DashboardComponent: table1'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('DashboardComponent: table2'),
            ).toBeInTheDocument()
        })

        it('should keep non-selected tables available in the tabs', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', visibility: false },
                        { chartId: 'table2', visibility: true },
                        { chartId: 'table3', visibility: false },
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
            expect(
                screen.getByText('DashboardComponent: table2'),
            ).toBeInTheDocument()
        })

        it('should fall back to the first eligible table when the saved visible table is hidden by feature flag', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            render(
                <TablesSection
                    section={makeSection([
                        {
                            chartId: 'table1',
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                        { chartId: 'table2', visibility: false },
                        { chartId: 'table3', visibility: false },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

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

        it('should switch to the selected table locally when the persistence feature flag is off', async () => {
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

            expect(mockSaveSelectedTable).not.toHaveBeenCalled()
            expect(
                screen.queryByText('DashboardComponent: table1'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('DashboardComponent: table2'),
            ).toBeInTheDocument()
        })

        it('should save the selected table when the persistence feature flag is on', async () => {
            const user = userEvent.setup()

            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            render(
                <ControlledTablesSection
                    initialSection={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                />,
            )

            await user.click(screen.getByRole('radio', { name: 'Table Two' }))

            expect(mockSaveSelectedTable).toHaveBeenCalledWith('table2')
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
                <ControlledTablesSection
                    initialSection={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
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
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

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
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

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
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

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

        it('should show only the non-flagged table when mixed and flag is off', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2', requiresFeatureFlag: true },
                        { chartId: 'table3', requiresFeatureFlag: true },
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
        })

        it('should render nothing when all tables require the flag and it is off', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

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

    describe('article recommendations sunset', () => {
        it('should show ArticleRecommendationTable when article recommendations are enabled in statistics', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInStatistics: true,
                enabledInSettings: true,
            })

            render(
                <TablesSection
                    section={makeSection([
                        {
                            chartId: ARTICLE_RECOMMENDATION_TABLE_CHART_ID,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.getByText(
                    `DashboardComponent: ${ARTICLE_RECOMMENDATION_TABLE_CHART_ID}`,
                ),
            ).toBeInTheDocument()
        })

        it('should hide ArticleRecommendationTable when article recommendations are disabled in statistics', () => {
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInStatistics: false,
                enabledInSettings: false,
            })

            const { container } = render(
                <TablesSection
                    section={makeSection([
                        {
                            chartId: ARTICLE_RECOMMENDATION_TABLE_CHART_ID,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should hide ArticleRecommendationTable tab when shown alongside other tables and article recommendations are disabled', () => {
            mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
                enabledInStatistics: false,
                enabledInSettings: false,
            })

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        {
                            chartId: ARTICLE_RECOMMENDATION_TABLE_CHART_ID,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                />,
            )

            expect(
                screen.queryByRole('radio', { name: 'Article Recommendation' }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
        })
    })
})
