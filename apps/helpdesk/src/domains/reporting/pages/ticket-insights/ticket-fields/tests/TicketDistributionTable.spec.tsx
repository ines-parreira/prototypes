import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useTicketsDistribution } from 'domains/reporting/hooks/ticket-insights/useTicketsDistribution'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { NO_DATA_AVAILABLE_COMPONENT_TITLE } from 'domains/reporting/pages/common/components/NoDataAvailable'
import {
    OUTSIDE_TOP_DATA,
    TicketDistributionChart,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('domains/reporting/state/ui/stats/ticketInsightsSlice')
const getSelectedCustomFieldMock = assumeMock(getSelectedCustomField)
jest.mock('domains/reporting/hooks/ticket-insights/useTicketsDistribution')
const useTicketsDistributionMock = assumeMock(useTicketsDistribution)

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            LegacyTooltip: () => <div />,
        }) as typeof import('@gorgias/axiom'),
)

describe('<TicketDistributionTable>', () => {
    const maxTicketCount = 16
    const ticketsCountTotal = 20

    const data = [
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '4',
        },
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0::Level 1',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                String(maxTicketCount),
        },
    ]

    const useTicketsDistributionReturnValue: ReturnType<
        typeof useTicketsDistribution
    > = {
        topData: data.map((item) => ({
            category:
                item[TicketCustomFieldsDimension.TicketCustomFieldsValueString],
            value: Number(
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
            ),
            valueInPercentage:
                (100 *
                    Number(
                        item[
                            TicketCustomFieldsMeasure
                                .TicketCustomFieldsTicketCount
                        ],
                    )) /
                ticketsCountTotal,
            gaugePercentage:
                (100 *
                    Number(
                        item[
                            TicketCustomFieldsMeasure
                                .TicketCustomFieldsTicketCount
                        ],
                    )) /
                maxTicketCount,
        })),
        outsideTopTotal: 0,
        outsideTopTotalPercentage: 0,
        outsideTopTotalGaugePercentage: 0,
        ticketsCountTotal,
        isFetching: false,
    }

    beforeEach(() => {
        useTicketsDistributionMock.mockReturnValue(
            useTicketsDistributionReturnValue,
        )
        getSelectedCustomFieldMock.mockReturnValue({
            id: 123,
            label: 'someLabel',
            isLoading: false,
        })
    })

    it('should render the table', () => {
        render(
            <Provider store={mockStore({})}>
                <TicketDistributionChart />
            </Provider>,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(
            screen.getAllByText(
                new RegExp(
                    data[0][
                        TicketCustomFieldsDimension.TicketCustomFieldsValueString
                    ],
                ),
            ),
        ).toHaveLength(2)
    })

    it('should render the total value', () => {
        render(
            <Provider store={mockStore({})}>
                <TicketDistributionChart />
            </Provider>,
        )

        expect(
            screen.getByText(
                useTicketsDistributionReturnValue.ticketsCountTotal,
            ),
        ).toBeInTheDocument()
    })

    it('should render the outside top values', () => {
        useTicketsDistributionMock.mockReturnValue({
            ...useTicketsDistributionReturnValue,
            outsideTopTotal: 10,
            outsideTopTotalPercentage: 50,
            outsideTopTotalGaugePercentage: 50,
        })
        render(
            <Provider store={mockStore({})}>
                <TicketDistributionChart />
            </Provider>,
        )

        expect(screen.getByText(OUTSIDE_TOP_DATA.title)).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should render no data when no selected Custom Field', () => {
        getSelectedCustomFieldMock.mockReturnValue({
            id: null,
            label: '',
            isLoading: false,
        })

        render(
            <Provider store={mockStore({})}>
                <TicketDistributionChart />
            </Provider>,
        )

        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TITLE),
        ).toBeInTheDocument()
    })

    it('should render no data', () => {
        useTicketsDistributionMock.mockReturnValue({
            ...useTicketsDistributionReturnValue,
            topData: [],
        })

        render(
            <Provider store={mockStore({})}>
                <TicketDistributionChart />
            </Provider>,
        )

        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TITLE),
        ).toBeInTheDocument()
    })

    it('should render the table with skeletons on loading', () => {
        useTicketsDistributionMock.mockReturnValue({
            ...useTicketsDistributionReturnValue,
            isFetching: true,
        })
        const { container } = render(
            <Provider store={mockStore({})}>
                <TicketDistributionChart />
            </Provider>,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(
            container.getElementsByClassName('react-loading-skeleton'),
        ).not.toHaveLength(0)
    })
})
