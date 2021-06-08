import MockAdapter from 'axios-mock-adapter'

import {firstResponseTimeStat} from '../../../fixtures/stats'
import {FIRST_RESPONSE_TIME} from '../../../config/stats'
import client from '../../api/resources'
import {fetchStat, downloadStat} from '../resources'

const mockedServer = new MockAdapter(client)

describe('stat resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchStat', () => {
        it('should resolve with a Stat on success', async () => {
            mockedServer
                .onPost(`/api/stats/${FIRST_RESPONSE_TIME}/`)
                .reply(200, firstResponseTimeStat)

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
                .reply(503, {message: 'error'})

            return expect(
                fetchStat(FIRST_RESPONSE_TIME, {
                    filters: {
                        period: {
                            start_datetime: '',
                            end_datetime: '',
                        },
                    },
                })
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('downloadStat', () => {
        it('should resolve with a Stat file on success', async () => {
            mockedServer
                .onPost(`/api/stats/${FIRST_RESPONSE_TIME}/download`)
                .reply(200, firstResponseTimeStat, {
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
                .reply(503, {message: 'error'})

            return expect(
                downloadStat(FIRST_RESPONSE_TIME, {
                    filters: {
                        period: {
                            start_datetime: '',
                            end_datetime: '',
                        },
                    },
                })
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
