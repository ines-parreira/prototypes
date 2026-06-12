import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListStoresHandler,
    mockListStoresResponse,
} from '@gorgias/helpdesk-mocks'
import type { StoreIntegration } from '@gorgias/helpdesk-queries'

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
import {
    MultiStoreFilter,
    MultiStoreFilterWithSavedState,
    MultiStoreFilterWithState,
} from 'domains/reporting/pages/common/filters/MultiStoreFilter'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import type { RootState } from 'state/types'

jest.mock('@repo/logging', () => ({
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

const server = setupServer()

export const tempMultiStoreMock: StoreIntegration[] = [
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

const mockStoresList = (
    stores: Array<(typeof tempMultiStoreMock)[number]> = tempMultiStoreMock,
) =>
    mockListStoresHandler(async () =>
        HttpResponse.json(mockListStoresResponse({ data: stores })),
    ).handler

const renderComponent = (props = {}) =>
    render(
        <MultiStoreFilter
            value={emptyFilter}
            dispatchUpdate={dispatchUpdate}
            dispatchRemove={dispatchRemove}
            dispatchStatFiltersDirty={dispatchStatFiltersDirty}
            dispatchStatFiltersClean={dispatchStatFiltersClean}
            {...props}
        />,
        { storeState: defaultState },
    )

describe('MultiStoreFilter', () => {
    const isNotOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF]}`,
        'i',
    )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockStoresList())
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

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

    it('should render with filter', async () => {
        renderComponent({
            value: { values: [1], operator: LogicalOperatorEnum.ONE_OF },
        })

        expect(
            await screen.findByText(tempMultiStoreMock[0].name),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(tempMultiStoreMock[1].name),
        ).not.toBeInTheDocument()
    })

    it('should render IntegrationsFilter options', async () => {
        renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            await screen.findByText(tempMultiStoreMock[0].name),
        ).toBeInTheDocument()
        expect(
            await screen.findByText(tempMultiStoreMock[1].name),
        ).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting a multi store', async () => {
        renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await userEvent.click(
            await screen.findByText(tempMultiStoreMock[0].name),
        )
        await userEvent.click(
            await screen.findByText(tempMultiStoreMock[1].name),
        )

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
            await screen.findByRole('option', {
                name: new RegExp(tempMultiStoreMock[0].name),
            }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all stores and deselecting all integrations', async () => {
        const { unmount } = renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await screen.findByText(tempMultiStoreMock[0].name)
        await userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableIds = tempMultiStoreMock.map(
            (store) => store.store_integration_id,
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(allAvailableIds),
        )

        await userEvent.click(screen.getByText(isNotOneOfRegex))
        unmount()
        render(
            <MultiStoreFilter
                value={withDefaultLogicalOperator(allAvailableIds)}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            { storeState: defaultState },
        )
        await userEvent.click(screen.getByTestId('logical-operator'))
        await screen.findByText(tempMultiStoreMock[0].name)
        await userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', async () => {
        const { rerender } = renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        await userEvent.click(
            await screen.findByText(tempMultiStoreMock[0].name),
        )
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

    it('should be disabled when isDisabled is true', async () => {
        renderComponent({ isDisabled: true })

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.queryByText(tempMultiStoreMock[0].name),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(tempMultiStoreMock[1].name),
        ).not.toBeInTheDocument()
    })

    it('should show warningMessage as tooltip when the select is disabled', async () => {
        const message = 'The store filter will be available soon.'
        renderComponent({ isDisabled: true, warningMessage: message })

        const filterValue = screen.getByText(FILTER_VALUE_PLACEHOLDER)
        act(() => {
            userEvent.hover(filterValue)
        })

        await waitFor(() => {
            expect(screen.getByText(message)).toBeInTheDocument()
        })
    })

    it('should render an empty list of stores when useListStores returns undefined', async () => {
        server.use(
            mockListStoresHandler(async () => HttpResponse.json({} as any))
                .handler,
        )

        renderComponent()

        expect(
            screen.getByText(FilterLabels[FilterKey.Stores]),
        ).toBeInTheDocument()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(FILTER_SELECT_ALL_LABEL)).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should call statFiltersDirty when opening dropdown and statFiltersClean when closing dropdown', async () => {
        renderComponent()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(dispatchStatFiltersDirty).toHaveBeenCalled()

        await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
    })

    describe('MultiStoreFilterWithState', () => {
        it('should render MultiStoreFilterWithState component', async () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            render(<MultiStoreFilterWithState />, { storeState: defaultState })
            await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            await screen.findByText(tempMultiStoreMock[0].name)
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

            render(<MultiStoreFilterWithSavedState />, {
                storeState: defaultState,
            })
            await userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            await screen.findByText(tempMultiStoreMock[0].name)
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
