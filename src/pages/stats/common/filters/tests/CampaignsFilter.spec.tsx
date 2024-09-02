import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {emptyFilter} from 'pages/stats/common/filters/helpers'

import {
    initialState,
    mergeStatsFiltersWithLogicalOperator,
} from 'state/stats/statsSlice'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import {RootState} from 'state/types'

import {assumeMock, renderWithStore} from 'utils/testing'
import {
    FILTER_DESELECT_ALL_LABEL,
    FILTER_SELECT_ALL_LABEL,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import CampaignsFilter, {
    CampaignsFilterWithState,
} from 'pages/stats/common/filters/CampaignsFilter'
import {campaignsList} from 'fixtures/campaign'
import {FilterKey} from 'models/stat/types'
import {FilterLabels} from 'pages/stats/common/filters/constants'

const mockedCampaignsList = campaignsList
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('pages/stats/convert/hooks/useGetCampaignsForStore')
const mockedUseGetCampaignsForStore = assumeMock(useGetCampaignsForStore)
const mockedUseParamsReturnValue = jest.fn(() => ({id: 1}))
jest.mock('react-router-dom', () => ({
    useParams: () => mockedUseParamsReturnValue(),
}))

const CAMPAIGNS_FILTER_NAME = FilterLabels[FilterKey.Campaigns]

const defaultState = {
    stats: {
        filters: initialState.filters,
        [FilterKey.Integrations]: withDefaultLogicalOperator([]),
    },
    integrations: fromJS({
        integrations: fromJS([
            {
                deleted_datetime: null,
                meta: {
                    address: 'help-center|dj9wixfc',
                    shop_integration_id: 1,
                },
                http: null,
                deactivated_datetime: null,
                application_id: '123456b78ef9b1011121314d',
                name: 'Some Integration',
                uri: '/something/integrations/1147/',
                decoration: null,
                locked_datetime: null,
                created_datetime: '2024-05-17T12:53:45.181326+00:00',
                type: 'app',
                id: 321,
                description: null,
                updated_datetime: '2024-05-17T12:53:45.181331+00:00',
                managed: false,
            },
        ]),
    }),
} as Partial<RootState>

const renderComponent = () =>
    renderWithStore(<CampaignsFilter value={emptyFilter} />, defaultState)

describe('CampaignsFilter', () => {
    const isOneOfRegex = new RegExp(
        LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF],
        'i'
    )

    beforeEach(() => {
        mockedUseGetCampaignsForStore.mockReturnValue({
            campaigns: mockedCampaignsList,
            channelConnectionExternalIds: undefined,
        })
    })

    it('should render CampaignsFilter component', () => {
        mockedUseParamsReturnValue.mockImplementationOnce(() => ({id: 321}))
        renderComponent()

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render with empty filter', () => {
        renderWithStore(<CampaignsFilter value={undefined} />, defaultState)

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CampaignsFilter options', () => {
        renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByText(mockedCampaignsList[0].name)
        ).toBeInTheDocument()
        expect(
            screen.getByText(mockedCampaignsList[1].name)
        ).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFilters action on selecting a campaign', () => {
        renderComponent()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(mockedCampaignsList[0].name))
        userEvent.click(screen.getByText(mockedCampaignsList[1].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([
                    mockedCampaignsList[0].id,
                ]),
            })
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([
                    mockedCampaignsList[1].id,
                ]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting a campaign', () => {
        renderWithStore(
            <CampaignsFilter
                value={withDefaultLogicalOperator([mockedCampaignsList[0].id])}
            />,
            defaultState
        )

        userEvent.click(
            screen.getByText(LogicalOperatorLabel[LogicalOperatorEnum.ONE_OF])
        )
        userEvent.click(
            screen.getByRole('option', {name: mockedCampaignsList[0].name})
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on selecting all campaigns and deselecting all campaigns', () => {
        const {rerenderComponent} = renderComponent()
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_SELECT_ALL_LABEL))

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id
        )

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator(allAvailableCampaignsIds),
            })
        )

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
            />
        )

        userEvent.click(screen.getByText(FILTER_DESELECT_ALL_LABEL))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting one of the campaigns', () => {
        const {rerenderComponent} = renderComponent()

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id
        )

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
            />
        )

        userEvent.click(screen.getByText(isOneOfRegex))
        userEvent.click(screen.getByText(mockedCampaignsList[0].name))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator(
                    allAvailableCampaignsIds.filter(
                        (campaign) => campaign !== mockedCampaignsList[0].id
                    )
                ),
            })
        )
    })

    it('should dispatch mergeStatsFilters action on deselecting all integrations when filters dropdown is closed', () => {
        const {rerenderComponent} = renderComponent()
        const clearFilterIcon = 'close'

        const allAvailableCampaignsIds = mockedCampaignsList.map(
            (campaign) => campaign.id
        )

        rerenderComponent(
            defaultState,
            <CampaignsFilter
                value={withDefaultLogicalOperator(allAvailableCampaignsIds)}
            />
        )

        userEvent.click(screen.getByText(new RegExp(clearFilterIcon, 'i')))

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: withDefaultLogicalOperator([]),
            })
        )
    })

    it('should check mergeStatsFilters action calls on opening and closing dropdown', () => {
        const {rerenderComponent} = renderWithStore(
            <CampaignsFilter value={emptyFilter} />,
            defaultState
        )

        expect(screen.getByText(CAMPAIGNS_FILTER_NAME)).toBeInTheDocument()

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(mockedDispatch).toHaveBeenCalledWith({
            type: 'STAT/STAT_FILTERS_DIRTY',
        })

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(defaultState, <CampaignsFilter value={emptyFilter} />)

        expect(mockedDispatch).toHaveBeenCalledWith({
            type: 'STAT/STAT_FILTERS_CLEAN',
        })
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
                campaigns: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )

        userEvent.click(isOneOfRadioLabel)

        expect(mockedDispatch).toHaveBeenCalledWith(
            mergeStatsFiltersWithLogicalOperator({
                campaigns: {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                },
            })
        )
    })

    it('should render the CampaignsFilterWithState and reflect the value coming from store', () => {
        const mockedStoreWithHelpCenterFilters = {
            ...defaultState,
            stats: {
                filters: {
                    ...initialState.filters,
                    campaigns: withDefaultLogicalOperator([
                        mockedCampaignsList[0].id,
                    ]),
                },
            },
        }

        renderWithStore(
            <CampaignsFilterWithState />,
            mockedStoreWithHelpCenterFilters
        )

        expect(
            screen.getByText(mockedCampaignsList[0].name)
        ).toBeInTheDocument()
    })
})
