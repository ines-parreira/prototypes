import React, { FunctionComponent } from 'react'

import { act, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import { campaign, campaignId } from 'fixtures/campaign'
import { useEnrichedDrillDownData } from 'hooks/reporting/useDrillDownData'
import { TicketQAScoreMeasure } from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import { NumberedPagination } from 'pages/common/components/Paginations'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
} from 'pages/stats/common/drill-down/DrillDownFormatters'
import { DrillDownTable } from 'pages/stats/common/drill-down/DrillDownTable'
import { getDrillDownMetricColumn } from 'pages/stats/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'pages/stats/common/drill-down/TicketDrillDownTableContent'
import { CampaignSalesDrillDownTableContent } from 'pages/stats/convert/components/CampaignSalesDrillDownTableContent'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { SLA_FORMAT, SlaMetricConfig } from 'pages/stats/sla/SlaConfig'
import {
    COMMUNICATION_SKILLS_LABEL,
    COMPLETENESS_STATUS_COMPLETE,
    RESOLUTION_COMPLETENESS_SHORT_LABEL,
} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { SlaStatusLabel } from 'services/reporting/constants'
import { RootState, StoreDispatch } from 'state/types'
import {
    AiSalesAgentMetrics,
    DrillDownMetric,
} from 'state/ui/stats/drillDownSlice'
import {
    AutoQAMetric,
    ConvertMetric,
    SatisfactionMetric,
    SlaMetric,
} from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div data-testid={MOCK_SKELETON_TEST_ID} />,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)
jest.mock('pages/common/components/Paginations')
const numberedPaginationMock = assumeMock(NumberedPagination)

jest.mock('pages/stats/common/drill-down/helpers')
const getDrillDownMetricColumnMock = assumeMock(getDrillDownMetricColumn)
jest.mock('hooks/reporting/useDrillDownData')
const useEnrichedDrillDownDataMock = assumeMock(useEnrichedDrillDownData)

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

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
        }>,
    ) => {
        return render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownTable
                    metricData={metricData}
                    useDataHook={useDataHookMock}
                    TableContent={content}
                />
            </Provider>,
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
                created: '2025-09-01T10:11:12',
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
                data: [{ ...exampleRow, assignee: null }],
            } as any)
            useDataHookMock.mockReturnValue({
                data: [{ ...exampleRow, assignee: null }],
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
                screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length,
            ).not.toBe(0)
        })

        it('should redirect to Ticket page on row click', () => {
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [{ ...exampleRow, assignee: null }],
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
                '_blank',
            )
        })

        it('should should log segment event on ticket row click', () => {
            const autoQAMetricData = {
                metricName: AutoQAMetric.ReviewedClosedTickets,
            }
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(autoQAMetricData)
            act(() => {
                userEvent.click(screen.getAllByRole('row')[1])
            })

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatDrillDownTicketClicked,
                {
                    metric: autoQAMetricData.metricName,
                    ticket_id: exampleRow.ticket.id,
                },
            )
        })

        it('should render SlaStatusCell', () => {
            const metricName = 'someMetric'
            const metricStatus = TicketSLAStatus.Breached
            const ticketStatus = TicketSLAStatus.Breached
            const dataWithSlas = {
                ...exampleRow,
                slas: {
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
                screen.getByText(SlaStatusLabel[metricStatus]),
            ).toBeInTheDocument()
        })

        it('should render surveyScore cell', () => {
            const metricData: DrillDownMetric = {
                metricName: SatisfactionMetric.SatisfactionScore,
            }
            const data = { ...exampleRow, surveyScore: '5' }

            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: false,
                metricTitle: 'Satisfaction score',
                metricValueFormat: 'decimal-to-percent',
            })
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [data],
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(screen.getByText('5')).toBeInTheDocument()
        })

        it(`should render auto QA cells for ${AutoQAMetric.ReviewedClosedTickets} metric`, () => {
            const metricData = {
                metricName: AutoQAMetric.ReviewedClosedTickets,
            }
            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: false,
                metricTitle: '',
                metricValueFormat: 'decimal',
            })
            const dataWithAutoQA = {
                ...exampleRow,
                rowData: {
                    [TicketQAScoreMeasure.AverageResolutionCompletenessScore]:
                        '1',
                    [TicketQAScoreMeasure.AverageCommunicationSkillsScore]:
                        '3.2',
                },
            }
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [dataWithAutoQA],
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(
                screen.getByText(RESOLUTION_COMPLETENESS_SHORT_LABEL),
            ).toBeInTheDocument()
            expect(
                screen.getByText(COMMUNICATION_SKILLS_LABEL),
            ).toBeInTheDocument()
            expect(
                screen.getByText(COMPLETENESS_STATUS_COMPLETE),
            ).toBeInTheDocument()
            expect(screen.getByText('3.2')).toBeInTheDocument()
        })

        it(`should render auto QA cells ${AutoQAMetric.ResolutionCompleteness} metric`, () => {
            const metricData = {
                metricName: AutoQAMetric.ResolutionCompleteness,
            }
            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: false,
                metricTitle: '',
                metricValueFormat: 'decimal',
            })
            const dataWithAutoQA = {
                ...exampleRow,
                rowData: {
                    [TicketQAScoreMeasure.AverageResolutionCompletenessScore]:
                        '1',
                    [TicketQAScoreMeasure.AverageCommunicationSkillsScore]:
                        '3.2',
                },
            }
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [dataWithAutoQA],
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(
                screen.getByText(RESOLUTION_COMPLETENESS_SHORT_LABEL),
            ).toBeInTheDocument()
            expect(
                screen.getByText(COMPLETENESS_STATUS_COMPLETE),
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
                {},
            )
        })

        it('should render product title', () => {
            const metricData: AiSalesAgentMetrics = {
                metricName:
                    AiSalesAgentChart.AiSalesAgentTotalProductRecommendations,
            }

            const dataWithProduct = {
                ...exampleRow,
                product: {
                    title: 'Product 1',
                },
            }

            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [dataWithProduct],
                isFetching: false,
            } as any)
            useDataHookMock.mockReturnValue({
                currentPage,
                perPage: 1,
            } as any)

            renderTableForTicket(metricData)

            expect(screen.getByText('Product 1')).toBeInTheDocument()
        })
    })

    describe('with Convert campaign sales content', () => {
        const metricData: DrillDownMetric = {
            metricName: ConvertMetric.CampaignSalesCount,
            shopName: 'shopify:shopName',
            campaignsOperator: LogicalOperatorEnum.ONE_OF,
            selectedCampaignIds: [],
            context: {
                channel_connection_external_ids: [],
            },
        }
        const customerName = 'Archibald Hackintosh'
        const exampleRow = {
            data: {
                id: 1,
                amount: '15.23',
                currency: 'USD',
                productIds: ['prodId1', 'prodId2'],
                customerName: customerName,
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
                    customerName: undefined,
                    campaignId: campaignId,
                    createdDatetime: '23/12/2023',
                },
                metricValue: 16.23,
            },
        ]
        useCampaignStatsFiltersMock.mockReturnValue({
            campaigns: [campaign],
        } as unknown as any)

        const renderTableForCampaignSales = (metricData: DrillDownMetric) => {
            return renderTable(metricData, CampaignSalesDrillDownTableContent)
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

        it('should render with enriched data', () => {
            const metricTitle = 'Order'
            getDrillDownMetricColumnMock.mockReturnValue({
                showMetric: true,
                metricTitle,
                metricValueFormat: 'decimal',
            })

            const { getByText } = renderTableForCampaignSales(metricData)

            expect(getByText(campaign.name)).toBeInTheDocument()
            expect(getByText(customerName)).toBeInTheDocument()
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

            renderTableForCampaignSales(metricData)

            expect(
                screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length,
            ).not.toBe(0)
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

            renderTableForCampaignSales(metricData)

            expect(numberedPaginationMock).toHaveBeenCalledWith(
                {
                    count: pagesCount,
                    page: currentPage,
                    onChange: onPageChange,
                    className: 'pagination',
                },
                {},
            )
        })
    })
})
