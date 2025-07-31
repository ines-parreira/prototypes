import React from 'react'

import { userEvent } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { FilterLabels } from 'domains/reporting/pages/common/filters/constants'
import {
    StoreFilterFromContext,
    StoreFilterWithState,
} from 'domains/reporting/pages/common/filters/StoreFilter'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'domains/reporting/state/stats/statsSlice'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

const mockedDispatch = jest.fn()
const mockedRemove = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('domains/reporting/pages/convert/hooks/useCampaignStatsFilters')
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
            screen.getByText(FilterLabels[FilterKey.StoreIntegrations]),
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
            name: FilterKey.StoreIntegrations,
            logical_operator:
                LogicalOperatorLabel[
                    LogicalOperatorEnum.ONE_OF
                ].toLocaleLowerCase(),
        })
    })
})
