import type { FunctionComponent } from 'react'
import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { useEnrichedDrillDownDataUnpaginated } from 'domains/reporting/hooks/useDrillDownData'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { DrillDownTable } from 'domains/reporting/pages/common/drill-down/DrillDownTable'
import { MetricsConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownMetricColumn } from 'domains/reporting/pages/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import type { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import { CampaignSalesDrillDownTableContent } from 'domains/reporting/pages/convert/components/CampaignSalesDrillDownTableContent'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import {
    SLA_FORMAT,
    SlaMetricConfig,
} from 'domains/reporting/pages/sla/SlaConfig'
import {
    COMMUNICATION_SKILLS_LABEL,
    COMPLETENESS_STATUS_COMPLETE,
    RESOLUTION_COMPLETENESS_SHORT_LABEL,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { SlaStatusLabel } from 'domains/reporting/services/constants'
import type {
    AiSalesAgentMetrics,
    DrillDownMetric,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    AIInsightsMetric,
    AutoQAMetric,
    ConvertMetric,
    SatisfactionMetric,
    SlaMetric,
} from 'domains/reporting/state/ui/stats/types'
import { campaign, campaignId } from 'fixtures/campaign'
import type { RootState, StoreDispatch } from 'state/types'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            Skeleton: () => <div data-testid={MOCK_SKELETON_TEST_ID} />,
            Pagination: () => <div data-testid="pagination" />,
        }) as typeof import('@gorgias/axiom'),
)

jest.mock('domains/reporting/pages/common/drill-down/helpers')
const getDrillDownMetricColumnMock = assumeMock(getDrillDownMetricColumn)
jest.mock('domains/reporting/hooks/useDrillDownData', () => ({
    useEnrichedDrillDownDataUnpaginated: jest.fn(),
    useEnrichedDrillDownData: jest.fn(),
    defaultEnrichmentFields: [],
    extraEnrichmentFieldsPerMetric: {},
}))
const useEnrichedDrillDownDataUnpaginatedMock = assumeMock(
    useEnrichedDrillDownDataUnpaginated,
)
const useEnrichedDrillDownDataMock = assumeMock(
    jest.requireMock('domains/reporting/hooks/useDrillDownData')
        .useEnrichedDrillDownData,
)

jest.mock('domains/reporting/pages/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('<DrillDownTable />', () => {
    const defaultState = {
        ui: {
            stats: {
                cleanStatsFilters: {},
            },
        },
    } as unknown as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        getDrillDownMetricColumnMock.mockReturnValue({
            showMetric: false,
            metricTitle: '',
            metricValueFormat: 'decimal',
        })
    })

    const renderTable = (
        metricData: DrillDownMetric,
        content: FunctionComponent<{
            metricData: DrillDownMetric
            columnConfig: ColumnConfig
        }>,
    ) => {
        return render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownTable
                    columnConfig={getDrillDownMetricColumn(
                        metricData,
                        MetricsConfig[metricData.metricName].showMetric,
                    )}
                    metricData={metricData}
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: data,
                isFetching: false,
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [{ ...exampleRow, assignee: null }],
            } as any)

            renderTableForTicket(metricData)

            expect(document.querySelector('.agent')).not.toBeInTheDocument()
        })

        it.skip('should render the table with skeletons on loading', () => {
            // TODO: Loading behavior in new DrillDownTable needs investigation
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [],
                isFetching: true,
            } as any)

            renderTableForTicket(metricData)

            expect(
                screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length,
            ).not.toBe(0)
        })

        it('should redirect to Ticket page on row click', async () => {
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [{ ...exampleRow, assignee: null }],
            } as any)

            renderTableForTicket(metricData)
            await act(() => userEvent.click(screen.getAllByRole('row')[1]))

            expect(window.open).toHaveBeenCalledWith(
                `/app/ticket/${exampleRow.ticket.id}`,
                '_blank',
            )
        })

        it('should should log segment event on ticket row click', async () => {
            const autoQAMetricData = {
                metricName: AutoQAMetric.ReviewedClosedTickets,
            }

            renderTableForTicket(autoQAMetricData)
            await act(() => userEvent.click(screen.getAllByRole('row')[1]))

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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [dataWithSlas],
                isFetching: false,
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [data],
                isFetching: false,
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [dataWithAutoQA],
                isFetching: false,
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [dataWithAutoQA],
                isFetching: false,
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: Array(25).fill(exampleRow),
                isFetching: false,
            } as any)

            renderTableForTicket(metricData)

            expect(screen.getByTestId('pagination')).toBeInTheDocument()
        })

        it('should render product skus', () => {
            const metricData: AiSalesAgentMetrics = {
                metricName:
                    AiSalesAgentChart.AiSalesAgentTotalProductRecommendations,
            }

            const dataWithProduct = {
                ...exampleRow,
                product: {
                    variants: ['SKU-1', 'SKU-2'],
                },
            }

            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [dataWithProduct],
                isFetching: false,
            } as any)

            renderTableForTicket(metricData)

            expect(screen.getByText('SKU-1, SKU-2')).toBeInTheDocument()
        })

        it('should render multi-line outcome with different styling for level 1 and level 2', () => {
            const metricData: DrillDownMetric = {
                metricName: AIInsightsMetric.TicketCustomFieldsTicketCount,
                outcomeFieldId: 1,
                intentFieldValues: [],
                intentFieldId: 0,
                integrationIds: [],
            }
            const dataWithMultiLineOutcome: TicketDrillDownRowData[] = [
                {
                    ticket: {
                        id: 1,
                        channel: TicketChannel.Chat,
                        description: 'description',
                        isRead: true,
                        subject: 'Test ticket',
                        created: '2025-09-01T10:11:12',
                        contactReason: 'reason',
                        status: TicketStatus.Closed,
                    },
                    assignee: {
                        id: 1,
                        name: 'Agent name',
                    },
                    outcome: 'Handover::With message',
                    metricValue: 15,
                },
            ]

            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: dataWithMultiLineOutcome,
                isFetching: false,
            } as any)

            renderTableForTicket(metricData)

            expect(screen.getByText('Handover')).toBeInTheDocument()
            expect(screen.getByText('With message')).toBeInTheDocument()

            const level1Element = screen.getByText('Handover')
            const level2Element = screen.getByText('With message')

            expect(level1Element).toHaveClass('level1')
            expect(level2Element).toHaveClass('sublevels')
        })

        it('should render single-line outcome normally', () => {
            const metricData: DrillDownMetric = {
                metricName: AIInsightsMetric.TicketCustomFieldsTicketCount,
                outcomeFieldId: 1,
                intentFieldValues: [],
                intentFieldId: 0,
                integrationIds: [],
            }
            const dataWithSingleLineOutcome: TicketDrillDownRowData[] = [
                {
                    ticket: {
                        id: 1,
                        channel: TicketChannel.Chat,
                        description: 'description',
                        isRead: true,
                        subject: 'Test ticket',
                        created: '2025-09-01T10:11:12',
                        contactReason: 'reason',
                        status: TicketStatus.Closed,
                    },
                    assignee: {
                        id: 1,
                        name: 'Agent name',
                    },
                    outcome: 'Handover',
                    metricValue: 15,
                },
            ]

            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: dataWithSingleLineOutcome,
                isFetching: false,
            } as any)

            renderTableForTicket(metricData)

            const outcomeElement = screen.getByText('Handover')
            expect(outcomeElement).toBeInTheDocument()
            expect(outcomeElement).toHaveClass('level1')
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
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: data,
                isFetching: false,
            } as any)
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: false,
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
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: false,
            } as any)

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
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: data,
                isFetching: false,
            } as any)

            const { getByText } = renderTableForCampaignSales(metricData)

            expect(getByText(campaign.name)).toBeInTheDocument()
            expect(getByText(customerName)).toBeInTheDocument()
        })

        it.skip('should render the table with skeletons on loading', () => {
            // TODO: Loading behavior in new DrillDownTable needs investigation
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [],
                isFetching: true,
            } as any)
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: [],
                isFetching: true,
            } as any)

            renderTableForCampaignSales(metricData)

            expect(
                screen.getAllByTestId(MOCK_SKELETON_TEST_ID).length,
            ).not.toBe(0)
        })

        it('should render Pagination when more then one page of results', () => {
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: Array(25).fill(exampleRow),
                isFetching: false,
            } as any)
            useEnrichedDrillDownDataMock.mockReturnValue({
                data: Array(25).fill(exampleRow),
                isFetching: false,
            } as any)

            renderTableForCampaignSales(metricData)

            expect(screen.getByTestId('pagination')).toBeInTheDocument()
        })
    })

    describe('with AIJourneyMetric.TotalOrders', () => {
        const metricData: DrillDownMetric = {
            ...AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders],
            integrationId: '1',
            metricName: AIJourneyMetric.TotalOrders,
        }

        const renderTableForTotalOrders = (metricData: DrillDownMetric) => {
            return renderTable(metricData, TicketDrillDownTableContent)
        }

        it('should render expected columns for TotalOrders metric', () => {
            const exampleRow = {
                ticket: {
                    id: '222846848',
                    subject:
                        'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                    description:
                        "Hey Kahlil, this is Stacy from Atomic Defense. Have you considered how this headset adapts to different mission needs or setups?\nJust reply, I'm here.\nI just applied a 5% discount to your cart. It's v",
                    channel: 'sms',
                    isRead: false,
                    created: '2025-08-30T21:30:01.011352',
                    contactReason: null,
                    status: 'closed',
                },
                metricValue: '6146766766294',
                assignee: { id: 518103189, name: 'AI Agent Bot' },
                rowData: {
                    'AiSalesAgentOrders.customerId': '6889049587926',
                    'AiSalesAgentOrders.orderId': '6146766766294',
                    'AiSalesAgentOrders.ticketId': '222846848',
                    'AiSalesAgentOrders.totalAmount': '1892.59',
                    'AiSalesAgentOrders.gmvUsd': '1892.591111111',
                    'Ticket.subject':
                        'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                    'Ticket.status': 'closed',
                    'Ticket.excerpt':
                        "Hey Kahlil, this is Stacy from Atomic Defense. Have you considered how this headset adapts to different mission needs or setups?\nJust reply, I'm here.\nI just applied a 5% discount to your cart. It's v",
                    'Ticket.channel': 'sms',
                    'Ticket.assignee_user_id': 518103189,
                    'Ticket.created_datetime': '2025-08-30T21:30:01.011352',
                    'Ticket.contact_reason': null,
                    'Ticket.is_unread': true,
                    'Ticket.custom_fields': {
                        '52697': 'Snooze::With message',
                        '61361': false,
                        '61362': true,
                    },
                    'Ticket.customer_name': 'Kahlil Adams',
                    'CustomerIntegrationDataByExternalId.id': 'Kahlil Adams',
                },
                slas: {},
                outcome: 'Automated::Snooze::With message',
                order: { id: '6146766766294', customer: 'Kahlil Adams' },
                product: { titles: [], variants: [] },
            }
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTableForTotalOrders(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('6146766766294')).toBeInTheDocument()
            expect(screen.getByText('$1,892.59')).toBeInTheDocument()
            expect(screen.getByText('Kahlil Adams')).toBeInTheDocument()
            expect(screen.getByText('AI Agent Bot')).toBeInTheDocument()
        })

        it('should render expected columns for TotalOrders metric with missing data', () => {
            const exampleRow = {
                ticket: {
                    id: '222846848',
                    subject:
                        'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                    description:
                        "Hey Kahlil, this is Stacy from Atomic Defense. Have you considered how this headset adapts to different mission needs or setups?\nJust reply, I'm here.\nI just applied a 5% discount to your cart. It's v",
                    channel: 'sms',
                    isRead: false,
                    created: '2025-08-30T21:30:01.011352',
                    contactReason: null,
                    status: 'closed',
                },
                metricValue: '6146766766294',
                assignee: { id: 518103189, name: 'AI Agent Bot' },
                rowData: {},
                slas: {},
                outcome: 'Automated::Snooze::With message',
                product: { titles: [], variants: [] },
            }
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTableForTotalOrders(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('AI Agent Bot')).toBeInTheDocument()
        })

        it('should render expected columns for TotalOrders metric with missing rowData', () => {
            const exampleRow = {
                ticket: {
                    id: '222846848',
                    subject:
                        'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                    description:
                        "Hey Kahlil, this is Stacy from Atomic Defense. Have you considered how this headset adapts to different mission needs or setups?\nJust reply, I'm here.\nI just applied a 5% discount to your cart. It's v",
                    channel: 'sms',
                    isRead: false,
                    created: '2025-08-30T21:30:01.011352',
                    contactReason: null,
                    status: 'closed',
                },
                metricValue: '6146766766294',
                assignee: { id: 518103189, name: 'AI Agent Bot' },
                slas: {},
                outcome: 'Automated::Snooze::With message',
                product: { titles: [], variants: [] },
            }
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTableForTotalOrders(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('AI Agent Bot')).toBeInTheDocument()
        })
    })

    describe('with AIJourneyMetric.ResponseRate', () => {
        const metricData: DrillDownMetric = {
            ...AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate],
            integrationId: '1',
            metricName: AIJourneyMetric.ResponseRate,
        }

        const exampleRow = {
            ticket: {
                id: '223105547',
                subject:
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                description:
                    'Great to hear you completed your purchase! If you have any questions or need help in the future, just reach out. Enjoy your new gear!',
                channel: 'sms',
                isRead: false,
                created: '2025-09-01T18:03:01.138718',
                contactReason: null,
                status: 'closed',
            },
            assignee: { id: 518103189, name: 'AI Agent Bot' },
            rowData: {
                'AiSalesAgentConversations.ticketId': '223105547',
                'Ticket.subject':
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                'Ticket.status': 'closed',
                'Ticket.excerpt':
                    'Great to hear you completed your purchase! If you have any questions or need help in the future, just reach out. Enjoy your new gear!',
                'Ticket.channel': 'sms',
                'Ticket.assignee_user_id': 518103189,
                'Ticket.created_datetime': '2025-09-01T18:03:01.138718',
                'Ticket.contact_reason': null,
                'Ticket.is_unread': true,
                'Ticket.custom_fields': {
                    '52697': 'Close::With message',
                    '52698': 'Other::No reply::Other',
                    '61361': false,
                    '61362': false,
                },
                'Ticket.customer_name': 'Emmanuel Gomez',
            },
            slas: {},
            outcome: 'Automated::Close::With message',
            intent: 'Other::No reply::Other',
            order: {},
            product: { titles: [], variants: [] },
        }

        const renderTableForResponseRate = (metricData: DrillDownMetric) => {
            return renderTable(metricData, TicketDrillDownTableContent)
        }

        it('should render expected columns for ResponseRate metric', () => {
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTableForResponseRate(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('AI Agent Bot')).toBeInTheDocument()
            expect(screen.getByText('Emmanuel Gomez')).toBeInTheDocument()
        })
    })

    describe('with AIJourneyMetric.OptOutRate', () => {
        const metricData: DrillDownMetric = {
            ...AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate],
            integrationId: '1',
            metricName: AIJourneyMetric.OptOutRate,
        }

        const exampleRow = {
            ticket: {
                id: '223105547',
                subject:
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                description:
                    'Great to hear you completed your purchase! If you have any questions or need help in the future, just reach out. Enjoy your new gear!',
                channel: 'sms',
                isRead: false,
                created: '2025-09-01T18:03:01.138718',
                contactReason: null,
                status: 'closed',
            },
            assignee: { id: 518103189, name: 'AI Agent Bot' },
            rowData: {
                'AiSalesAgentConversations.ticketId': '223105547',
                'Ticket.subject':
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                'Ticket.status': 'closed',
                'Ticket.excerpt':
                    'Great to hear you completed your purchase! If you have any questions or need help in the future, just reach out. Enjoy your new gear!',
                'Ticket.channel': 'sms',
                'Ticket.assignee_user_id': 518103189,
                'Ticket.created_datetime': '2025-09-01T18:03:01.138718',
                'Ticket.contact_reason': null,
                'Ticket.is_unread': true,
                'Ticket.custom_fields': {
                    '52697': 'Close::With message',
                    '52698': 'Other::No reply::Other',
                    '61361': false,
                    '61362': false,
                },
                'Ticket.customer_name': 'Emmanuel Gomez',
            },
            slas: {},
            outcome: 'Automated::Close::With message',
            intent: 'Other::No reply::Other',
            order: {},
            product: { titles: [], variants: [] },
        }

        const renderTableForOptOutRate = (metricData: DrillDownMetric) => {
            return renderTable(metricData, TicketDrillDownTableContent)
        }

        it('should render expected columns for OptOutRate metric', () => {
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTableForOptOutRate(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Journey started for journey 01K0SPSFVAP1XSX3JZYJWTR9Q7',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('AI Agent Bot')).toBeInTheDocument()
            expect(screen.getByText('Emmanuel Gomez')).toBeInTheDocument()
        })
    })

    describe('with AIJourneyMetric.ClickThroughRate', () => {
        const metricData: DrillDownMetric = {
            ...AIJourneyMetricsConfig[AIJourneyMetric.ClickThroughRate],
            integrationId: '1',
            metricName: AIJourneyMetric.ClickThroughRate,
        }

        const exampleRow = {
            ticket: {
                id: '223105548',
                subject:
                    'AI Journey click through for journey 01K0SPSFVAP1XSX3JZYJWTR9Q8',
                description:
                    'Customer clicked on the recommended product link in the AI Journey message.',
                channel: 'email',
                isRead: false,
                created: '2025-09-01T18:05:01.138718',
                contactReason: null,
                status: 'open',
            },
            assignee: { id: 518103190, name: 'AI Agent Bot' },
            rowData: {
                'AiSalesAgentConversations.ticketId': '223105548',
                'Ticket.subject':
                    'AI Journey click through for journey 01K0SPSFVAP1XSX3JZYJWTR9Q8',
                'Ticket.customer_name': 'Jane Smith',
            },
            intent: 'Product::Inquiry::Click',
            order: {},
            product: { titles: [], variants: [] },
        }

        const renderTableForClickThroughRate = (
            metricData: DrillDownMetric,
        ) => {
            return renderTable(metricData, TicketDrillDownTableContent)
        }

        it('should render expected columns for ClickThroughRate metric', () => {
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTableForClickThroughRate(metricData)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Journey click through for journey 01K0SPSFVAP1XSX3JZYJWTR9Q8',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('AI Agent Bot')).toBeInTheDocument()
            expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        })
    })

    describe.each([
        {
            label: 'AiAgentDrillDownMetricName.AutomatedInteractionsCard',
            metricName: AiAgentDrillDownMetricName.AutomatedInteractionsCard,
        },
        {
            label: 'AiAgentDrillDownMetricName.ResolvedInteractionsCard',
            metricName: AiAgentDrillDownMetricName.ResolvedInteractionsCard,
        },
        {
            label: 'AiAgentDrillDownMetricName.SupportInteractionsCard',
            metricName: AiAgentDrillDownMetricName.SupportInteractionsCard,
        },
    ])('with $label', ({ metricName }) => {
        const metricData = {
            metricName,
            title: 'Automated interactions',
        } as DrillDownMetric

        const exampleRow = {
            ticket: {
                id: '100001',
                subject: 'Automated ticket subject',
                description: 'Automated ticket description',
                channel: 'email',
                isRead: true,
                created: '2025-09-01T10:00:00.000Z',
                contactReason: null,
                status: 'closed',
            },
            assignee: { id: 12345, name: 'Support Agent' },
            rowData: {
                'AutomationDataset.ticketId': '100001',
                'Ticket.subject': 'Automated ticket subject',
                'Ticket.status': 'closed',
                'Ticket.excerpt': 'Automated ticket description',
                'Ticket.channel': 'email',
                'Ticket.assignee_user_id': 12345,
                'Ticket.created_datetime': '2025-09-01T10:00:00.000Z',
                'Ticket.contact_reason': null,
                'Ticket.is_unread': false,
                'Ticket.custom_fields': {},
                'Ticket.customer_name': 'Test Customer',
            },
            slas: {},
            outcome: null,
            intent: 'Returns::Refund',
            order: {},
            product: { titles: [], variants: [] },
        }

        it('should show Intent column and hide Contact Reason column', () => {
            useEnrichedDrillDownDataUnpaginatedMock.mockReturnValue({
                data: [exampleRow],
                isFetching: false,
            } as any)

            renderTable(metricData, TicketDrillDownTableContent)

            expect(screen.getByRole('table')).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /Intent/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('columnheader', { name: /Contact Reason/i }),
            ).not.toBeInTheDocument()
            // Intent cell renders, 'Returns' is the first level from 'Returns::Refund'
            expect(screen.getByText('Returns')).toBeInTheDocument()
        })
    })
})
