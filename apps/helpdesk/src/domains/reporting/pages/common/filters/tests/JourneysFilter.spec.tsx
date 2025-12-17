import { fireEvent, screen } from '@testing-library/react'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import { emptyFilter } from 'domains/reporting/pages/common/filters/helpers'
import {
    JOURNEY_TYPE_FILTER_VALUES,
    JourneysFilterWithState,
    JourneyTypeFilter,
} from 'domains/reporting/pages/common/filters/JourneyTypeFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const JOURNEYS_FILTER_NAME = FilterLabels[FilterKey.JourneyType]

const defaultState = {
    stats: statsSlice.initialState,
} as RootState

describe('JourneysFilter', () => {
    const dispatchUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (value = emptyFilter as any) =>
        renderWithStore(
            <JourneyTypeFilter value={value} dispatchUpdate={dispatchUpdate} />,
            defaultState,
        )

    it('should render available journey options when dropdown is opened', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByRole('option', { name: 'Campaigns' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Flows' }),
        ).toBeInTheDocument()
    })

    it('should dispatch update action when selecting a journey option', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText('Campaigns'))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN],
            operator: emptyFilter.operator,
        })
    })

    it('should dispatch update action when deselecting a journey option', () => {
        const selectedValue = {
            values: [
                JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN,
                JOURNEY_TYPE_FILTER_VALUES.FLOW,
            ],
            operator: emptyFilter.operator,
        }
        renderComponent(selectedValue)

        fireEvent.click(screen.getByText('Campaigns, Flows'))
        fireEvent.click(screen.getByRole('option', { name: 'Campaigns' }))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [JOURNEY_TYPE_FILTER_VALUES.FLOW],
            operator: emptyFilter.operator,
        })
    })

    it('should preserve operator when updating values', () => {
        const customOperator = 'custom_operator' as any
        const selectedValue = {
            values: [JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN],
            operator: customOperator,
        }
        renderComponent(selectedValue)

        fireEvent.click(screen.getByText('Campaigns'))
        fireEvent.click(screen.getByRole('option', { name: 'Flows' }))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [
                JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN,
                JOURNEY_TYPE_FILTER_VALUES.FLOW,
            ],
            operator: customOperator,
        })
    })

    describe('JourneysFilterWithState', () => {
        it('should render JourneysFilterWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<JourneysFilterWithState />, defaultState)

            expect(screen.getByText(JOURNEYS_FILTER_NAME)).toBeInTheDocument()

            fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            fireEvent.click(screen.getByText('Campaigns'))

            expect(spy).toHaveBeenCalledWith({
                journeyType: {
                    values: [JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN],
                    operator: emptyFilter.operator,
                },
            })
        })

        it('should connect to Redux state correctly', () => {
            const stateWithJourneys = {
                stats: {
                    ...statsSlice.initialState,
                    filters: {
                        journeyType: {
                            values: [JOURNEY_TYPE_FILTER_VALUES.CAMPAIGN],
                            operator: emptyFilter.operator,
                        },
                    },
                },
            } as RootState

            renderWithStore(<JourneysFilterWithState />, stateWithJourneys)

            expect(screen.getByText('Campaigns')).toBeInTheDocument()
        })
    })
})
