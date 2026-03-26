import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    JourneyCampaignsFilter,
    JourneyCampaignsFilterFromContext,
} from 'domains/reporting/pages/common/filters/JourneyCampaignsFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockCampaigns: JourneyApiDTO[] = [
    {
        id: 'campaign-1',
        type: JourneyTypeEnum.Campaign,
        account_id: 1,
        created_datetime: '2025-01-01',
        state: 'active',
        store_integration_id: 1,
        store_name: 'test',
        store_type: 'shopify',
        campaign: {
            title: 'Summer Sale',
            state: 'active',
        },
    },
    {
        id: 'campaign-2',
        type: JourneyTypeEnum.Campaign,
        account_id: 1,
        created_datetime: '2025-01-02',
        state: 'active',
        store_integration_id: 1,
        store_name: 'test',
        store_type: 'shopify',
        campaign: {
            title: 'Winter Promo',
            state: 'active',
        },
    },
]

const draftCampaign: JourneyApiDTO = {
    id: 'campaign-draft',
    type: JourneyTypeEnum.Campaign,
    account_id: 1,
    created_datetime: '2025-01-03',
    state: 'draft',
    store_integration_id: 1,
    store_name: 'test',
    store_type: 'shopify',
    campaign: {
        title: 'Draft Campaign',
        state: 'draft',
    },
}

const defaultState = {
    stats: statsSlice.initialState,
} as RootState

describe('JourneyCampaignsFilter', () => {
    const dispatchUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (
        value = withLogicalOperator(mockCampaigns.map((c) => c.id)),
        campaigns = mockCampaigns,
    ) =>
        renderWithStore(
            <JourneyCampaignsFilter
                value={value}
                campaigns={campaigns}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

    describe('trigger label', () => {
        it('should render "Campaigns" as the filter label', () => {
            renderComponent()

            expect(screen.getByText('Campaigns')).toBeInTheDocument()
        })

        it('should show "All Campaigns" preview when all campaigns are selected', () => {
            renderComponent()

            expect(screen.getByText('All Campaigns')).toBeInTheDocument()
        })

        it('should show "Select value..." preview when no campaigns are selected', () => {
            renderComponent(withLogicalOperator([]))

            expect(screen.getByText('Select value...')).toBeInTheDocument()
        })

        it('should show campaign name as preview when only one campaign is selected', () => {
            renderComponent(withLogicalOperator(['campaign-1']))

            expect(
                screen.getByRole('button', { name: /Summer Sale/ }),
            ).toBeInTheDocument()
        })

        it('should show "+N" format as preview when multiple but not all campaigns are selected', () => {
            const threeCampaigns: JourneyApiDTO[] = [
                ...mockCampaigns,
                {
                    id: 'campaign-3',
                    type: JourneyTypeEnum.Campaign,
                    account_id: 1,
                    created_datetime: '2025-01-03',
                    state: 'active',
                    store_integration_id: 1,
                    store_name: 'test',
                    store_type: 'shopify',
                    campaign: { title: 'Spring Drop', state: 'active' },
                },
            ]

            renderComponent(
                withLogicalOperator(['campaign-1', 'campaign-2']),
                threeCampaigns,
            )

            expect(screen.getByText('Summer Sale +1')).toBeInTheDocument()
        })

        it('should default to all selected when value is undefined', () => {
            renderWithStore(
                <JourneyCampaignsFilter
                    value={undefined}
                    campaigns={mockCampaigns}
                    dispatchUpdate={dispatchUpdate}
                />,
                defaultState,
            )

            expect(screen.getByText('All Campaigns')).toBeInTheDocument()
        })
    })

    describe('dropdown options', () => {
        it('should render available campaign options when dropdown is opened', async () => {
            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(screen.getByText('All Campaigns'))
            })

            expect(
                screen.getByRole('option', { name: 'Summer Sale' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Winter Promo' }),
            ).toBeInTheDocument()
        })

        it('should show "Deselect all" toggle when all campaigns are selected', async () => {
            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(screen.getByText('All Campaigns'))
            })

            expect(
                screen.getByRole('option', { name: /Deselect all/ }),
            ).toBeInTheDocument()
        })

        it('should show "Select all" toggle when not all campaigns are selected', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator(['campaign-1']))
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /Summer Sale/ }),
                )
            })

            expect(
                screen.getByRole('option', { name: /Select all/ }),
            ).toBeInTheDocument()
        })

        it('should use "Untitled" for campaigns without a title', async () => {
            const user = userEvent.setup()
            const untitledCampaign: JourneyApiDTO = {
                id: 'campaign-untitled',
                type: JourneyTypeEnum.Campaign,
                account_id: 1,
                created_datetime: '2025-01-01',
                state: 'active',
                store_integration_id: 1,
                store_name: 'test',
                store_type: 'shopify',
            }

            renderWithStore(
                <JourneyCampaignsFilter
                    value={withLogicalOperator([untitledCampaign.id])}
                    campaigns={[untitledCampaign]}
                    dispatchUpdate={dispatchUpdate}
                />,
                defaultState,
            )
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /All Campaigns/ }),
                )
            })

            expect(
                screen.getByRole('option', { name: 'Untitled' }),
            ).toBeInTheDocument()
        })
    })

    describe('selection changes', () => {
        it('should dispatch update when deselecting a campaign', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All Campaigns'))
                await user.click(
                    screen.getByRole('option', { name: 'Summer Sale' }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['campaign-2'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update when selecting a campaign', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator(['campaign-1']))

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /Summer Sale/ }),
                )
                await user.click(
                    screen.getByRole('option', { name: 'Winter Promo' }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['campaign-1', 'campaign-2'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update with all IDs when clicking "Select all"', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator([]))

            await act(async () => {
                await user.click(screen.getByText('Select value...'))
                await user.click(
                    screen.getByRole('option', { name: /Select all/ }),
                )
            })
            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['campaign-1', 'campaign-2'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update with empty array when clicking "Deselect all"', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All Campaigns'))
                await user.click(
                    screen.getByRole('option', { name: /Deselect all/ }),
                )
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: [],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })
    })

    describe('JourneyCampaignsFilterFromContext', () => {
        it('should render and dispatch via Redux', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                campaigns: mockCampaigns,
            })

            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<JourneyCampaignsFilterFromContext />, defaultState)

            expect(screen.getByText('Campaigns')).toBeInTheDocument()

            await act(async () => {
                await user.click(screen.getByText('All Campaigns'))
                await user.click(
                    screen.getByRole('option', { name: /Deselect all/ }),
                )
            })

            expect(spy).toHaveBeenCalledWith({
                journeyCampaigns: {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        })

        it('should exclude draft campaigns', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                campaigns: [...mockCampaigns, draftCampaign],
            })

            renderWithStore(<JourneyCampaignsFilterFromContext />, defaultState)

            await act(async () => {
                await user.click(screen.getByText('All Campaigns'))
            })

            expect(
                screen.getByRole('option', { name: 'Summer Sale' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Winter Promo' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('option', { name: 'Draft Campaign' }),
            ).not.toBeInTheDocument()
        })

        it('should return null when no non-draft campaigns exist', () => {
            mockUseJourneyContext.mockReturnValue({
                campaigns: [draftCampaign],
            })

            const { container } = renderWithStore(
                <JourneyCampaignsFilterFromContext />,
                defaultState,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should return null when campaigns is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                campaigns: undefined,
            })

            const { container } = renderWithStore(
                <JourneyCampaignsFilterFromContext />,
                defaultState,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })
})
