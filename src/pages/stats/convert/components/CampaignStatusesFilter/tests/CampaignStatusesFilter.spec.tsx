import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

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

const mockedDispatch = jest.fn()
const mockedRemove = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

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
    let component: ReturnType<typeof renderWithStore>

    beforeEach(() => {
        component = renderWithStore(
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
            />,
            defaultState
        )
    })

    it('should render CampaignStatusesFilter component', () => {
        expect(
            screen.getByText(FilterLabels[FilterKey.CampaignStatuses])
        ).toBeInTheDocument()
        expect(screen.getByText(FILTER_VALUE_PLACEHOLDER)).toBeTruthy()
    })

    it('should open the select component and contain all options', () => {
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        CampaignStatusesCapitalized.forEach((campaignStatus) => {
            expect(screen.getByText(campaignStatus)).toBeInTheDocument()
        })
        expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    })

    it('should dispatch the right actions on options selection', () => {
        expect(screen.queryByText(InferredCampaignStatus.Active)).toBeFalsy()
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([InferredCampaignStatus.Active])
        )
    })

    it('should dispatch the right actions on options deselection', () => {
        component.rerenderComponent(
            defaultState,
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([InferredCampaignStatus.Active])}
            />
        )
        fireEvent.click(screen.getByText(InferredCampaignStatus.Active))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should disaptch the right action on deselect all', () => {
        fireEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload(Object.values(InferredCampaignStatus))
        )
        component.rerenderComponent(
            defaultState,
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([
                    InferredCampaignStatus.Active,
                    InferredCampaignStatus.Inactive,
                    InferredCampaignStatus.Deleted,
                ])}
            />
        )
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should remove the compaignStatuses filter', () => {
        fireEvent.click(screen.getByText('close'))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
        expect(mockedRemove).toHaveBeenCalled()
    })
})
