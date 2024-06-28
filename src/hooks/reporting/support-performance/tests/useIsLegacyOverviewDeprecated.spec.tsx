import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {useIsLegacyOverviewDeprecated} from 'hooks/reporting/support-performance/useIsLegacyOverviewDeprecated'
import {user as currentUserFixture} from 'fixtures/users'

const mockStore = configureMockStore([thunk])

describe('useIsLegacyOverviewDeprecated', () => {
    const userState = {currentUser: fromJS(currentUserFixture)}

    it('should return true when the date has passed', () => {
        const date = '2024-07-01T00:00:00.000-07:00'
        Date.now = () => new Date(date).valueOf()

        const {result} = renderHook(() => useIsLegacyOverviewDeprecated(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(userState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual(true)
    })

    it('should return false when the date is ahead of time', () => {
        const date = '2024-06-30T00:00:00.000-07:00'
        Date.now = () => new Date(date).valueOf()

        const {result} = renderHook(() => useIsLegacyOverviewDeprecated(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(userState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual(false)
    })

    it('should use PST midnight even in different timezones', () => {
        const userState = {
            currentUser: fromJS({
                ...currentUserFixture,
                timezone: 'Australia/Sydney',
            }),
        }
        const date = '2024-07-01T00:00:00.000+10:00'
        Date.now = () => new Date(date).valueOf()

        const {result} = renderHook(() => useIsLegacyOverviewDeprecated(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(userState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual(false)
    })
})
