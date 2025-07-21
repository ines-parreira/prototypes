import useAppDispatch from 'hooks/useAppDispatch'
import { useListChannelConnections } from 'models/convert/channelConnection/queries'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useGetOnboardingStatusMap } from '../useGetOnboardingStatusMap'

jest.mock('pages/common/hooks/useIsConvertSubscriber', () => ({
    useIsConvertSubscriber: jest.fn(),
}))
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)

jest.mock('models/convert/channelConnection/queries', () => ({
    useListChannelConnections: jest.fn(),
}))
const useListChannelConnectionsMock = assumeMock(useListChannelConnections)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

const mockChannelConnections = [
    { external_id: '1', is_onboarded: true, is_setup: false },
    { external_id: '2', is_onboarded: false, is_setup: true },
]

describe('useGetOnboardingStatusMap', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.restoreAllMocks()

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it.each([
        [false, [], {}],
        [true, mockChannelConnections, { '1': true, '2': false }],
        [false, mockChannelConnections, { '1': false, '2': true }],
    ])(
        'should return the onboarding status map correctly',
        (isSubscriber, channelConnections, expectedResult) => {
            useIsConvertSubscriberMock.mockReturnValue(isSubscriber)
            useListChannelConnectionsMock.mockReturnValue({
                data: channelConnections,
            } as any)

            const { result } = renderHook(() => useGetOnboardingStatusMap())

            expect(result.current.onboardingMap).toEqual(expectedResult)
        },
    )
    it('should dispatch an error', () => {
        useIsConvertSubscriberMock.mockReturnValue(true)
        useListChannelConnectionsMock.mockReturnValue({
            data: {},
        } as any)

        renderHook(() => useGetOnboardingStatusMap())

        useListChannelConnectionsMock.mock.calls[0][1]?.onError!(undefined)

        expect(dispatch).toHaveBeenCalled()
    })
})
