import MockAdapter from 'axios-mock-adapter'

import {createClient} from 'models/api/resources'

import {REPORTING_ENDPOINT} from './resources'
import {
    TicketStateMeasure,
    GetReportingResponse,
    OpenTicketStateMeasure,
    ReportingQuery,
} from './types'

const client = createClient()

export default client

const mock = new MockAdapter(client, {delayResponse: 3000})

mock.onGet(REPORTING_ENDPOINT).reply<GetReportingResponse<[number]>>(
    (config) => {
        const query = JSON.parse(
            (config.params as {query: string}).query
        ) as ReportingQuery[]

        switch (query[0].measures[0]) {
            case TicketStateMeasure.SurveyScore: {
                return [
                    200,
                    {
                        query,
                        annotation: {
                            title: 'Customer satisfaction',
                            shortTitle: 'CSAT',
                            type: 'number',
                        },
                        data: [Math.random() * 5],
                    },
                ]
            }
            case TicketStateMeasure.FirstResponseTime: {
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
                        query,
                        annotation: {
                            title: 'First Response Time',
                            shortTitle: 'FRT',
                            type: 'number',
                        },
                        data: [firstResponseTime],
                    },
                ]
            }
            case TicketStateMeasure.ResolutionTime: {
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
                        query,
                        annotation: {
                            title: 'Resolution Time',
                            shortTitle: 'RT',
                            type: 'number',
                        },
                        data: [resolutionTime],
                    },
                ]
            }
            case TicketStateMeasure.MessagesAverage: {
                return [
                    200,
                    {
                        query,
                        annotation: {
                            title: 'Messages per ticket',
                            shortTitle: 'MPT',
                            type: 'number',
                        },
                        data: [Math.random() * 30 + 5],
                    },
                ]
            }
            case OpenTicketStateMeasure.TicketCount: {
                return [
                    200,
                    {
                        query,
                        annotation: {
                            title: 'Open tickets',
                            shortTitle: 'OT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 100 + 50)],
                    },
                ]
            }
            default: {
                return [
                    200,
                    {
                        query,
                        annotation: {
                            title: 'Closed tickets',
                            shortTitle: 'CT',
                            type: 'number',
                        },
                        data: [Math.round(Math.random() * 200 + 100)],
                    },
                ]
            }
        }
    }
)
