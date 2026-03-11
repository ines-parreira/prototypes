import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    HandoverFilter,
    HandoverFilterFromContext,
} from 'domains/reporting/pages/common/filters/HandoverFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const HANDOVER_FILTER_NAME = FilterLabels[FilterKey.Handover]

const defaultState = {
    stats: statsSlice.initialState,
} as RootState

describe('HandoverFilter', () => {
    const dispatchUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (value = withLogicalOperator(['yes', 'no'])) =>
        renderWithStore(
            <HandoverFilter value={value} dispatchUpdate={dispatchUpdate} />,
            defaultState,
        )

    it('should render filter with label', () => {
        renderComponent()

        expect(screen.getByText(HANDOVER_FILTER_NAME)).toBeInTheDocument()
    })

    it('should show "All" when both options are selected', () => {
        renderComponent()

        expect(screen.getByText('All')).toBeInTheDocument()
    })

    it('should render Yes/No options when dropdown is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All'))

        expect(screen.getByRole('option', { name: 'Yes' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'No' })).toBeInTheDocument()
    })

    it('should dispatch update when deselecting an option', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All'))
        await user.click(screen.getByRole('option', { name: 'Yes' }))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['no'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update when selecting an option', async () => {
        const user = userEvent.setup()
        renderComponent(withLogicalOperator(['yes']))

        await user.click(screen.getByText('Yes'))
        await user.click(screen.getByRole('option', { name: 'No' }))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['yes', 'no'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update on select all', async () => {
        const user = userEvent.setup()
        renderComponent(withLogicalOperator([]))

        await user.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await user.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: ['yes', 'no'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should dispatch update on deselect all', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('All'))
        await user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith({
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })

    it('should default to all selected when value is undefined', () => {
        renderWithStore(
            <HandoverFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
            />,
            defaultState,
        )

        expect(screen.getByText('All')).toBeInTheDocument()
    })

    describe('HandoverFilterFromContext', () => {
        it('should render and dispatch via Redux', async () => {
            const user = userEvent.setup()

            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<HandoverFilterFromContext />, defaultState)

            expect(screen.getByText(HANDOVER_FILTER_NAME)).toBeInTheDocument()

            await user.click(screen.getByText('All'))
            await user.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

            expect(spy).toHaveBeenCalledWith({
                handover: {
                    values: [],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        })
    })
})
