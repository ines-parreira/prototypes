import { fromJS } from 'immutable'

import { getMetafieldsFromSource } from '../getMetafieldsFromSource'

describe('getMetafieldsFromSource()', () => {
    it('should return metafields array when source has metafields', () => {
        const metafields = [
            { key: 'color', value: 'blue', type: 'single_line_text_field' },
            { key: 'size', value: 'large', type: 'single_line_text_field' },
        ]
        const source = fromJS({ metafields })

        const result = getMetafieldsFromSource(source)

        expect(result).toEqual(metafields)
    })

    it.each([
        ['source is undefined', undefined],
        ['source is null', null],
        ['source has no metafields key', fromJS({ id: 123, name: 'Test' })],
        ['metafields value is undefined', fromJS({ metafields: undefined })],
    ])('should return undefined when %s', (_, source) => {
        const result = getMetafieldsFromSource(source)

        expect(result).toBeUndefined()
    })

    describe('value normalization', () => {
        it('should parse JSON string values to objects', () => {
            const metafields = [
                {
                    key: 'test_rating',
                    value: '{"scale_min":"1.0","scale_max":"5.0","value":"3.0"}',
                    type: 'rating',
                },
            ]
            const source = fromJS({ metafields })

            const result = getMetafieldsFromSource(source)

            expect(result).toEqual([
                {
                    key: 'test_rating',
                    value: { scale_min: '1.0', scale_max: '5.0', value: '3.0' },
                    type: 'rating',
                },
            ])
        })

        it('should keep plain string values unchanged', () => {
            const metafields = [
                {
                    key: 'color',
                    value: 'blue',
                    type: 'single_line_text_field',
                },
            ]
            const source = fromJS({ metafields })

            const result = getMetafieldsFromSource(source)

            expect(result).toEqual([
                {
                    key: 'color',
                    value: 'blue',
                    type: 'single_line_text_field',
                },
            ])
        })

        it('should keep object values unchanged', () => {
            const metafields = [
                {
                    key: 'test_rating',
                    value: { scale_min: '1.0', scale_max: '5.0', value: '3.0' },
                    type: 'rating',
                },
            ]
            const source = fromJS({ metafields })

            const result = getMetafieldsFromSource(source)

            expect(result).toEqual([
                {
                    key: 'test_rating',
                    value: { scale_min: '1.0', scale_max: '5.0', value: '3.0' },
                    type: 'rating',
                },
            ])
        })

        it('should keep boolean values unchanged', () => {
            const metafields = [
                { key: 'is_active', value: true, type: 'boolean' },
            ]
            const source = fromJS({ metafields })

            const result = getMetafieldsFromSource(source)

            expect(result).toEqual([
                { key: 'is_active', value: true, type: 'boolean' },
            ])
        })

        it('should parse stringified boolean values', () => {
            const metafields = [
                { key: 'is_active', value: 'true', type: 'boolean' },
            ]
            const source = fromJS({ metafields })

            const result = getMetafieldsFromSource(source)

            expect(result).toEqual([
                { key: 'is_active', value: true, type: 'boolean' },
            ])
        })
    })
})
