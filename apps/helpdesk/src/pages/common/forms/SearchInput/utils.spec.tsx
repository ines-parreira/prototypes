import { ulid } from 'ulidx'

import { getSearchResultUniqueId } from './utils'

jest.mock('ulidx', () => ({
    ulid: jest.fn(),
}))

const mockedUlid = ulid as jest.MockedFunction<typeof ulid>

describe('getSearchResultUniqueId', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return external_id when it is provided', () => {
        const result = {
            id: 123,
            external_id: 'external-id-123',
        }

        const uniqueId = getSearchResultUniqueId(result)

        expect(uniqueId).toBe('external-id-123')
        expect(mockedUlid).not.toHaveBeenCalled()
    })

    it.each([
        [{ id: 123 }, '01HZXKQJ6V9Q5K8R0QXWZM4Y3P', 1],
        [{ id: 123, external_id: undefined }, '01HZXKQJ6V9Q5K8R0QXWZM4Y3P', 1],
        [{ id: 123, external_id: '' }, '01HZXKQJ6V9Q5K8R0QXWZM4Y3P', 1],
    ])(
        'should handle external_id: %p and return %p',
        (result, mockUlidValue, ulidCalls) => {
            mockedUlid.mockReturnValue(mockUlidValue)

            const uniqueId = getSearchResultUniqueId(result)

            expect(uniqueId).toBe(mockUlidValue)
            expect(mockedUlid).toHaveBeenCalledTimes(ulidCalls)
        },
    )
})
