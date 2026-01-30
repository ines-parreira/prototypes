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

    it.each([['customer_reference'], ['company_reference'], ['id'], ['link']])(
        'should filter out fields with type %s',
        (excludedType) => {
            const metafields = [
                { key: 'excluded', value: 'test', type: excludedType },
                {
                    key: 'included',
                    value: 'test',
                    type: 'single_line_text_field',
                },
            ]
            const response = { data: { data: metafields } }

            const result = getMetafieldsFromResponse(response)

            expect(result).toEqual([
                {
                    key: 'included',
                    value: 'test',
                    type: 'single_line_text_field',
                },
            ])
        },
    )

    it('should filter out multiple excluded types from response', () => {
        const metafields = [
            { key: 'ref1', value: 'test', type: 'customer_reference' },
            { key: 'text', value: 'hello', type: 'single_line_text_field' },
            { key: 'ref2', value: 'test', type: 'company_reference' },
            { key: 'number', value: '42', type: 'number_integer' },
            { key: 'idField', value: 'test', type: 'id' },
            { key: 'linkField', value: 'test', type: 'link' },
        ]
        const response = { data: { data: metafields } }

        const result = getMetafieldsFromResponse(response)

        expect(result).toEqual([
            { key: 'text', value: 'hello', type: 'single_line_text_field' },
            { key: 'number', value: '42', type: 'number_integer' },
        ])
    })

    it('should return empty array when all fields have excluded types', () => {
        const metafields = [
            { key: 'ref1', value: 'test', type: 'customer_reference' },
            { key: 'ref2', value: 'test', type: 'company_reference' },
            { key: 'idField', value: 'test', type: 'id' },
            { key: 'linkField', value: 'test', type: 'link' },
        ]
        const response = { data: { data: metafields } }

        const result = getMetafieldsFromResponse(response)

        expect(result).toEqual([])
    })
})
