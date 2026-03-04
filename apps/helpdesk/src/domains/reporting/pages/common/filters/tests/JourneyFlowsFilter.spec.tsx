import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyTypeEnum } from '@gorgias/convert-client'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    JourneyFlowsFilter,
    JourneyFlowsFilterFromContext,
} from 'domains/reporting/pages/common/filters/JourneyFlowsFilter'
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

const FLOWS_FILTER_NAME = FilterLabels[FilterKey.JourneyFlows]

const mockJourneys: JourneyApiDTO[] = [
    {
        id: 'flow-1',
        type: JourneyTypeEnum.CartAbandoned,
        account_id: 1,
        created_datetime: '2025-01-01',
        state: 'active',
        store_integration_id: 1,
        store_name: 'test',
        store_type: 'shopify',
    },
    {
        id: 'flow-2',
        type: JourneyTypeEnum.PostPurchase,
        account_id: 1,
        created_datetime: '2025-01-01',
        state: 'active',
        store_integration_id: 1,
        store_name: 'test',
        store_type: 'shopify',
    },
]

const defaultState = {
    stats: statsSlice.initialState,
} as RootState

describe('JourneyFlowsFilter', () => {
    const dispatchUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (
        value = withLogicalOperator(mockJourneys.map((j) => j.id)),
    ) =>
        renderWithStore(
            <JourneyFlowsFilter
                value={value}
                journeys={mockJourneys}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

    it('should render filter with label', () => {
        renderComponent()

        expect(screen.getByText(FLOWS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should show "All Flows" when all flows are selected', () => {
        renderComponent()

        expect(screen.getByText('All Flows')).toBeInTheDocument()
    })

    it('should render available flow options when dropdown is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All Flows'))

        expect(
            screen.getByRole('option', {
                name: JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.CartAbandoned],
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', {
                name: JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.PostPurchase],
            }),
        ).toBeInTheDocument()
    })

    it('should dispatch update when deselecting a flow', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All Flows'))
        await user.click(
            screen.getByRole('option', {
                name: JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.CartAbandoned],
            }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['flow-2'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update when selecting a flow', async () => {
        const user = userEvent.setup()
        renderComponent(withLogicalOperator(['flow-1']))

        await user.click(
            screen.getByText(
                JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.CartAbandoned],
            ),
        )
        await user.click(
            screen.getByRole('option', {
                name: JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.PostPurchase],
            }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['flow-1', 'flow-2'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update on select all', async () => {
        const user = userEvent.setup()
        renderComponent(withLogicalOperator([]))

        await user.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await user.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['flow-1', 'flow-2'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update on deselect all', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All Flows'))
        await user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should default to all selected when value is undefined', () => {
        renderWithStore(
            <JourneyFlowsFilter
                value={undefined}
                journeys={mockJourneys}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        expect(screen.getByText('All Flows')).toBeInTheDocument()
    })

    describe('JourneyFlowsFilterFromContext', () => {
        it('should render and dispatch via Redux', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                journeys: mockJourneys,
            })

            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<JourneyFlowsFilterFromContext />, defaultState)

            expect(screen.getByText(FLOWS_FILTER_NAME)).toBeInTheDocument()

            await user.click(screen.getByText('All Flows'))
            await user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

            expect(spy).toHaveBeenCalledWith({
                journeyFlows: {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        })

        it('should return null when no journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                journeys: [],
            })

            const { container } = renderWithStore(
                <JourneyFlowsFilterFromContext />,
                defaultState,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should return null when journeys is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                journeys: undefined,
            })

            const { container } = renderWithStore(
                <JourneyFlowsFilterFromContext />,
                defaultState,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })
})
