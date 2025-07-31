import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { isAdmin } from 'utils'

import useIsOnboardingHidden from '../useIsOnboardingHidden'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { OnboardingWidgetClicked: 'onboarding-widget-clicked' },
}))

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('services/common/utils', () => ({
    tryLocalStorage: (fn: (arg?: any) => any): any => fn(),
}))

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('utils', () => ({
    isAdmin: jest.fn(),
}))
const isAdminMock = isAdmin as jest.Mock

const systemTime = new Date('2024-03-22T16:42:00')

describe('useIsOnboardingHidden', () => {
    let getItemSpy: jest.SpyInstance
    let setItemSpy: jest.SpyInstance

    beforeEach(() => {
        isAdminMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(
            fromJS({
                created_datetime: moment(systemTime),
            }),
        )

        getItemSpy = jest
            .spyOn(Storage.prototype, 'getItem')
            .mockReturnValue('')
        setItemSpy = jest.spyOn(Storage.prototype, 'setItem')

        jest.useFakeTimers()
        jest.setSystemTime(systemTime)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should be hidden if the user is not an admin', () => {
        const { result } = renderHook(() => useIsOnboardingHidden())
        expect(result.current).toEqual([true, expect.any(Function)])
    })

    it('should be hidden if the hideBoarding flag is set in localstorage', () => {
        isAdminMock.mockReturnValue(true)
        getItemSpy.mockReturnValue('true')

        const { result } = renderHook(() => useIsOnboardingHidden())
        expect(result.current).toEqual([true, expect.any(Function)])
    })

    it('should be hidden if the user was created more than 10 days ago', () => {
        isAdminMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(
            fromJS({ created_datetime: new Date('2024-03-11T00:00:00') }),
        )

        const { result } = renderHook(() => useIsOnboardingHidden())

        expect(result.current).toEqual([true, expect.any(Function)])
    })

    it('should not be hidden if nothing is causing it to be so', () => {
        isAdminMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(
            fromJS({ created_datetime: new Date('2024-03-20T00:00:00') }),
        )

        const { result } = renderHook(() => useIsOnboardingHidden())

        expect(result.current).toEqual([false, expect.any(Function)])
    })

    it('should hide the onboarding when `onHide` is called', () => {
        isAdminMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(
            fromJS({ created_datetime: new Date('2024-03-20T00:00:00') }),
        )

        const { result } = renderHook(() => useIsOnboardingHidden())

        act(() => {
            result.current[1]()
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.OnboardingWidgetClicked,
            { name: 'Hide' },
        )
        expect(setItemSpy).toHaveBeenCalledWith('hideBoarding', 'true')
        expect(result.current).toEqual([true, expect.any(Function)])
    })
})
