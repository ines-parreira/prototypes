import { getMetafieldsFromResponse } from '../getMetafieldsFromResponse'

describe('getMetafieldsFromResponse()', () => {
    it('should return metafields array when response has nested data', () => {
        const metafields = [
            { key: 'color', value: 'blue', type: 'single_line_text_field' },
            { key: 'size', value: 'large', type: 'single_line_text_field' },
        ]
        const response = { data: { data: metafields } }

        const result = getMetafieldsFromResponse(response)

        expect(result).toEqual(metafields)
    })

    it.each([
        ['response is undefined', undefined],
        ['response is null', null],
        ['response has no data property', {}],
        ['response.data is undefined', { data: undefined }],
        ['response.data.data is undefined', { data: { data: undefined } }],
    ])('should return undefined when %s', (_, response) => {
        const result = getMetafieldsFromResponse(response)

        expect(result).toBeUndefined()
    })
})
