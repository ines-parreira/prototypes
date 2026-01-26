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
})
