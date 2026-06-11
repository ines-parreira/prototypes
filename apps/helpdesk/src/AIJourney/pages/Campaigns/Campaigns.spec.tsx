import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    DEFAULT_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { JourneyProvider } from 'AIJourney/providers'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { account } from 'fixtures/account'

import { FeatureFlagKey } from '@repo/feature-flags'

import { CampaignTemplatesList } from 'AIJourney/data/CampaignTemplatesData'

import { Campaigns } from './Campaigns'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
    useFlagWithLoading: jest.fn(),
}))

const mockUseFlagWithLoading = require('@repo/feature-flags')
    .useFlagWithLoading as jest.Mock

const setFlags = ({
    structured = false,
    v3 = false,
}: { structured?: boolean; v3?: boolean } = {}) => {
    mockUseFlagWithLoading.mockImplementation((flagKey: string) => {
        if (
            flagKey === FeatureFlagKey.AiJourneyStructuredMessageGuidanceEnabled
        ) {
            return { value: structured, isLoading: false }
        }
        if (flagKey === FeatureFlagKey.AiJourneyV3ArchitectureEnabled) {
            return { value: v3, isLoading: false }
        }
        return { value: false, isLoading: false }
    })
}

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
)

jest.mock('AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis')
const useAIJourneyTableKpisMock = assumeMock(useAIJourneyTableKpis)

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    FiltersPanelWrapper: () => <div data-testid="filters-panel-wrapper" />,
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<Campaigns />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
        integrations: fromJS({ integrations: [] }),
    })
    const cleanStatsFilters = {
        period: {
            start_datetime: '1970-01-01T00:00:00+00:00',
            end_datetime: '1970-01-01T00:00:00+00:00',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        setFlags()

        mockUseJourneyContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
                {
                    id: '2',
                    campaign: { title: 'Campaign 2', state: 'inactive' },
                },
            ],
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock.mockReturnValue(
            {
                userTimezone: 'someTimezone',
                cleanStatsFilters,
                granularity: ReportingGranularity.Day,
            },
        )

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {
                '1': {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 15567,
                },
            },
            isLoading: false,
        }))
    })

    it('should render the campaigns page', () => {
        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('heading', { name: /campaigns/i }),
        ).toBeInTheDocument()
    })

    it('should render the campaigns table with data', () => {
        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByText('Campaign 1')).toHaveLength(1)
        expect(screen.getAllByText('Campaign 2')).toHaveLength(1)
        expect(screen.getByText('Create campaign')).toBeInTheDocument()
        expect(screen.getByText('15,567')).toBeInTheDocument()
    })

    it('should render empty state when no campaigns', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [],
            isLoadingIntegrations: false,
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: true,
        }))

        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Create your first campaign'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Start reaching your customers today'),
        ).toBeInTheDocument()
    })

    it('should not fetch metrics when journeys are loading', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
            ],
            isLoadingJourneys: true,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: false,
        }))

        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should not fetch metrics when there are no campaigns', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [],
            isLoadingJourneys: false,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {},
            isLoading: false,
        }))

        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should fetch metrics when journeys are loaded and campaigns exist', () => {
        mockUseJourneyContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
                {
                    id: '2',
                    campaign: { title: 'Campaign 2', state: 'inactive' },
                },
            ],
            isLoadingJourneys: false,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        useAIJourneyTableKpisMock.mockImplementation(() => ({
            metrics: {
                '1': {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 100,
                },
                '2': {
                    ...DEFAULT_TABLE_METRICS,
                    recipients: 200,
                },
            },
            isLoading: false,
        }))

        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        expect(useAIJourneyTableKpisMock).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
                journeyIds: ['1', '2'],
            }),
        )
    })
    describe('configurable date columns', () => {
        beforeEach(() => {
            window.localStorage.removeItem('ai-journey-campaign-columns')
        })

        const renderPage = () =>
            render(
                <Provider store={mockStore}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </Provider>,
            )

        it('renders the date column headers by default', () => {
            renderPage()

            expect(
                screen.getByRole('columnheader', { name: /updated/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /scheduled/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /sent/i }),
            ).toBeInTheDocument()
        })

        it('opens the Edit columns side panel with renamed title and description', async () => {
            renderPage()

            const user = userEvent.setup()
            await act(() =>
                user.click(screen.getByRole('button', { name: /edit table/i })),
            )

            expect(screen.getByText('Edit columns')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Choose the columns you want to display and rearrange them as needed.',
                ),
            ).toBeInTheDocument()
        })

        it('hides a date column when toggled off in the side panel', async () => {
            renderPage()

            const user = userEvent.setup()
            await act(() =>
                user.click(screen.getByRole('button', { name: /edit table/i })),
            )

            const updatedRow = screen
                .getAllByRole('row')
                .find((row) => row.textContent?.includes('Updated'))
            expect(updatedRow).toBeDefined()
            const toggle = updatedRow!.querySelector('[role="switch"]')
            expect(toggle).toBeInTheDocument()

            await act(() => user.click(toggle as HTMLElement))
            await act(() =>
                user.click(screen.getByRole('button', { name: /save/i })),
            )

            expect(
                screen.queryByRole('columnheader', { name: /updated/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /scheduled/i }),
            ).toBeInTheDocument()
        })

        it('migrates a saved localStorage config missing the date entries by inserting them before the first saved sibling', () => {
            window.localStorage.setItem(
                'ai-journey-campaign-columns',
                JSON.stringify([
                    { id: 'recipients', label: 'Recipients', visibility: true },
                    { id: 'revenue', label: 'Revenue', visibility: true },
                    { id: 'ctr', label: 'CTR', visibility: true },
                    { id: 'replyRate', label: 'Reply rate', visibility: true },
                ]),
            )

            renderPage()

            const headerTexts = screen
                .getAllByRole('columnheader')
                .map((header) => header.textContent ?? '')

            const positionOf = (label: string) =>
                headerTexts.findIndex((text) => text.includes(label))

            expect(positionOf('Status')).toBeGreaterThan(-1)
            expect(positionOf('Updated')).toBeGreaterThan(positionOf('Status'))
            expect(positionOf('Scheduled')).toBeGreaterThan(
                positionOf('Updated'),
            )
            expect(positionOf('Sent')).toBeGreaterThan(positionOf('Scheduled'))
            expect(positionOf('Recipients')).toBeGreaterThan(positionOf('Sent'))
        })

        it('preserves saved KPI ordering when inserting missing date defaults', () => {
            window.localStorage.setItem(
                'ai-journey-campaign-columns',
                JSON.stringify([
                    { id: 'ctr', label: 'CTR', visibility: true },
                    { id: 'recipients', label: 'Recipients', visibility: true },
                    { id: 'revenue', label: 'Revenue', visibility: true },
                ]),
            )

            renderPage()

            const headerTexts = screen
                .getAllByRole('columnheader')
                .map((header) => header.textContent ?? '')

            const positionOf = (label: string) =>
                headerTexts.findIndex((text) => text.includes(label))

            expect(positionOf('CTR')).toBeLessThan(positionOf('Updated'))
            expect(positionOf('Updated')).toBeLessThan(positionOf('Scheduled'))
            expect(positionOf('Scheduled')).toBeLessThan(positionOf('Sent'))
            expect(positionOf('Sent')).toBeLessThan(positionOf('Recipients'))
            expect(positionOf('Recipients')).toBeLessThan(positionOf('Revenue'))
        })
    })

    it('should navigate to campaign setup page when clicking on Create campaign', async () => {
        mockUseJourneyContext.mockReturnValue({
            shopName: 'test-shop',
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
                {
                    id: '2',
                    campaign: { title: 'Campaign 2', state: 'inactive' },
                },
            ],
            isLoadingJourneys: false,
            isLoadingIntegrations: false,
            currentIntegration: { id: 1, name: 'Test Integration' },
        })

        render(
            <Provider store={mockStore}>
                <JourneyProvider>
                    <Campaigns />
                </JourneyProvider>
            </Provider>,
        )

        const user = userEvent.setup()
        const createCampaignButton = screen.getByText('Create campaign')
        await act(() => user.click(createCampaignButton))

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/test-shop/campaign/setup',
        )
    })

    describe('template picker (FF on + V3)', () => {
        beforeEach(() => {
            setFlags({ structured: true, v3: true })
            mockUseJourneyContext.mockReturnValue({
                shopName: 'test-shop',
                campaigns: [
                    {
                        id: '1',
                        campaign: { title: 'Campaign 1', state: 'active' },
                    },
                ],
                isLoadingJourneys: false,
                isLoadingIntegrations: false,
                currentIntegration: { id: 1, name: 'Test Integration' },
            })
        })

        const renderCampaigns = () =>
            render(
                <Provider store={mockStore}>
                    <JourneyProvider>
                        <Campaigns />
                    </JourneyProvider>
                </Provider>,
            )

        it('opens a dropdown with From scratch / From template options', async () => {
            const user = userEvent.setup()
            renderCampaigns()

            await act(() => user.click(screen.getByText('Create campaign')))

            expect(
                screen.getByRole('menuitem', { name: 'From scratch' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: 'From template' }),
            ).toBeInTheDocument()
        })

        it('navigates without prefill when From scratch is selected', async () => {
            const user = userEvent.setup()
            renderCampaigns()

            await act(() => user.click(screen.getByText('Create campaign')))
            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: 'From scratch' }),
                ),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaign/setup',
            )
        })

        it('opens the picker modal when From template is selected', async () => {
            const user = userEvent.setup()
            renderCampaigns()

            await act(() => user.click(screen.getByText('Create campaign')))
            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: 'From template' }),
                ),
            )

            expect(
                screen.getByRole('heading', { name: 'Templates' }),
            ).toBeInTheDocument()
        })

        it('navigates with prefill (content + title) when a template card is clicked', async () => {
            const user = userEvent.setup()
            renderCampaigns()

            await act(() => user.click(screen.getByText('Create campaign')))
            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: 'From template' }),
                ),
            )

            const target = CampaignTemplatesList[0]
            await act(() => user.click(screen.getByText(target.name)))

            expect(mockHistoryPush).toHaveBeenCalledWith({
                pathname: '/app/ai-journey/test-shop/campaign/setup',
                state: {
                    initialMessageInstructions: target.content,
                    initialCampaignTitle: target.name,
                },
            })
        })

        it('falls back to the simple button when V3 architecture is off', async () => {
            setFlags({ structured: true, v3: false })
            const user = userEvent.setup()
            renderCampaigns()

            await act(() => user.click(screen.getByText('Create campaign')))

            expect(
                screen.queryByRole('menuitem', { name: 'From scratch' }),
            ).not.toBeInTheDocument()
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaign/setup',
            )
        })
    })
})
