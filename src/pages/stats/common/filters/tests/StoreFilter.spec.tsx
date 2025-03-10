import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { withLogicalOperator } from 'models/reporting/queryFactories/utils'
import { FilterComponentKey } from 'models/stat/types'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import { FilterLabels } from 'pages/stats/common/filters/constants'
import {
    StoreFilterFromContext,
    StoreFilterWithState,
} from 'pages/stats/common/filters/StoreFilter'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

const mockedDispatch = jest.fn()
const mockedRemove = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

const firstId = 1
const integrations = [
    getIntegration(firstId, IntegrationType.Shopify),
    getIntegration(2, IntegrationType.Magento2),
    getIntegration(3, IntegrationType.Shopify),
]
const defaultState = {
    stats: initialState,
    integrations: fromJS({
        integrations,
    }),
    billing: fromJS(billingState),
} as RootState

const dispatchChangeValuePayload = (
    values: number[],
    operator = LogicalOperatorEnum.ONE_OF,
) =>
    mergeStatsFiltersWithLogicalOperator({
        storeIntegrations: {
            values,
            operator,
        },
    })

const firstStoreName = getIntegration(firstId, IntegrationType.Shopify).name
const thirdStoreName = getIntegration(3, IntegrationType.Shopify).name

describe('StoreFilter', () => {
    beforeEach(() => {
        useCampaignStatsFiltersMock.mockReturnValue({
            selectedIntegrations: [],
            storeIntegrations: integrations,
        } as any)
    })
    const renderComponent = () =>
        renderWithStore(
            <StoreFilterWithState onRemove={mockedRemove} />,
            defaultState,
        )

    it('should render the component correctly', () => {
        renderComponent()

        expect(
            screen.getByText(
                FilterLabels[FilterComponentKey.StoreIntegrations],
            ),
        ).toBeTruthy()
    })

    it('should render IntegrationsFilter shopify options only since hasAutomate is false', () => {
        renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(screen.getByText(firstStoreName)).toBeInTheDocument()
        expect(screen.getByText(thirdStoreName)).toBeInTheDocument()
        expect(
            screen.queryByText(
                getIntegration(2, IntegrationType.Magento2).name,
            ),
        ).not.toBeInTheDocument()
    })

    it('should select an option when from context', () => {
        renderWithStore(<StoreFilterFromContext />, defaultState)

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(thirdStoreName))

        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([3]),
        )
    })

    it('should select an option', () => {
        const { store } = renderComponent()

        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(thirdStoreName))

        expect(store.getActions()).toContainEqual(
            dispatchChangeValuePayload([3]),
        )
    })

    it('should have a default selected option and should not be able to deselect it', () => {
        const { store } = renderWithStore(
            <StoreFilterWithState onRemove={mockedRemove} />,
            {
                ...defaultState,
                stats: {
                    ...initialState,
                    filters: {
                        ...initialState.filters,
                        storeIntegrations: withLogicalOperator([firstId]),
                    },
                },
            },
        )
        expect(screen.getByText(firstStoreName)).toBeInTheDocument()
        fireEvent.click(screen.getByText(firstStoreName))
        fireEvent.click(screen.getAllByText(firstStoreName)[1])

        expect(store.getActions()).toContainEqual(
            dispatchChangeValuePayload([firstId]),
        )
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterComponentKey.StoreIntegrations,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })
})
