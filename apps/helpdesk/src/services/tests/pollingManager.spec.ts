import { fromJS } from 'immutable'
import type { MockStore } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import pollingManager from '../pollingManager'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('services', () => {
    describe('pollingManager', () => {
        let store: MockStore
        let spy: jest.Mock

        beforeEach(() => {
            jest.useFakeTimers()
            // mark the current user as inactive
            store = mockStore({ activity: fromJS({}) })
            pollingManager.store = store
            window.DISABLE_ACTIVITY_POLLING = 'False'
            spy = jest.fn()
            jest.spyOn(global, 'setInterval')
            jest.spyOn(global, 'clearInterval')
        })

        afterEach(() => {
            jest.clearAllTimers()
            pollingManager.stop()
        })

        it('should not start polling (polling disable)', () => {
            store.dispatch = spy
            window.DISABLE_ACTIVITY_POLLING = 'True'
            pollingManager.start()
            expect(spy).toHaveBeenCalledTimes(0)
        })

        it('should start all pollings', () => {
            store.dispatch = spy
            const oldLocation = window.location
            ;(window as unknown as { location: Location }).location = {
                pathname: '/app/tickets/123456',
            } as Location
            pollingManager.start()
            // should set intervals to fetch resources periodically
            expect(setInterval).toHaveBeenCalledTimes(2)
            // should fetch resources immediately
            expect(spy).toHaveBeenCalledTimes(1)
            ;(window as unknown as { location: Location }).location =
                oldLocation
        })

        it('should stop pollings', () => {
            pollingManager.start()
            jest.clearAllTimers()
            pollingManager.stop()
            expect(clearInterval).toHaveBeenCalledTimes(2)
            expect(pollingManager.intervals).toEqual({})
        })

        it('should stop only recent views counts polling', () => {
            pollingManager.start()
            jest.clearAllTimers()
            pollingManager.stopRecentViewCountsInterval()
            expect(clearInterval).toHaveBeenCalledTimes(1)
            expect(pollingManager.intervals).toEqual({
                activeViewTickets: expect.any(Number),
            })
        })
    })
})
