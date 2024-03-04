import {renderHook} from '@testing-library/react-hooks'
import {assumeMock} from 'utils/testing'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useListChannelConnections} from 'models/convert/channelConnection/queries'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {useGetOnboardingStatusMap} from '../useGetOnboardingStatusMap'

jest.mock('pages/common/hooks/useIsConvertSubscriber', () => ({
    useIsConvertSubscriber: jest.fn(),
}))
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)

jest.mock('models/convert/channelConnection/queries', () => ({
    useListChannelConnections: jest.fn(),
}))
const useListChannelConnectionsMock = assumeMock(useListChannelConnections)

const mockChannelConnections = [
    {external_id: '1', is_onboarded: true, is_setup: false},
    {external_id: '2', is_onboarded: false, is_setup: true},
]

describe('useGetOnboardingStatusMap', () => {
    it.each([
        [false, [], {}],
        [true, mockChannelConnections, {'1': true, '2': false}],
        [false, mockChannelConnections, {'1': false, '2': true}],
    ])(
        'should return the onboarding status map correctly',
        (isSubscriber, channelConnections, expectedResult) => {
            useIsConvertSubscriberMock.mockReturnValue(isSubscriber)
            useListChannelConnectionsMock.mockReturnValue({
                data: axiosSuccessResponse(channelConnections),
            } as any)

            const {result} = renderHook(() => useGetOnboardingStatusMap())

            expect(result.current).toEqual(expectedResult)
        }
    )
})
