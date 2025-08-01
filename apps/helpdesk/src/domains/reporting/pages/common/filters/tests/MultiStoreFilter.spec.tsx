import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useListStores } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import { emptyFilter } from 'domains/reporting/pages/common/filters/helpers'
import MultiStoreFilter, {
    MultiStoreFilterWithSavedState,
    MultiStoreFilterWithState,
} from 'domains/reporting/pages/common/filters/MultiStoreFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const clearFilterIcon = 'close'
const defaultState = {
    stats: statsSlice.initialState,
    ui: {
        stats: {
            filters: filtersSlice.initialState,
        },
    },
} as RootState

const dispatchUpdate = jest.fn()
const dispatchRemove = jest.fn()
const dispatchStatFiltersDirty = jest.fn()
const dispatchStatFiltersClean = jest.fn()

jest.mock('@gorgias/helpdesk-queries')
const useListStoresMock = assumeMock(useListStores)

export const tempMultiStoreMock = [
    {
        store_integration_id: 1,
        name: 'Store name 1',
        created_datetime: '2025-07-02T08:25:05-04:00',
    },
    {
        store_integration_id: 2,
        name: 'Store name 2',
        created_datetime: '2025-07-02T08:08:25-04:00',
    },
]

const renderComponent = (props = {}) =>
    renderWithStore(
        <MultiStoreFilter
            value={emptyFilter}
            dispatchUpdate={dispatchUpdate}
            dispatchRemove={dispatchRemove}
            dispatchStatFiltersDirty={dispatchStatFiltersDirty}
            dispatchStatFiltersClean={dispatchStatFiltersClean}
            {...props}
        />,
        defaultState,
    )

describe('MultiStoreFilter', () => {
    const isNotOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF]}`,
        'i',
    )

    useListStoresMock.mockReturnValue({
        data: {
            data: {
                data: tempMultiStoreMock,
            },
        },
    } as any)

    it('should render MultiStoreFilter component', () => {
        renderComponent()

        expect(
            screen.getByText(FilterLabels[FilterKey.Stores]),
        ).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderComponent({ value: undefined })

        expect(
            screen.getByText(FilterLabels[FilterKey.Stores]),
        ).toBeInTheDocument()
    })

    it('should render with filter', () => {
        renderComponent({
            value: { values: [1], operator: LogicalOperatorEnum.ONE_OF },
        })

        expect(screen.getByText(tempMultiStoreMock[0].name)).toBeInTheDocument()
        expect(
            screen.queryByText(tempMultiStoreMock[1].name),
        ).not.toBeInTheDocument()
    })

    it('should render IntegrationsFilter options', async () => {
        renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(tempMultiStoreMock[0].name)).toBeInTheDocument()
        expect(screen.getByText(tempMultiStoreMock[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting a multi store', async () => {
        renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await userEvent.click(screen.getByText(tempMultiStoreMock[0].name))
        await userEvent.click(screen.getByText(tempMultiStoreMock[1].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([
                tempMultiStoreMock[0].store_integration_id,
            ]),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([
                tempMultiStoreMock[1].store_integration_id,
            ]),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting a multi store', async () => {
        renderComponent({
            value: withDefaultLogicalOperator([
                tempMultiStoreMock[0].store_integration_id,
            ]),
        })

        await userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        await userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(tempMultiStoreMock[0].name),
            }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all stores and deselecting all integrations', async () => {
        const { rerender } = renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableIds = tempMultiStoreMock.map(
            (store) => store.store_integration_id,
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(allAvailableIds),
        )

        await userEvent.click(screen.getByText(isNotOneOfRegex))
        rerender(
            <MultiStoreFilter
                value={withDefaultLogicalOperator(allAvailableIds)}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )
        await userEvent.click(
            screen.getByText(
                `${tempMultiStoreMock[0].name}, ${tempMultiStoreMock[1].name}`,
            ),
        )
        await userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', async () => {
        const { rerender } = renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await userEvent.click(screen.getByText(tempMultiStoreMock[0].name))
        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerender(
            <MultiStoreFilter
                value={withDefaultLogicalOperator([])}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Stores,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
        expect(dispatchStatFiltersClean).toHaveBeenCalledWith()
    })

    it('should render an empty list of stores when useListStores returns undefined', async () => {
        useListStoresMock.mockReturnValue({
            data: {
                data: undefined,
            },
        } as any)

        renderComponent()

        expect(
            screen.getByText(FilterLabels[FilterKey.Stores]),
        ).toBeInTheDocument()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(FILTER_SELECT_ALL_LABEL)).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    describe('MultiStoreFilterWithState', () => {
        it('should render MultiStoreFilterWithState component', async () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            renderWithStore(<MultiStoreFilterWithState />, defaultState)
            await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            await userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Stores]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            await userEvent.click(
                screen.getByText(new RegExp(clearFilterIcon, 'i')),
            )

            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Stores]: withLogicalOperator([]),
            })
        })
    })

    describe('MultiStoreFilterWithSavedState', () => {
        it('should render MultiStoreFilterWithSavedState component', async () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )

            renderWithStore(<MultiStoreFilterWithSavedState />, defaultState)
            await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            await userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Stores]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            await userEvent.click(
                screen.getByText(new RegExp(clearFilterIcon, 'i')),
            )

            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.Stores,
            })
        })
    })
})
