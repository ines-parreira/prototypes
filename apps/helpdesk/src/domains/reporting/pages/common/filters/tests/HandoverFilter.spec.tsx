import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    HandoverFilter,
    HandoverFilterFromContext,
    HandoverFilterFromSavedContext,
} from 'domains/reporting/pages/common/filters/HandoverFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'

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
        render(
            <HandoverFilter value={value} dispatchUpdate={dispatchUpdate} />,
            { storeState: defaultState },
        )

    describe('trigger label', () => {
        it('should render filter with label', () => {
            renderComponent()

            expect(screen.getByText(HANDOVER_FILTER_NAME)).toBeInTheDocument()
        })

        it('should show "All" when both options are selected', () => {
            renderComponent()

            expect(screen.getByText('All')).toBeInTheDocument()
        })

        it('should show "None" when no options are selected', () => {
            renderComponent(withLogicalOperator([]))

            expect(screen.getByText('None')).toBeInTheDocument()
        })

        it('should show "Yes" when only yes is selected', () => {
            renderComponent(withLogicalOperator(['yes']))

            expect(
                screen.getByRole('button', { name: /Yes/ }),
            ).toBeInTheDocument()
        })

        it('should show "No" when only no is selected', () => {
            renderComponent(withLogicalOperator(['no']))

            expect(
                screen.getByRole('button', { name: /No/ }),
            ).toBeInTheDocument()
        })

        it('should default to all selected when value is undefined', () => {
            render(
                <HandoverFilter
                    value={undefined}
                    dispatchUpdate={dispatchUpdate}
                />,
                { storeState: defaultState },
            )

            expect(screen.getByText('All')).toBeInTheDocument()
        })
    })

    describe('dropdown options', () => {
        it('should render Yes/No options when dropdown is opened', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All'))
            })

            expect(
                screen.getByRole('option', { name: 'Yes' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'No' }),
            ).toBeInTheDocument()
        })
    })

    describe('selection changes', () => {
        it('should dispatch update when deselecting an option', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByText('All'))
                await user.click(screen.getByRole('option', { name: 'Yes' }))
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['no'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })

        it('should dispatch update when selecting an option', async () => {
            const user = userEvent.setup()
            renderComponent(withLogicalOperator(['yes']))

            await act(async () => {
                await user.click(screen.getByRole('button', { name: /Yes/ }))
                await user.click(screen.getByRole('option', { name: 'No' }))
            })

            expect(dispatchUpdate).toHaveBeenCalledWith({
                values: ['yes', 'no'],
                operator: LogicalOperatorEnum.ONE_OF,
            })
        })
    })

    describe('HandoverFilterFromContext', () => {
        it('should render and dispatch via Redux', async () => {
            const user = userEvent.setup()

            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            render(<HandoverFilterFromContext />, { storeState: defaultState })

            expect(screen.getByText(HANDOVER_FILTER_NAME)).toBeInTheDocument()

            await act(async () => {
                await user.click(screen.getByText('All'))
                await user.click(screen.getByRole('option', { name: 'Yes' }))
            })

            expect(spy).toHaveBeenCalledWith({
                handover: {
                    values: ['no'],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            })
        })
    })

    describe('HandoverFilterFromSavedContext', () => {
        it('should return null', () => {
            const { container } = render(<HandoverFilterFromSavedContext />, {
                storeState: defaultState,
            })

            expect(container).toBeEmptyDOMElement()
        })
    })
})
