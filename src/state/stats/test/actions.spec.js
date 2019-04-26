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
