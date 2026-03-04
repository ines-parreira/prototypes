import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    JourneyCampaignsFilter,
    JourneyCampaignsFilterFromContext,
} from 'domains/reporting/pages/common/filters/JourneyCampaignsFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
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

const CAMPAIGNS_FILTER_NAME = FilterLabels[FilterKey.JourneyCampaigns]

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

    it('should render filter with label', () => {
        renderComponent()

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should show "All Campaigns" when all campaigns are selected', () => {
        renderComponent()

        expect(screen.getByText('All Campaigns')).toBeInTheDocument()
    })

    it('should render available campaign options when dropdown is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All Campaigns'))

        expect(
            screen.getByRole('option', { name: 'Summer Sale' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Winter Promo' }),
        ).toBeInTheDocument()
    })

    it('should dispatch update when deselecting a campaign', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All Campaigns'))
        await user.click(screen.getByRole('option', { name: 'Summer Sale' }))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['campaign-2'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update when selecting a campaign', async () => {
        const user = userEvent.setup()
        renderComponent(withLogicalOperator(['campaign-1']))

        await user.click(screen.getByText('Summer Sale'))
        await user.click(screen.getByRole('option', { name: 'Winter Promo' }))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['campaign-1', 'campaign-2'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update on select all', async () => {
        const user = userEvent.setup()
        renderComponent(withLogicalOperator([]))

        await user.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await user.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['campaign-1', 'campaign-2'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update on deselect all', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All Campaigns'))
        await user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
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

        await user.click(screen.getByText('All Campaigns'))

        expect(
            screen.getByRole('option', { name: 'Untitled' }),
        ).toBeInTheDocument()
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

            expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()

            await user.click(screen.getByText('All Campaigns'))
            await user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

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

            await user.click(screen.getByText('All Campaigns'))

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
