import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {getIntegration} from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {RootState} from 'state/types'
import {StoreFilterWithState} from 'pages/stats/common/filters/StoreFilter'
import {renderWithStore} from 'utils/testing'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterComponentKey} from 'models/stat/types'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {SegmentEvent, logEvent} from 'common/segment'

const mockedDispatch = jest.fn()
const mockedRemove = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

const firstId = 1
const defaultState = {
    stats: initialState,
    integrations: fromJS({
        integrations: [
            getIntegration(firstId, IntegrationType.Shopify),
            getIntegration(2, IntegrationType.Magento2),
            getIntegration(3, IntegrationType.Shopify),
        ],
    }),
    billing: fromJS(billingState),
} as RootState

const dispatchChangeValuePayload = (
    values: number[],
    operator = LogicalOperatorEnum.ONE_OF
) =>
    mergeStatsFiltersWithLogicalOperator({
        integrations: {
            values,
            operator,
        },
    })

const firstStoreName = getIntegration(firstId, IntegrationType.Shopify).name
const thirdStoreName = getIntegration(3, IntegrationType.Shopify).name

describe('StoreFilter', () => {
    const renderComponent = () =>
        renderWithStore(
            <StoreFilterWithState onRemove={mockedRemove} />,
            defaultState
        )

    it('should render the component correctly', () => {
        renderComponent()
        expect(
            screen.getByText(FilterLabels[FilterComponentKey.Store])
        ).toBeTruthy()
    })

    it('should render IntegrationsFilter shopify options only since hasAutomate is false', () => {
        renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        expect(screen.getByText(firstStoreName)).toBeInTheDocument()
        expect(screen.getByText(thirdStoreName)).toBeInTheDocument()
        expect(
            screen.queryByText(getIntegration(2, IntegrationType.Magento2).name)
        ).not.toBeInTheDocument()
    })

    it('should select an option', () => {
        renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(thirdStoreName))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([3])
        )
    })

    it('should have a default selected option and should not be able to deselect it', () => {
        renderComponent().rerenderComponent(<StoreFilterWithState />, {
            ...defaultState,
            stats: {
                ...initialState,
                filters: {
                    ...initialState.filters,
                    integrations: withLogicalOperator([firstId]),
                },
            },
        })
        expect(screen.getByText(firstStoreName)).toBeInTheDocument()
        fireEvent.click(screen.getByText(firstStoreName))
        fireEvent.click(screen.getAllByText(firstStoreName)['1'])
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([firstId])
        )
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterComponentKey.Store,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })
})
