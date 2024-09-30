import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import CampaignStatusesFilter from 'pages/stats/convert/components/CampaignStatusesFilter/'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
} from 'pages/stats/common/components/Filter/constants'
import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {renderWithStore} from 'utils/testing'
import {InferredCampaignStatus} from 'models/convert/campaign/types'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {FilterKey} from 'models/stat/types'
import {STAT_FILTERS_CLEAN} from 'state/ui/stats/constants'
import {SegmentEvent, logEvent} from 'common/segment'

const mockedDispatch = jest.fn()
const mockedRemove = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

const defaultState = {
    stats: initialState,
}

const dispatchChangeValuePayload = (
    values: string[],
    operator = LogicalOperatorEnum.ONE_OF
) =>
    mergeStatsFiltersWithLogicalOperator({
        campaignStatuses: {
            values,
            operator,
        },
    })

const CampaignStatusesCapitalized = Object.keys(InferredCampaignStatus)

describe('CampaignStatusesFilter', () => {
    const renderComponent = () =>
        renderWithStore(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
            />,
            defaultState
        )

    it('should render CampaignStatusesFilter component', () => {
        renderComponent()
        expect(
            screen.getByText(FilterLabels[FilterKey.CampaignStatuses])
        ).toBeInTheDocument()
        expect(screen.getByText(FILTER_VALUE_PLACEHOLDER)).toBeTruthy()
    })

    it('should open the select component and contain all options', () => {
        renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        CampaignStatusesCapitalized.forEach((campaignStatus) => {
            expect(screen.getByText(campaignStatus)).toBeInTheDocument()
        })
        expect(screen.getAllByRole('checkbox')).toHaveLength(5)
    })

    it('should dispatch the right actions on options selection', () => {
        renderComponent()
        expect(screen.queryByText(InferredCampaignStatus.Active)).toBeFalsy()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([InferredCampaignStatus.Active])
        )
    })

    it('should dispatch the right actions on options deselection', () => {
        renderComponent().rerenderComponent(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([InferredCampaignStatus.Active])}
            />,
            defaultState
        )
        fireEvent.click(screen.getByText(InferredCampaignStatus.Active))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should dispatch the right action on deselect all', () => {
        const {rerenderComponent} = renderComponent()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload(Object.values(InferredCampaignStatus))
        )
        rerenderComponent(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([
                    InferredCampaignStatus.Active,
                    InferredCampaignStatus.Inactive,
                    InferredCampaignStatus.Deleted,
                ])}
            />,
            defaultState
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should remove the campaignStatuses filter', () => {
        renderComponent()
        fireEvent.click(screen.getByText('close'))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
        expect(mockedRemove).toHaveBeenCalled()
    })

    it('should dispatch cleanFilters action and call segment analytics log event on filter dropdown close', () => {
        const {rerenderComponent} = renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([InferredCampaignStatus.Active])}
            />,
            defaultState
        )

        expect(mockedDispatch).toHaveBeenCalledWith({type: STAT_FILTERS_CLEAN})
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: FilterKey.CampaignStatuses,
            logical_operator: null,
        })
    })
})
