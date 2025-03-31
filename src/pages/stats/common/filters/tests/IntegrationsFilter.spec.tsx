import React from 'react'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { integrationsState } from 'fixtures/integrations'
import { Integration } from 'models/integration/types'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import { FilterKey } from 'models/stat/types'
import { FILTER_VALUE_PLACEHOLDER } from 'pages/common/forms/FilterInput/constants'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import { FilterLabels } from 'pages/stats/common/filters/constants'
import { emptyFilter } from 'pages/stats/common/filters/helpers'
import {
    IntegrationsFilter,
    IntegrationsFilterWithSavedState,
    IntegrationsFilterWithState,
    PhoneIntegrationsFilterWithState,
} from 'pages/stats/common/filters/IntegrationsFilter'
import * as statsSlice from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
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

const integrations: Integration[] =
    integrationsState.integrations as Integration[]

const dispatchUpdate = jest.fn()
const dispatchRemove = jest.fn()
const dispatchStatFiltersDirty = jest.fn()
const dispatchStatFiltersClean = jest.fn()

const renderComponent = () =>
    renderWithStore(
        <IntegrationsFilter
            value={emptyFilter}
            integrations={integrations}
            dispatchUpdate={dispatchUpdate}
            dispatchRemove={dispatchRemove}
            dispatchStatFiltersDirty={dispatchStatFiltersDirty}
            dispatchStatFiltersClean={dispatchStatFiltersClean}
        />,
        defaultState,
    )

describe('IntegrationsFilter', () => {
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i',
    )

    it('should render IntegrationsFilter component', () => {
        renderComponent()

        expect(
            screen.getByText(FilterLabels[FilterKey.Integrations]),
        ).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderWithStore(
            <IntegrationsFilter
                value={undefined}
                integrations={integrations}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(
            screen.getByText(FilterLabels[FilterKey.Integrations]),
        ).toBeInTheDocument()
    })

    it('should render IntegrationsFilter options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(integrations[0].name)).toBeInTheDocument()
        expect(screen.getByText(integrations[1].name)).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting an integration', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(integrations[0].name))
        userEvent.click(screen.getByText(integrations[1].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([integrations[0].id]),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([integrations[1].id]),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting an integration', () => {
        renderWithStore(
            <IntegrationsFilter
                value={withDefaultLogicalOperator([integrations[0].id])}
                integrations={integrations}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]),
        )
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(integrations[0].name),
            }),
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all integrations and deselecting all integrations', () => {
        const { rerender } = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id,
        )

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(allAvailableIntegrationsIds),
        )

        rerender(
            <IntegrationsFilter
                value={withDefaultLogicalOperator(allAvailableIntegrationsIds)}
                integrations={integrations}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator([]),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the integrations', () => {
        const { rerender } = renderComponent()

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id,
        )

        rerender(
            <IntegrationsFilter
                value={withDefaultLogicalOperator(allAvailableIntegrationsIds)}
                integrations={integrations}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(integrations[0].name))

        expect(dispatchUpdate).toHaveBeenCalledWith(
            withDefaultLogicalOperator(
                allAvailableIntegrationsIds.filter(
                    (channel) => channel !== integrations[0].id,
                ),
            ),
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const { rerender } = renderComponent()

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id,
        )

        rerender(
            <IntegrationsFilter
                value={withDefaultLogicalOperator(allAvailableIntegrationsIds)}
                integrations={integrations}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(dispatchRemove).toHaveBeenCalledWith()
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i'),
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i',
            ),
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })

        userEvent.click(isOneOfRadioLabel)

        expect(dispatchUpdate).toHaveBeenCalledWith({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [],
        })
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const { rerenderComponent } = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(integrations[0].name))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <IntegrationsFilter
                value={withDefaultLogicalOperator([])}
                integrations={integrations}
                dispatchUpdate={dispatchUpdate}
                dispatchRemove={dispatchRemove}
                dispatchStatFiltersDirty={dispatchStatFiltersDirty}
                dispatchStatFiltersClean={dispatchStatFiltersClean}
            />,
            defaultState,
        )

        expect(dispatchStatFiltersClean).toHaveBeenCalledWith()
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.Integrations,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })

    describe('IntegrationsFilterWithState', () => {
        it('should render IntegrationsFilterWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            const stateWithIntegrations = {
                stats: defaultState.stats,
                integrations: fromJS({
                    integrations: integrations,
                }),
            }

            renderWithStore(
                <IntegrationsFilterWithState />,
                stateWithIntegrations,
            )
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Integrations]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Integrations]: withLogicalOperator([]),
            })
        })
    })

    describe('IntegrationsFilterWithSavedState', () => {
        it('should render IntegrationsFilterWithState component', () => {
            const spy = jest.spyOn(filtersSlice, 'upsertSavedFilterFilter')
            const removeSpy = jest.spyOn(
                filtersSlice,
                'removeFilterFromSavedFilterDraft',
            )
            const stateWithIntegrations = {
                ...defaultState,
                integrations: fromJS({
                    integrations: integrations,
                }),
            }
            renderWithStore(
                <IntegrationsFilterWithSavedState />,
                stateWithIntegrations,
            )
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Integrations]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(removeSpy).toHaveBeenCalledWith({
                filterKey: FilterKey.Integrations,
            })
        })
    })

    describe('PhoneIntegrationsFilterWithState', () => {
        it('should render IntegrationsFilterWithState component', () => {
            const spy = jest.spyOn(
                statsSlice,
                'mergeStatsFiltersWithLogicalOperator',
            )

            const stateWithIntegrations = {
                stats: defaultState.stats,
                integrations: fromJS({
                    integrations: integrations,
                }),
            }

            renderWithStore(
                <PhoneIntegrationsFilterWithState />,
                stateWithIntegrations,
            )
            userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
            userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

            expect(
                screen.getByText(FilterLabels[FilterKey.Integrations]),
            ).toBeInTheDocument()
            expect(spy).toHaveBeenCalled()

            userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))
            expect(spy).toHaveBeenCalledWith({
                [FilterKey.Integrations]: withLogicalOperator([]),
            })
        })
    })
})
