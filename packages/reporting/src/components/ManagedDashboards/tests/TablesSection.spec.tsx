import { createContext, useContext, useState } from 'react'

import { render } from '@repo/testing/vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as Axiom from '@gorgias/axiom'

import { useSaveSelectedTable } from '../hooks/useSaveSelectedTable'
import { TablesSection } from '../TablesSection'
import type {
    DashboardComponentType,
    LayoutItem,
    LayoutReportConfig,
    LayoutSection,
} from '../types'
import { ChartType } from '../types'

vi.mock('../hooks/useSaveSelectedTable', () => ({
    useSaveSelectedTable: vi.fn(() => ({
        onSelect: (chartId: string) => saveSelectedTableImpl(chartId),
    })),
}))

const DashboardComponentMock: DashboardComponentType<string> = ({
    chart,
    withChartMenu,
}) => (
    <div>
        DashboardComponent: {chart}
        {withChartMenu !== undefined && (
            <span>withChartMenu:{String(withChartMenu)}</span>
        )}
    </div>
)

const mockUseSaveSelectedTable = vi.mocked(useSaveSelectedTable)
const mockSaveSelectedTable = vi.fn()
let saveSelectedTableImpl = (chartId: string) => {
    mockSaveSelectedTable(chartId)
}

const ButtonGroupContext = createContext<{
    selectedKey: string | undefined
    onSelectionChange: (key: string) => void
}>({ selectedKey: undefined, onSelectionChange: () => {} })

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = (await importOriginal()) as typeof Axiom
    return {
        ...actual,
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
    }
})

const ARTICLE_RECOMMENDATION_TABLE_CHART_ID = 'article_recommendation_table'

const reportConfigMock: LayoutReportConfig = {
    charts: {
        table1: { label: 'Table One' },
        table2: { label: 'Table Two' },
        table3: { label: 'Table Three' },
        [ARTICLE_RECOMMENDATION_TABLE_CHART_ID]: {
            label: 'Article Recommendation',
        },
    },
}

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
        chartId,
        gridSize: 12,
        visibility: visibility ?? true,
        ...(requiresFeatureFlag !== undefined && { requiresFeatureFlag }),
    })),
})

const ControlledTablesSection = ({
    initialSection,
    onTabChange,
    enableTablesPersistence,
}: {
    initialSection: LayoutSection
    onTabChange?: (key: string) => void
    enableTablesPersistence?: boolean
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
            DashboardComponent={DashboardComponentMock}
            enableTablesPersistence={enableTablesPersistence}
        />
    )
}

describe('TablesSection', () => {
    beforeEach(() => {
        mockSaveSelectedTable.mockClear()
        saveSelectedTableImpl = (chartId: string) => {
            mockSaveSelectedTable(chartId)
        }
        mockUseSaveSelectedTable.mockReturnValue({
            onSelect: (chartId: string) => saveSelectedTableImpl(chartId),
        })
    })

    describe('title', () => {
        it('should render tableTitle when provided', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }], 'My Tables')}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(screen.getByText('My Tables')).toBeInTheDocument()
        })

        it('should not render a title when tableTitle is not provided', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
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
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', visibility: false },
                        { chartId: 'table2', visibility: true },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                    enableTablesPersistence
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
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', visibility: false },
                        { chartId: 'table2', visibility: true },
                        { chartId: 'table3', visibility: false },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                    enableTablesPersistence
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
                    DashboardComponent={DashboardComponentMock}
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

        it('should switch to the selected table locally when persistence is off', async () => {
            const user = userEvent.setup()

            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
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

        it('should save the selected table when persistence is on', async () => {
            const user = userEvent.setup()

            render(
                <ControlledTablesSection
                    initialSection={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2' },
                    ])}
                    enableTablesPersistence
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
            const onTabChange = vi.fn()

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
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
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
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
        })

        it('should hide tables with requiresFeatureFlag when enableTablesPersistence is off', () => {
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', requiresFeatureFlag: true },
                        { chartId: 'table2', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(
                screen.queryByText('DashboardComponent: table1'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('DashboardComponent: table2'),
            ).not.toBeInTheDocument()
        })

        it('should show tables with requiresFeatureFlag when enableTablesPersistence is on', () => {
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                    enableTablesPersistence
                />,
            )

            expect(
                screen.getByText('DashboardComponent: table1'),
            ).toBeInTheDocument()
        })

        it('should show only non-flagged tables when the flag is off and some tables are flagged', () => {
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
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
            render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1' },
                        { chartId: 'table2', requiresFeatureFlag: true },
                        { chartId: 'table3', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
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
            const { container } = render(
                <TablesSection
                    section={makeSection([
                        { chartId: 'table1', requiresFeatureFlag: true },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('isItemVisible predicate', () => {
        const hideArticleRecommendation = (item: LayoutItem<string>) =>
            item.chartId !== ARTICLE_RECOMMENDATION_TABLE_CHART_ID

        it('should render an item when isItemVisible returns true for it', () => {
            render(
                <TablesSection
                    section={makeSection([
                        {
                            chartId: ARTICLE_RECOMMENDATION_TABLE_CHART_ID,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                    enableTablesPersistence
                    isItemVisible={() => true}
                />,
            )

            expect(
                screen.getByText(
                    `DashboardComponent: ${ARTICLE_RECOMMENDATION_TABLE_CHART_ID}`,
                ),
            ).toBeInTheDocument()
        })

        it('should hide an item when isItemVisible returns false for it', () => {
            const { container } = render(
                <TablesSection
                    section={makeSection([
                        {
                            chartId: ARTICLE_RECOMMENDATION_TABLE_CHART_ID,
                            requiresFeatureFlag: true,
                        },
                    ])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                    enableTablesPersistence
                    isItemVisible={hideArticleRecommendation}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should hide a tab for an item that isItemVisible filters out while keeping the rest', () => {
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
                    DashboardComponent={DashboardComponentMock}
                    isItemVisible={hideArticleRecommendation}
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

    describe('enableCustomDashboards prop', () => {
        it('passes withChartMenu=true to DashboardComponent when enabled', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                    enableCustomDashboards
                />,
            )

            expect(screen.getByText('withChartMenu:true')).toBeInTheDocument()
        })

        it('passes withChartMenu=false to DashboardComponent when disabled', () => {
            render(
                <TablesSection
                    section={makeSection([{ chartId: 'table1' }])}
                    reportConfig={reportConfigMock}
                    DashboardComponent={DashboardComponentMock}
                />,
            )

            expect(screen.getByText('withChartMenu:false')).toBeInTheDocument()
        })
    })
})
