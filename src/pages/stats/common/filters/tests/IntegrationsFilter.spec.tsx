import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen} from '@testing-library/react'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {emptyFilter} from 'pages/stats/common/filters/helpers'

import {integrationsState} from 'fixtures/integrations'
import {Integration} from 'models/integration/types'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {RootState} from 'state/types'

import {renderWithStore} from 'utils/testing'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import IntegrationsFilter, {
    INTEGRATIONS_FILTER_NAME,
} from 'pages/stats/common/filters/IntegrationsFilter'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const defaultState = {
    stats: initialState,
} as RootState

const integrations: Integration[] =
    integrationsState.integrations as Integration[]

const renderComponent = () =>
    renderWithStore(
        <IntegrationsFilter value={emptyFilter} integrations={integrations} />,
        defaultState
    )

describe('IntegrationsFilter', () => {
    const isOneOfRegex = new RegExp(
        `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
        'i'
    )

    it('should render IntegrationsFilter component', () => {
        renderComponent()

        expect(screen.getByText(INTEGRATIONS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderWithStore(
            <IntegrationsFilter
                value={undefined}
                integrations={integrations}
            />,
            defaultState
        )

        expect(screen.getByText(INTEGRATIONS_FILTER_NAME)).toBeInTheDocument()
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

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator([integrations[0].id]),
            })
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator([integrations[1].id]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting an integration', () => {
        renderWithStore(
            <IntegrationsFilter
                value={withDefaultLogicalOperator([integrations[0].id])}
                integrations={integrations}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        userEvent.click(
            screen.getByRole('option', {name: integrations[0].name})
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all integrations and deselecting all integrations', () => {
        const {rerender} = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator(
                    allAvailableIntegrationsIds
                ),
            })
        )

        rerender(
            <IntegrationsFilter
                value={withDefaultLogicalOperator(allAvailableIntegrationsIds)}
                integrations={integrations}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the integrations', () => {
        const {rerender} = renderComponent()

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id
        )

        rerender(
            <IntegrationsFilter
                value={withDefaultLogicalOperator(allAvailableIntegrationsIds)}
                integrations={integrations}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(integrations[0].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator(
                    allAvailableIntegrationsIds.filter(
                        (channel) => channel !== integrations[0].id
                    )
                ),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const {rerender} = renderComponent()
        const clearFilterIcon = 'close'

        const allAvailableIntegrationsIds = integrations.map(
            (integration) => integration.id
        )

        rerender(
            <IntegrationsFilter
                value={withDefaultLogicalOperator(allAvailableIntegrationsIds)}
                integrations={integrations}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should change selection of logical operator when one of the options is clicked', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        const isOneOfRadioLabel = screen.getByLabelText(
            new RegExp(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF], 'i')
        )
        const isNotOneOfRadioLabel = screen.getByLabelText(
            new RegExp(
                LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF],
                'i'
            )
        )

        userEvent.click(isNotOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                integrations: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )
    })
})
