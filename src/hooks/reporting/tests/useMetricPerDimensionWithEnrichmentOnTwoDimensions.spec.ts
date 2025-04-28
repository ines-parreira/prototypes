import { waitFor } from '@testing-library/react'

import { useMetricPerDimensionWithEnrichmentOnTwoDimensions } from 'hooks/reporting/useMetricPerDimension'
import * as withEnrichment from 'hooks/reporting/withEnrichment'
import { AiSalesAgentOrdersDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { useEnrichedPostReporting } from 'models/reporting/queries'
import { totalNumberofSalesOpportunityConvFromAIAgentQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { postEnrichedReporting } from 'models/reporting/resources'
import { EnrichmentFields } from 'models/reporting/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('models/reporting/queries')

jest.mock('models/reporting/resources')
const useEnrichedPostReportingMock = assumeMock(useEnrichedPostReporting)
const postEnrichedReportingMock = assumeMock(postEnrichedReporting)

const withEnrichmentSpy = jest.spyOn(withEnrichment, 'withEnrichment')

describe('useMetricPerDimensionWithEnrichmentOnTwoDimensions', () => {
    const timezone = 'America'
    const statsFilters = {
        period: {
            start_datetime: '2020-01-16T03:04:56.789-10:00',
            end_datetime: '2020-01-02T03:04:56.789-10:00',
        },
    }
    const query = totalNumberofSalesOpportunityConvFromAIAgentQueryFactory(
        statsFilters,
        timezone,
    )
    const results = [
        {
            [AiSalesAgentOrdersDimension.TicketId]: 1,
            metric: 123,
            [AiSalesAgentOrdersDimension.CustomerId]: 1,
        },
        {
            [AiSalesAgentOrdersDimension.TicketId]: 2,
            metric: 456,
            [AiSalesAgentOrdersDimension.CustomerId]: 1,
        },
        {
            [AiSalesAgentOrdersDimension.TicketId]: 3,
            metric: 789,
            [AiSalesAgentOrdersDimension.CustomerId]: 1,
        },
        {
            [AiSalesAgentOrdersDimension.TicketId]: 4,
            metric: 369,
            [AiSalesAgentOrdersDimension.CustomerId]: 1,
        },
        {
            [AiSalesAgentOrdersDimension.TicketId]: 5,
            metric: 529,
            [AiSalesAgentOrdersDimension.CustomerId]: 1,
        },
    ]

    const ticketEnrichments = [
        {
            [EnrichmentFields.TicketId]: 1,
            [EnrichmentFields.Status]: 'closed',
            [EnrichmentFields.TicketName]: 'Ticket 1',
        },
        {
            [EnrichmentFields.TicketId]: 2,
            [EnrichmentFields.Status]: 'open',
            [EnrichmentFields.TicketName]: 'Ticket 2',
        },
        {
            [EnrichmentFields.TicketId]: 3,
            [EnrichmentFields.Status]: 'closed',
            [EnrichmentFields.TicketName]: 'Ticket 3',
        },
        {
            [EnrichmentFields.TicketId]: 4,
            [EnrichmentFields.Status]: 'open',
            [EnrichmentFields.TicketName]: 'Ticket 4',
        },
        {
            [EnrichmentFields.TicketId]: 5,
            [EnrichmentFields.Status]: 'closed',
            [EnrichmentFields.TicketName]: 'Ticket 5',
        },
    ]

    const customerEnrichments = [
        {
            [EnrichmentFields.OrderCustomerId]: 1,
            [EnrichmentFields.CustomerIntegrationDataByExternalId]:
                'Marie Curie',
        },
    ]
    const enrichments = [...ticketEnrichments, ...customerEnrichments]

    it('should send a query with custom queryFn', async () => {
        const enrichmentMapping = {
            [AiSalesAgentOrdersDimension.TicketId]: EnrichmentFields.TicketId,
            [AiSalesAgentOrdersDimension.CustomerId]:
                EnrichmentFields.OrderCustomerId,
        }
        const mockedResponse = {
            isFetching: false,
            isError: false,
            data: {
                data: results,
                enrichment: enrichments,
            },
        }

        useEnrichedPostReportingMock.mockReturnValue(mockedResponse as any)
        postEnrichedReportingMock.mockResolvedValue(mockedResponse as any)

        const enrichmentFields = [
            EnrichmentFields.TicketId,
            EnrichmentFields.OrderCustomerId,
            EnrichmentFields.CustomerIntegrationDataByExternalId,
        ]
        const { result } = renderHook(() =>
            useMetricPerDimensionWithEnrichmentOnTwoDimensions(
                query,
                enrichmentFields,
                enrichmentMapping,
            ),
        )

        const queryFunction =
            useEnrichedPostReportingMock.mock.calls[0][1]?.queryFn

        await queryFunction?.({} as any)

        await waitFor(() => {
            expect(useEnrichedPostReportingMock).toHaveBeenCalledWith(
                { query, enrichment_fields: enrichmentFields },
                {
                    select: expect.any(Function),
                    queryFn: expect.any(Function),
                },
            )
            expect(result.current).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    allData: mockedResponse.data,
                },
            })
            expect(withEnrichmentSpy).toHaveBeenCalledTimes(2)
            expect(withEnrichmentSpy.mock.calls[0][0]).toEqual(mockedResponse)
            expect(withEnrichmentSpy.mock.calls[0][1]).toEqual(
                AiSalesAgentOrdersDimension.TicketId,
            )
            expect(withEnrichmentSpy.mock.calls[0][2]).toEqual(enrichmentFields)
            expect(withEnrichmentSpy.mock.calls[0][3]).toEqual(
                enrichmentMapping[AiSalesAgentOrdersDimension.TicketId],
            )
            expect(withEnrichmentSpy.mock.results[0].value).toEqual({
                data: {
                    data: [
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 1,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 1,
                            metric: 123,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 2,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 2,
                            metric: 456,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 3,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 3,
                            metric: 789,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 4,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 4,
                            metric: 369,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 5,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 5,
                            metric: 529,
                        },
                    ],
                },
                isError: false,
                isFetching: false,
            })

            expect(withEnrichmentSpy.mock.calls[1][0]).toEqual({
                data: {
                    data: [
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 1,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 1,
                            metric: 123,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 2,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 2,
                            metric: 456,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 3,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 3,
                            metric: 789,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 4,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 4,
                            metric: 369,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 5,
                            'CustomerIntegrationDataByExternalId.id': null,
                            'OrderConversion.customerId': null,
                            'Ticket.id': 5,
                            metric: 529,
                        },
                    ],
                    enrichment: [
                        {
                            'Ticket.id': 1,
                            'Ticket.status': 'closed',
                            'Ticket.subject': 'Ticket 1',
                        },
                        {
                            'Ticket.id': 2,
                            'Ticket.status': 'open',
                            'Ticket.subject': 'Ticket 2',
                        },
                        {
                            'Ticket.id': 3,
                            'Ticket.status': 'closed',
                            'Ticket.subject': 'Ticket 3',
                        },
                        {
                            'Ticket.id': 4,
                            'Ticket.status': 'open',
                            'Ticket.subject': 'Ticket 4',
                        },
                        {
                            'Ticket.id': 5,
                            'Ticket.status': 'closed',
                            'Ticket.subject': 'Ticket 5',
                        },
                        {
                            'CustomerIntegrationDataByExternalId.id':
                                'Marie Curie',
                            'OrderConversion.customerId': 1,
                        },
                    ],
                },
                isError: false,
                isFetching: false,
            })
            expect(withEnrichmentSpy.mock.calls[1][1]).toEqual(
                AiSalesAgentOrdersDimension.CustomerId,
            )
            expect(withEnrichmentSpy.mock.calls[1][2]).toEqual(enrichmentFields)
            expect(withEnrichmentSpy.mock.calls[1][3]).toEqual(
                enrichmentMapping[AiSalesAgentOrdersDimension.CustomerId],
            )
            expect(withEnrichmentSpy.mock.results[1].value).toEqual({
                data: {
                    data: [
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 1,
                            'CustomerIntegrationDataByExternalId.id':
                                'Marie Curie',
                            'OrderConversion.customerId': 1,
                            'Ticket.id': 1,
                            metric: 123,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 2,
                            'CustomerIntegrationDataByExternalId.id':
                                'Marie Curie',
                            'OrderConversion.customerId': 1,
                            'Ticket.id': 2,
                            metric: 456,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 3,
                            'CustomerIntegrationDataByExternalId.id':
                                'Marie Curie',
                            'OrderConversion.customerId': 1,
                            'Ticket.id': 3,
                            metric: 789,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 4,
                            'CustomerIntegrationDataByExternalId.id':
                                'Marie Curie',
                            'OrderConversion.customerId': 1,
                            'Ticket.id': 4,
                            metric: 369,
                        },
                        {
                            'AiSalesAgentOrders.customerId': 1,
                            'AiSalesAgentOrders.ticketId': 5,
                            'CustomerIntegrationDataByExternalId.id':
                                'Marie Curie',
                            'OrderConversion.customerId': 1,
                            'Ticket.id': 5,
                            metric: 529,
                        },
                    ],
                },
                isError: false,
                isFetching: false,
            })
        })
    })

    it('should send a query with custom queryFn on only one enrichment mapping', async () => {
        const enrichmentMapping = {
            [AiSalesAgentOrdersDimension.TicketId]: EnrichmentFields.TicketId,
        }

        const mockedResponse = {
            isFetching: false,
            isError: false,
            data: {
                data: results,
                enrichment: enrichments,
            },
        }

        useEnrichedPostReportingMock.mockReturnValue(mockedResponse as any)
        postEnrichedReportingMock.mockResolvedValue(mockedResponse as any)
        const { result } = renderHook(() =>
            useMetricPerDimensionWithEnrichmentOnTwoDimensions(
                query,
                [EnrichmentFields.TicketId],
                enrichmentMapping,
            ),
        )

        const queryFunction =
            useEnrichedPostReportingMock.mock.calls[0][1]?.queryFn

        await queryFunction?.({} as any)

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: mockedResponse.isFetching,
                isError: mockedResponse.isError,
                data: {
                    allData: mockedResponse.data,
                },
            })
        })
    })
})
