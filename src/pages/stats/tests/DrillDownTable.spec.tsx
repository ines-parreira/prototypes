import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {FunctionComponent} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {TicketChannel, TicketStatus} from 'business/types/ticket'
import {
    useDrillDownData,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {NumberedPagination} from 'pages/common/components/Paginations'
import {DrillDownTable} from 'pages/stats/DrillDownTable'
import {SlaStatusLabel} from 'services/reporting/constants'

import {RootState, StoreDispatch} from 'state/types'
import {
    DrillDownMetric,
    getDrillDownMetricColumn,
    SLA_FORMAT,
} from 'state/ui/stats/drillDownSlice'
import {ConvertMetric, OverviewMetric, SlaMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {TicketDrillDownTableContent} from 'pages/stats/TicketDrillDownTableContent'
import {CampaignSalesDrillDownTableContent} from 'pages/stats/convert/components/CampaignSalesDrillDownTableContent'

import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))
jest.mock('pages/common/components/Paginations')
const numberedPaginationMock = assumeMock(NumberedPagination)

jest.mock('state/ui/stats/drillDownSlice')
const getDrillDownMetricColumnMock = assumeMock(getDrillDownMetricColumn)
jest.mock('hooks/reporting/useDrillDownData')
const useDrillDownDataMock = assumeMock(useDrillDownData)
const useEnrichedDrillDownDataMock = assumeMock(useEnrichedDrillDownData)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownTable />', () => {
    const defaultState = {
        ui: {
            stats: {
                cleanStatsFilters: {},
            },
        },
    } as unknown as RootState
    const currentPage = 1
    const pagesCount = 2
    const useDataHookMock = jest.fn()

    getDrillDownMetricColumnMock.mockReturnValue({
        showMetric: false,
        metricTitle: '',
        metricValueFormat: 'decimal',
    })
    numberedPaginationMock.mockImplementation(() => <div />)

    const renderTable = (
        metricData: DrillDownMetric,
        content: FunctionComponent<{
            metricData: DrillDownMetric
        }>
    ) => {
        return render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownTable
                    metricData={metricData}
                    useDataHook={useDataHookMock}
                    TableContent={content}
                />
            </Provider>
        )
    }

    describe('with Ticket content', () => {
        const agentName = 'Agent name'
        const ticketSubject = 'Ticket subject'
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }
        const exampleRow = {
            ticket: {
                id: 1,
                channel: TicketChannel.Chat,
                description: 'description',
                isRead: true,
                subject: ticketSubject,
                created: '22/12/2023',
                contactReason: 'reason',
                status: TicketStatus.Closed,
            },
            assignee: {
                id: 1,
                name: agentName,
            },
            metricValue: 15,
        }
        const data: TicketDrillDownRowData[] = [
            exampleRow,
            {
                ticket: {
                    id: 2,
                    channel: null,
                    description: null,
                    isRead: false,
                    subject: null,
                    created: null,
                    contactReason: null,
                    status: TicketStatus.Closed,
                },
                assignee: {
                    id: 1,
                    name: agentName,
                },
                metricValue: 15,
            },
        ]

        const renderTableForTicket = (metricData: DrillDownMetric) => {
            return renderTable(metricData, TicketDrillDownTableContent)
        }

        it('should render the table title, table header and rows', () => {
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)
            renderTableForTicket(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should render metric cell', () => {
            const metricTitle = 'Metric title'
            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: true,
                metricTitle,
                metricValueFormat: 'decimal',
            })

            renderTableForTicket(metricData)

            expect(screen.getByText(metricTitle)).toBeInTheDocument()
        })

        it('should not render Avatar if no assignee', () => {
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [{...exampleRow, assignee: null}],
            } as any)
            useDataHookMock.mockReturnValue({
                data: [{...exampleRow, assignee: null}],
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(document.querySelector('.agent')).not.toBeInTheDocument()
        })

        it('should render the table with skeletons on loading', () => {
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: true,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(
                screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length
            ).not.toBe(0)
        })

        it('should redirect to Ticket page on row click', () => {
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [{...exampleRow, assignee: null}],
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)
            act(() => {
                userEvent.click(screen.getAllByRole('row')[1])
            })

            expect(window.open).toHaveBeenCalledWith(
                `/app/ticket/${exampleRow.ticket.id}`,
                '_blank'
            )
        })

        it('should render SlaStatusCell', () => {
            const metricName = 'someMetric'
            const metricStatus = TicketSLAStatus.Breached
            const ticketStatus = TicketSLAStatus.Breached
            const dataWithSlas = {
                ...exampleRow,
                rowData: {
                    [metricName]: {
                        [TicketSLADimension.SlaPolicyMetricName]: metricName,
                        [TicketSLADimension.SlaPolicyMetricStatus]:
                            metricStatus,
                        [TicketSLADimension.SlaDelta]: 123,
                        [TicketSLADimension.SlaStatus]: ticketStatus,
                    },
                },
            }
            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: true,
                metricTitle: SlaMetricConfig[SlaMetric.AchievementRate].title,
                metricValueFormat: SLA_FORMAT,
            })
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [dataWithSlas],
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(
                screen.getByText(SlaStatusLabel[metricStatus])
            ).toBeInTheDocument()
        })

        it('should render Pagination when more then one page of results', () => {
            const onPageChange = jest.fn()
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: true,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
                pagesCount,
                onPageChange,
            } as any)

            renderTableForTicket(metricData)

            expect(numberedPaginationMock).toHaveBeenCalledWith(
                {
                    count: pagesCount,
                    page: currentPage,
                    onChange: onPageChange,
                    className: 'pagination',
                },
                {}
            )
        })
    })

    describe('with Convert campaign sales content', () => {
        const metricData: DrillDownMetric = {
            metricName: ConvertMetric.CampaignSalesCount,
            shopName: 'shopify:shopName',
        }
        const exampleRow = {
            data: {
                id: 1,
                amount: '15.23',
                currency: 'USD',
                productIds: ['prodId1', 'prodId2'],
                customerId: 123456,
                campaignId: '961f8881-ea4c-4cdc-b822-cd201736f6ad',
                createdDatetime: '22/12/2023',
            },
            metricValue: 15.23,
        }
        const data: ConvertDrillDownRowData[] = [
            exampleRow,
            {
                data: {
                    id: 1,
                    amount: '16.23',
                    currency: 'USD',
                    productIds: ['prodId1', 'prodId4'],
                    customerId: 123456,
                    campaignId: '2eba4fee-5c6a-42ef-b0dd-d53b9faeb8af',
                    createdDatetime: '23/12/2023',
                },
                metricValue: 16.23,
            },
        ]

        const renderTableForCampaignSales = (metricData: DrillDownMetric) => {
            return renderTable(metricData, CampaignSalesDrillDownTableContent)
        }

        it('should render the table title, table header and rows', () => {
            useDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)
            renderTableForCampaignSales(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should render metric cell', () => {
            const metricTitle = 'Order'
            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: true,
                metricTitle,
                metricValueFormat: 'decimal',
            })

            renderTableForCampaignSales(metricData)

            expect(screen.getByText(metricTitle)).toBeInTheDocument()
        })

        it('should render the table with skeletons on loading', () => {
            useDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: true,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForCampaignSales(metricData)

            expect(
                screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length
            ).not.toBe(0)
        })

        it('should render Pagination when more then one page of results', () => {
            const onPageChange = jest.fn()
            useDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: true,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
                pagesCount,
                onPageChange,
            } as any)

            renderTableForCampaignSales(metricData)

            expect(numberedPaginationMock).toHaveBeenCalledWith(
                {
                    count: pagesCount,
                    page: currentPage,
                    onChange: onPageChange,
                    className: 'pagination',
                },
                {}
            )
        })
    })
})
