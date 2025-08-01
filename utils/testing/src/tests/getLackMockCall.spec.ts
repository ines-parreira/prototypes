import { getLastMockCall } from '../getLastMockCall'

describe('getLastMockCall', () => {
    it('should return the last array in mock.calls', () => {
        const myLastParams = ['foo', 'bar']
        const mockedStuff = {
            mock: {
                calls: [[], myLastParams],
            },
        } as jest.MockedFunction<any>
        expect(getLastMockCall(mockedStuff)).toBe(myLastParams)
    })
})
