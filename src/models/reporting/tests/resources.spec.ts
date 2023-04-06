import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {REPORTING_ENDPOINT, getReporting} from '../resources'
import {GetReportingResponse} from '../types'

const mockedServer = new MockAdapter(client)

describe('Reporting resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('getReporting', () => {
        it('should resolve with the data on success', async () => {
            const resFixture: GetReportingResponse<[number]> = {
                query: 'foo',
                data: [1],
                annotation: {
                    title: 'test',
                    shortTitle: 'test',
                    type: 'number',
                },
            }
            mockedServer.onGet(REPORTING_ENDPOINT).reply(200, resFixture)

            const res = await getReporting<[number]>({
                dimensions: [],
                measures: [],
                filters: [],
                timeDimensions: [],
            })

            expect(res.data.data).toEqual([1])
        })

        it('should reject with an error on success', async () => {
            mockedServer.onGet(REPORTING_ENDPOINT).reply(503)

            return expect(
                getReporting<[number]>({
                    dimensions: [],
                    measures: [],
                    filters: [],
                    timeDimensions: [],
                })
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
