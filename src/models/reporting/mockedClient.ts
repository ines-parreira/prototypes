import MockAdapter from 'axios-mock-adapter'

import {createClient} from 'models/api/resources'

import {REPORTING_ENDPOINT} from './resources'
import {
    ReportingMeasure,
    GetReportingParams,
    GetReportingResponse,
} from './types'

const client = createClient()

export default client

const mock = new MockAdapter(client, {delayResponse: 3000})

mock.onGet(REPORTING_ENDPOINT).reply<GetReportingResponse<[number]>>(
    (config) => {
        const {
            measures: [measure],
        } = config.params as GetReportingParams

        switch (measure) {
            case ReportingMeasure.CustomerSatisfaction: {
                return [
                    200,
                    {
                        query: 'customer satisfaction query',
                        annotation: {
                            title: 'Customer satisfaction',
                            shortTitle: 'CSAT',
                            type: 'number',
                        },
                        data: [Math.random() * 5],
                    },
                ]
            }
            case ReportingMeasure.FirstResponseTime: {
                const minResponseTimeSeconds = 30
                const maxResponseTimeSeconds = 20 * 60
                const firstResponseTime = Math.round(
                    Math.random() *
                        (maxResponseTimeSeconds - minResponseTimeSeconds) +
                        minResponseTimeSeconds
                )
                return [
                    200,
                    {
                        query: 'first response time query',
                        annotation: {
                            title: 'First Response Time',
                            shortTitle: 'FRT',
                            type: 'number',
                        },
                        data: [firstResponseTime],
                    },
                ]
            }
            case ReportingMeasure.ResolutionTime: {
                const minResolutionTimeSeconds = 5 * 60
                const maxResolutionTimeSeconds = 3 * 24 * 60 * 60
                const resolutionTime = Math.round(
                    Math.random() *
                        (maxResolutionTimeSeconds - minResolutionTimeSeconds) +
                        minResolutionTimeSeconds
                )
                return [
                    200,
                    {
                        query: 'resolution time query',
                        annotation: {
                            title: 'Resolution Time',
                            shortTitle: 'RT',
                            type: 'number',
                        },
                        data: [resolutionTime],
                    },
                ]
            }
            case ReportingMeasure.MessagesPerTicket: {
                return [
                    200,
                    {
                        query: 'messages per ticket query',
                        annotation: {
                            title: 'Messages per ticket',
                            shortTitle: 'MPT',
                            type: 'number',
                        },
                        data: [Math.random() * 30 + 5],
                    },
                ]
            }
            case ReportingMeasure.OpenTickets: {
                return [
                    200,
                    {
                        query: 'open tickets query',
                        annotation: {
                            title: 'Open tickets',
                            shortTitle: 'OT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 100 + 50)],
                    },
                ]
            }
            case ReportingMeasure.ClosedTickets: {
                return [
                    200,
                    {
                        query: 'tickets closed query',
                        annotation: {
                            title: 'Closed tickets',
                            shortTitle: 'CT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 200 + 100)],
                    },
                ]
            }
            case ReportingMeasure.TicketsCreated: {
                return [
                    200,
                    {
                        query: 'tickets closed query',
                        annotation: {
                            title: 'Closed tickets',
                            shortTitle: 'CT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 100 + 100)],
                    },
                ]
            }
            case ReportingMeasure.TicketsReplied: {
                return [
                    200,
                    {
                        query: 'tickets replied query',
                        annotation: {
                            title: 'Replied tickets',
                            shortTitle: 'RT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 250 + 125)],
                    },
                ]
            }
            case ReportingMeasure.MessagesSent: {
                return [
                    200,
                    {
                        query: 'tickets replied query',
                        annotation: {
                            title: 'Replied tickets',
                            shortTitle: 'RT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 450 + 250)],
                    },
                ]
            }
        }
    }
)
