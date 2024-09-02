import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

import CampaignStatusesFilter from 'pages/stats/convert/components/CampaignStatusesFilter/'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
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

const isOneOfRegex = new RegExp(
    `${LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF]}`,
    'i'
)

const isNotOneOfRegex = new RegExp(
    `${LogicalOperatorLabel[LogicalOperatorEnum.NOT_ONE_OF]}`,
    'i'
)

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
                value={withLogicalOperator([InferredCampaignStatus.Active])}
            />,
            defaultState
        )
    })

    it('should render CampaignStatusesFilter component', () => {
        expect(
            screen.getByText(FilterLabels[FilterKey.CampaignStatuses])
        ).toBeInTheDocument()
        expect(screen.getByText(isOneOfRegex)).toBeInTheDocument()
    })

    it('should open the select component and contain all options', () => {
        fireEvent.click(screen.getByText(isOneOfRegex))
        CampaignStatusesCapitalized.forEach((campaignStatus) => {
            expect(screen.getByText(campaignStatus)).toBeInTheDocument()
        })
        expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    })

    it('should dispatch the right actions on options selection and select All', () => {
        expect(screen.queryByText(InferredCampaignStatus.Active)).toBeTruthy()
        fireEvent.click(screen.getByText(isOneOfRegex))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[0]))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
        component.rerenderComponent(
            defaultState,
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([])}
            />
        )
        expect(screen.queryByText(InferredCampaignStatus.Active)).toBeFalsy()
        fireEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload(Object.values(InferredCampaignStatus))
        )
    })

    it('should disaptch the right action on deselect all', () => {
        fireEvent.click(screen.getByText(isOneOfRegex))
        fireEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
    })

    it('should dispatch the right action on option selection', () => {
        expect(
            screen.queryByText(
                `${InferredCampaignStatus.Active}, ${InferredCampaignStatus.Inactive}`
            )
        ).toBeFalsy()
        fireEvent.click(screen.getByText(isOneOfRegex))
        fireEvent.click(screen.getByText(CampaignStatusesCapitalized[1]))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([
                InferredCampaignStatus.Active,
                InferredCampaignStatus.Inactive,
            ])
        )
        component.rerenderComponent(
            defaultState,
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator([
                    InferredCampaignStatus.Active,
                    InferredCampaignStatus.Inactive,
                ])}
            />
        )
        expect(
            screen.getByText(
                `${InferredCampaignStatus.Active}, ${InferredCampaignStatus.Inactive}`
            )
        ).toBeTruthy()
    })

    it('should dispatch the right action when selecting another operator', () => {
        fireEvent.click(screen.getByText(isOneOfRegex))
        expect(screen.getByRole('radio', {name: isOneOfRegex})).toBeChecked()
        expect(
            screen.getByRole('radio', {name: isNotOneOfRegex})
        ).not.toBeChecked()
        fireEvent.click(screen.getByText(isNotOneOfRegex))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload(
                [InferredCampaignStatus.Active],
                LogicalOperatorEnum.NOT_ONE_OF
            )
        )
        component.rerenderComponent(
            defaultState,
            <CampaignStatusesFilter
                onRemove={mockedRemove}
                value={withLogicalOperator(
                    [InferredCampaignStatus.Active],
                    LogicalOperatorEnum.NOT_ONE_OF
                )}
            />
        )
        expect(
            screen.getByRole('radio', {name: isOneOfRegex})
        ).not.toBeChecked()
        expect(screen.getByRole('radio', {name: isNotOneOfRegex})).toBeChecked()
    })

    it('should remove the compaignStatuses filter', () => {
        fireEvent.click(screen.getByText('close'))
        expect(mockedDispatch).toHaveBeenCalledWith(
            dispatchChangeValuePayload([])
        )
        expect(mockedRemove).toHaveBeenCalled()
    })
})
