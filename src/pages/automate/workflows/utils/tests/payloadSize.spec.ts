import {getPayloadSizeToLimitRate, isPayloadTooLarge} from '../payloadSize'

function generateMockPayload(sizeInBytes: number): string {
    const repeatingString = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const repetitions = Math.ceil(sizeInBytes / repeatingString.length)
    const payload = repeatingString.repeat(repetitions)

    return payload.substring(0, sizeInBytes)
}

const MAX_SIZE_IN_BYTES = 1024 * 1024

describe('getPayloadSizeToLimitRate:', () => {
    it('should return more than 1 if size is more than 1MB', () => {
        const payload = generateMockPayload(1024 * 1025)
        expect(
            getPayloadSizeToLimitRate(payload, MAX_SIZE_IN_BYTES)
        ).toBeGreaterThan(1)
    })
    it('should return less than 1 if size is less than 1MB', () => {
        const payload = generateMockPayload(1024 * 1023)
        expect(
            getPayloadSizeToLimitRate(payload, MAX_SIZE_IN_BYTES)
        ).toBeLessThan(1)
    })
})

describe('isPayloadTooLarge:', () => {
    it('should return true if size is more than 1MB', () => {
        const payload = generateMockPayload(1024 * 1025)
        expect(isPayloadTooLarge(payload, MAX_SIZE_IN_BYTES)).toBe(true)
    })
    it('should return false if size is less than 1MB', () => {
        const payload = generateMockPayload(1024 * 1023)
        expect(isPayloadTooLarge(payload, MAX_SIZE_IN_BYTES)).toBe(false)
    })
})
