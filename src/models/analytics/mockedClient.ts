import MockAdapter from 'axios-mock-adapter'

import {createClient} from 'models/api/resources'

import {ANALYTICS_ENDPOINT} from './resources'
import {
    AnalyticsMeasure,
    GetAnalyticsParams,
    GetAnalyticsResponse,
} from './types'

const client = createClient()

export default client

const mock = new MockAdapter(client, {delayResponse: 3000})

mock.onGet(ANALYTICS_ENDPOINT).reply<GetAnalyticsResponse<[number]>>(
    (config) => {
        const {
            measures: [measure],
        } = config.params as GetAnalyticsParams

        switch (measure) {
            case AnalyticsMeasure.CustomerSatisfaction: {
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
            case AnalyticsMeasure.FirstResponseTime: {
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
            case AnalyticsMeasure.ResolutionTime: {
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
            case AnalyticsMeasure.MessagesPerTicket: {
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
            case AnalyticsMeasure.OpenTickets: {
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
            case AnalyticsMeasure.ClosedTickets: {
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
            case AnalyticsMeasure.TicketsCreated: {
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
            case AnalyticsMeasure.TicketsReplied: {
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
            case AnalyticsMeasure.MessagesSent: {
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
