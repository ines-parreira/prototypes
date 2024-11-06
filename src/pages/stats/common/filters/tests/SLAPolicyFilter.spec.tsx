import {SLAPolicy, useListSlaPolicies} from '@gorgias/api-queries'
import {screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {TicketChannel} from 'business/types/ticket'
import {SegmentEvent, logEvent} from 'common/segment'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterKey, TagFilterInstanceId} from 'models/stat/types'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_DROPDOWN_ICON,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {
    SLAPolicyFilter,
    SLAPolicyFilterWithState,
} from 'pages/stats/common/filters/SLAPolicyFilter'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'

import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('@gorgias/api-queries')
const useListSlaPoliciesMock = assumeMock(useListSlaPolicies)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('SLAPolicyFilter', () => {
    const policy = {
        name: 'someName',
        uuid: 'some-id',
        archived_datetime: 'asd',
        created_datetime: 'xyz',
        deactivated_datetime: 'qwe',
        metrics: [],
        target_channels: [],
        updated_datetime: 'asd',
        version: 1,
    }
    const aPolicy = {
        ...policy,
        name: 'ABC',
        uuid: '123',
    }
    const anotherPolicy = {
        ...policy,
        name: 'XYZ',
        uuid: '456',
    }
    const policies: SLAPolicy[] = [
        aPolicy,
        anotherPolicy,
        {
            ...policy,
            uuid: '789',
            name: 'QWE',
        },
    ]
    const defaultState = {
        stats: {
            filters: {
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[1].id,
                ]),
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator([agents[0].id]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: {filters: filtersSlice.initialState},
        },
    } as RootState
    const dispatchUpdate = jest.fn()
    const dispatchStatFiltersDirty = jest.fn()
    const dispatchStatFiltersClean = jest.fn()

    beforeEach(() => {
        useListSlaPoliciesMock.mockReturnValue({
            data: {data: {data: policies}},
            isError: false,
            isLoading: false,
        } as any)
    })

    it('should render available policies', () => {
        renderWithStore(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        policies.forEach((policy) => {
            expect(screen.getByText(policy.name)).toBeInTheDocument()
        })
    })

    it('should render when no policies', () => {
        useListSlaPoliciesMock.mockReturnValue({
            data: undefined,
            isError: false,
            isLoading: false,
        } as any)

        renderWithStore(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(
            screen.getByRole('option', {
                name: new RegExp(FILTER_SELECT_ALL_LABEL),
            })
        ).toBeInTheDocument()
        expect(screen.queryAllByRole('option').length).toEqual(1)
    })

    it('should render selected options', () => {
        const selectedPolicies = withDefaultLogicalOperator([aPolicy.uuid])
        renderWithStore(
            <SLAPolicyFilter
                value={selectedPolicies}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        const option = screen.getByRole('option', {name: aPolicy.name})

        expect(option).toBeInTheDocument()
        expect(within(option).getByRole('checkbox')).toBeChecked()
    })

    it('should dispatch selected policy', () => {
        renderWithStore(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(aPolicy.name))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([aPolicy.uuid])
        )
        expect(dispatchStatFiltersClean).toHaveBeenCalled()
    })

    it('should deselect policy', () => {
        const selectedPolicies = withDefaultLogicalOperator([
            aPolicy.uuid,
            anotherPolicy.uuid,
        ])
        renderWithStore(
            <SLAPolicyFilter
                value={selectedPolicies}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(aPolicy.name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([anotherPolicy.uuid])
        )
    })

    it('should add selected policy to already selected', () => {
        const alreadySelectedPolicies = [aPolicy.uuid]
        renderWithStore(
            <SLAPolicyFilter
                value={withDefaultLogicalOperator(alreadySelectedPolicies)}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(anotherPolicy.name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([aPolicy.uuid, anotherPolicy.uuid])
        )
    })

    it('should dispatch all selected policies on selectAll', () => {
        renderWithStore(
            <SLAPolicyFilter
                value={undefined}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(policies.map((p) => p.uuid))
        )
    })

    it('should dispatch all selected policies on deselectAll', () => {
        const selected = withDefaultLogicalOperator(policies.map((p) => p.uuid))
        renderWithStore(
            <SLAPolicyFilter
                value={selected}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([])
        )
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const selectedPolicy = policies[0]
        const anotherSelectedPolicy = policies[1]
        const {rerenderComponent, store} = renderWithStore(
            <SLAPolicyFilter
                value={withDefaultLogicalOperator([selectedPolicy.uuid])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState
        )

        userEvent.click(screen.getByText(selectedPolicy.name))
        userEvent.click(screen.getByText(anotherSelectedPolicy.name))
        userEvent.click(screen.getAllByText(selectedPolicy.name)[0])

        rerenderComponent(
            <SLAPolicyFilter
                value={withDefaultLogicalOperator([selectedPolicy.uuid])}
                dispatchUpdate={dispatchUpdate}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            store as any
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.SlaPolicies,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('SLAPolicyFilterWithState', () => {
        it('should render SLAPolicyFilterWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator'
            )

            renderWithStore(<SLAPolicyFilterWithState />, defaultState)
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.SlaPolicies])
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()
        })
    })
})
