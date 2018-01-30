import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import pollingManager from '../pollingManager'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('services', () => {
    describe('pollingManager', () => {
        let store
        let spy

        beforeEach(() => {
            jest.useFakeTimers()
            // mark the current user as inactive
            store = mockStore({activity: fromJS({})})
            pollingManager.store = store
            window.DISABLE_ACTIVITY_POLLING = 'False'
            spy = jest.fn()
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
            pollingManager.start()
            // should set intervals to fetch resources periodically
            expect(setInterval).toHaveBeenCalledTimes(3)
            // should fetch resources immediately
            expect(spy).toHaveBeenCalledTimes(2)
        })

        it('should stop pollings', () => {
            pollingManager.start()
            jest.clearAllTimers()
            pollingManager.stop()
            expect(clearInterval).toHaveBeenCalledTimes(3)
            expect(pollingManager.intervals).toEqual({})
        })
    })
})
