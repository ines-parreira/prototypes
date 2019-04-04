import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {saveFileAsDownloaded} from '../../../utils/file'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const mockSaveFileAsDownloaded = jest.fn()
mockSaveFileAsDownloaded()

jest.mock('../../../utils/file.js')

describe('actions', () => {
    describe('stats', () => {
        let store

        let mockServer
        beforeEach(() => {
            store = mockStore({currentAccount: initialState})
            mockServer = new MockAdapter(axios)

        })

        describe('fetch statistic', () => {
            for (let statLabel of [null, 'my-custom-stat']) {
                it(`should fetch and save a statistic (label: "${statLabel}")`, (done) => {
                    const stat = {
                        name: 'overview',
                        data: [1, 2, 3],
                        meta: {
                            start_datetime: 'now'
                        }
                    }
                    const filters = {tags: [1, 2]}
                    mockServer.onPost(`/api/stats/${stat.name}/`).reply(201, stat)

                    store.dispatch(actions.fetchStat(stat.name, filters, statLabel)).then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    })
                })
            }

            it('should fetch a statistic and report an error because the stat does not exist', (done) => {
                const statName = 'unknown-stat'
                mockServer.onPost(`/api/stats/${statName}/`).reply(404)

                store.dispatch(actions.fetchStat(statName, {})).then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

        })

        describe('download statistic', () => {
            afterAll(() => {
                jest.clearAllMocks()
            })

            beforeEach(() => {
                jest.clearAllMocks()
            })

            it('should download a statistic and save file downloaded', (done) => {
                const statName = 'support-volume'
                const csv = {
                    headers: {
                        'content-disposition': `attachment; filename=${statName}.csv`,
                        'content-type': 'text/csv',
                    },
                    data: 'column1, column2, column3,\n1,2,3',
                }
                const filters = {tags: [1, 2, 3]}
                mockServer.onPost('/api/stats/support-volume/download').reply(() => {
                    return [
                        201,
                        csv.data,
                        csv.headers
                    ]
                })

                store.dispatch(actions.downloadStatistic('support-volume', filters))
                    .then(() => {
                        expect(mockServer.history.post[0].data).toMatchSnapshot()
                        expect(saveFileAsDownloaded).toHaveBeenCalledWith(csv.data, `${statName}.csv`, 'text/csv')
                        done()
                    })
            })

            it('should dispatch an error because download failed', (done) => {
                const statName = 'support-volume'
                const csv = {
                    headers: {
                        'content-disposition': `attachment; filename=${statName}.csv`,
                        'content-type': 'text/csv',
                    },
                    data: 'column1, column2, column3,\n1,2,3',
                }

                mockServer.onPost('/api/stats/support-volume/download').reply(() => {
                    return [
                        500,
                        csv.data,
                        csv.headers
                    ]
                })

                store.dispatch(actions.downloadStatistic('support-volume'))
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    })
            })
        })
    })
})
