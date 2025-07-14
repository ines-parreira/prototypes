import MockAdapter from 'axios-mock-adapter'

import { FIRST_RESPONSE_TIME } from 'domains/reporting/config/stats'
import {
    downloadStat,
    fetchStat,
} from 'domains/reporting/models/stat/resources'
import { firstResponseTime } from 'fixtures/stats'
import client from 'models/api/resources'

const mockedServer = new MockAdapter(client)

describe('stat resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchStat', () => {
        it('should resolve with a Stat on success', async () => {
            mockedServer
                .onPost(`/api/stats/${FIRST_RESPONSE_TIME}/`)
                .reply(200, firstResponseTime)

            const res = await fetchStat(FIRST_RESPONSE_TIME, {
                filters: {
                    period: {
                        start_datetime: '',
                        end_datetime: '',
                    },
                },
            })
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost(`/api/stats/${FIRST_RESPONSE_TIME}/`)
                .reply(503, { message: 'error' })

            return expect(
                fetchStat(FIRST_RESPONSE_TIME, {
                    filters: {
                        period: {
                            start_datetime: '',
                            end_datetime: '',
                        },
                    },
                }),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('downloadStat', () => {
        it('should resolve with a Stat file on success', async () => {
            mockedServer
                .onPost(`/api/stats/${FIRST_RESPONSE_TIME}/download`)
                .reply(200, firstResponseTime, {
                    'content-disposition': 'filename=test.json',
                })

            const res = await downloadStat(FIRST_RESPONSE_TIME, {
                filters: {
                    period: {
                        start_datetime: '',
                        end_datetime: '',
                    },
                },
            })
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost(`/api/stats/${FIRST_RESPONSE_TIME}/download`)
                .reply(503, { message: 'error' })

            return expect(
                downloadStat(FIRST_RESPONSE_TIME, {
                    filters: {
                        period: {
                            start_datetime: '',
                            end_datetime: '',
                        },
                    },
                }),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
