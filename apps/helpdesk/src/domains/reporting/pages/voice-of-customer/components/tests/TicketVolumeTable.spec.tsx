import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useTicketsPerProductDistribution } from 'domains/reporting/hooks/voice-of-customer/useTicketsDistributionPerProduct'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { LoadingTable } from 'domains/reporting/pages/ticket-insights/tags/TopUsedTagsChart'
import {
    ColumnLabels,
    TicketVolumeTable,
} from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable'
import { PRODUCTS_PER_TICKET_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import {
    ProductsPerTicketColumn,
    initialState as productsPerTicketInitialState,
    sortingSet,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { opposite } from 'models/api/types'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/ticket-insights/tags/TopUsedTagsChart')
const LoadingTableMock = assumeMock(LoadingTable)

jest.mock('domains/reporting/pages/common/components/NoDataAvailable')
const NoDataAvailableMock = assumeMock(NoDataAvailable)

jest.mock(
    'domains/reporting/hooks/voice-of-customer/useTicketsDistributionPerProduct',
)
const useTicketsPerProductDistributionMock = assumeMock(
    useTicketsPerProductDistribution,
)

describe('TicketVolumeTable', () => {
    const productName = 'Product name'
    const exampleData = [
        {
            productId: 'something',
            value: 10,
            prevValue: 5,
            valueInPercentage: 1,
            previousValueInPercentage: 5,
            gaugePercentage: 0.4,
            name: productName,
        },
        {
            productId: 'something',
            value: NaN,
            prevValue: 0,
            valueInPercentage: 1,
            previousValueInPercentage: 0,
            gaugePercentage: 0.4,
            name: 'another product name',
        },
    ]
    const defaultState = {
        ui: {
            stats: {
                statsTables: {
                    [PRODUCTS_PER_TICKET_SLICE_NAME]:
                        productsPerTicketInitialState,
                },
            },
        },
    } as RootState

    beforeEach(() => {
        useTicketsPerProductDistributionMock.mockReturnValue({
            isFetching: false,
            data: [],
        })
        LoadingTableMock.mockImplementation(() => <div />)
        NoDataAvailableMock.mockImplementation(() => <div />)
    })

    it('should render loading state', () => {
        useTicketsPerProductDistributionMock.mockReturnValue({
            isFetching: true,
            data: [],
        })

        renderWithStore(<TicketVolumeTable />, defaultState)

        expect(LoadingTableMock).toHaveBeenCalled()
    })

    it('should render No data state', () => {
        useTicketsPerProductDistributionMock.mockReturnValue({
            isFetching: false,
            data: [],
        })

        renderWithStore(<TicketVolumeTable />, defaultState)

        expect(NoDataAvailableMock).toHaveBeenCalled()
    })

    it('should render data', () => {
        useTicketsPerProductDistributionMock.mockReturnValue({
            isFetching: false,
            data: exampleData,
        })

        renderWithStore(<TicketVolumeTable />, defaultState)

        expect(screen.getByText(new RegExp(productName))).toBeInTheDocument()
    })

    it.each([
        ProductsPerTicketColumn.Product,
        ProductsPerTicketColumn.TicketVolume,
    ])('should change sorting', async (field) => {
        useTicketsPerProductDistributionMock.mockReturnValue({
            isFetching: false,
            data: exampleData,
        })

        const { store } = renderWithStore(<TicketVolumeTable />, defaultState)
        userEvent.click(screen.getByText(ColumnLabels[field]))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                sortingSet({
                    field,
                    direction: opposite(
                        productsPerTicketInitialState.sorting.direction,
                    ),
                }),
            )
        })
    })
})
