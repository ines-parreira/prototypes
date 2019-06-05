import MockAdapter from 'axios-mock-adapter'
import axios from 'axios/index'

import {fromJS} from 'immutable'

import GorgiasApi from '../gorgiasApi'

describe('services', () => {
    describe('GorgiasApi', () => {
        let apiMock = null

        beforeEach(() => {
            apiMock = new MockAdapter(axios)
        })

        afterAll(() => {
            apiMock.restore()
        })

        describe('cancelPendingRequests()', () => {
            it('should not be able to cancel pending requests because instance was not created with this ability', () => {
                const gorgiasApi = new GorgiasApi({requestsCancellation: false})
                let errorCaught = null

                try {
                    gorgiasApi.cancelPendingRequests()
                } catch (error) {
                    errorCaught = error
                }
                expect(errorCaught.message).toMatchSnapshot()
            })

            it('should cancel pending requests', async() => {
                apiMock = new MockAdapter(axios, {delayResponse: 2000})
                apiMock.onAny().reply(200, {})

                const gorgiasApi = new GorgiasApi({requestsCancellation: true})
                let errorCaught = null

                setTimeout(() => {
                    gorgiasApi.cancelPendingRequests()
                }, 1)

                try {
                    await gorgiasApi.getStatistic('overview', fromJS({}))
                } catch (error) {
                    errorCaught = error
                }
                expect(axios.isCancel(errorCaught)).toEqual(true)
            })

        })
        describe('getStatistic()', () => {
            it('should fetch a statistic with the given name and filters', async() => {
                const expectedStat = {data: {}, meta: {}}
                apiMock.onAny().reply(200, expectedStat)

                const data = fromJS({
                    filters: {
                        tags: [1, 2],
                        score: '4'
                    }
                })

                const stat = await new GorgiasApi().getStatistic('overview', data)
                expect(stat.toJS()).toEqual(expectedStat)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('downloadStatistic()', () => {
            it('should fetch a statistic with the given name and filters (ready to be downloaded)', async() => {
                const expectedStat = {data: {}, meta: {}}
                const respHeaders = {
                    'content-disposition': 'attachment; filename=support-volume-2019-05-23-2019-05-29.csv',
                    'content-type': 'text/csv'
                }
                apiMock.onAny().reply(200, expectedStat, respHeaders)

                const data = fromJS({
                    filters: {
                        tags: [1, 2],
                        score: '4'
                    }
                })
                const stat = await new GorgiasApi().downloadStatistic('overview', data)
                expect(stat).toMatchSnapshot()
                expect(apiMock.history).toMatchSnapshot()
            })
        })
    })
})
