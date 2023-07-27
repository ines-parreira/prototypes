import {PayloadSizeLimitError, verifyPayloadSize} from '../payloadLengthCheck'

function generateMockPayload(sizeInBytes: number): string {
    const repeatingString = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const repetitions = Math.ceil(sizeInBytes / repeatingString.length)
    const payload = repeatingString.repeat(repetitions)

    return payload.substring(0, sizeInBytes)
}
describe('verifyPayloadSize:', () => {
    it('Shourd raise an error of instance PayloadSizeLimitError', () => {
        try {
            verifyPayloadSize(generateMockPayload(1024 * 1024))
        } catch (error) {
            expect(error instanceof PayloadSizeLimitError).toEqual(true)
        }
    })
    it('Shoud return data if size is less than 1MB', () => {
        const payload = generateMockPayload(1024 * 1023)
        const data = verifyPayloadSize(payload)
        expect(data).toEqual(payload)
    })
})
