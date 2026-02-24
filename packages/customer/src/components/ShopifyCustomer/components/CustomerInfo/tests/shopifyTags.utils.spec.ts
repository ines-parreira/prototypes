import {
    buildShopTagOptions,
    extractTagValues,
    formatTagCount,
    parseTags,
    tagsToString,
} from '../shopifyTags.utils'

describe('parseTags', () => {
    it('returns empty array for undefined input', () => {
        expect(parseTags(undefined)).toEqual([])
    })

    it('returns empty array for empty string', () => {
        expect(parseTags('')).toEqual([])
    })

    it('returns empty array for whitespace-only string', () => {
        expect(parseTags('   ')).toEqual([])
    })

    it('parses comma-separated tags', () => {
        expect(parseTags('VIP, Wholesale, Returning')).toEqual([
            'VIP',
            'Wholesale',
            'Returning',
        ])
    })

    it('trims whitespace from tags', () => {
        expect(parseTags('  VIP  ,  Wholesale  ')).toEqual(['VIP', 'Wholesale'])
    })

    it('filters out empty tags', () => {
        expect(parseTags('VIP,,Wholesale,,')).toEqual(['VIP', 'Wholesale'])
    })
})

describe('tagsToString', () => {
    it('joins tags with comma and space', () => {
        expect(tagsToString(['VIP', 'Wholesale'])).toBe('VIP, Wholesale')
    })

    it('returns empty string for empty array', () => {
        expect(tagsToString([])).toBe('')
    })

    it('returns single tag without separator', () => {
        expect(tagsToString(['VIP'])).toBe('VIP')
    })
})

describe('extractTagValues', () => {
    it('returns tag ids unchanged when no __new__ prefix', () => {
        const options = [
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ]
        expect(extractTagValues(options)).toEqual(['VIP', 'Wholesale'])
    })

    it('strips __new__ prefix from tag ids', () => {
        const options = [
            { id: 'VIP', label: 'VIP' },
            { id: '__new__CustomTag', label: 'Add "CustomTag"' },
        ]
        expect(extractTagValues(options)).toEqual(['VIP', 'CustomTag'])
    })

    it('removes duplicate tags', () => {
        const options = [
            { id: 'VIP', label: 'VIP' },
            { id: 'VIP', label: 'VIP' },
        ]
        expect(extractTagValues(options)).toEqual(['VIP'])
    })

    it('handles mixed regular and new tags with potential duplicates', () => {
        const options = [
            { id: 'VIP', label: 'VIP' },
            { id: '__new__VIP', label: 'Add "VIP"' },
        ]
        expect(extractTagValues(options)).toEqual(['VIP'])
    })

    it('returns empty array for empty input', () => {
        expect(extractTagValues([])).toEqual([])
    })
})

describe('formatTagCount', () => {
    it('returns dash for undefined', () => {
        expect(formatTagCount(undefined)).toBe('-')
    })

    it('returns dash for empty string', () => {
        expect(formatTagCount('')).toBe('-')
    })

    it('returns dash for whitespace-only string', () => {
        expect(formatTagCount('   ')).toBe('-')
    })

    it('returns singular for single tag', () => {
        expect(formatTagCount('VIP')).toBe('(1 tag)')
    })

    it('returns plural for multiple tags', () => {
        expect(formatTagCount('VIP, Wholesale, Returning')).toBe('(3 tags)')
    })

    it('handles tags with extra commas and whitespace', () => {
        expect(formatTagCount('VIP,,  , Wholesale, ')).toBe('(2 tags)')
    })
})

describe('buildShopTagOptions', () => {
    it('converts shop tags to options', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], '', [])
        expect(result).toEqual([
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('handles undefined shop tags', () => {
        const result = buildShopTagOptions(undefined, '', [])
        expect(result).toEqual([])
    })

    it('adds "Add X" option when search does not match existing shop tag', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], 'NewTag', [])
        expect(result).toEqual([
            { id: '__new__NewTag', label: 'Add "NewTag"' },
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('does not add "Add X" when search matches shop tag (case insensitive)', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], 'vip', [])
        expect(result).toEqual([
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('does not add "Add X" when search matches existing tag (case insensitive)', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], 'existing', [
            'Existing',
        ])
        expect(result).toEqual([
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('does not add "Add X" when search is empty', () => {
        const result = buildShopTagOptions(['VIP'], '', [])
        expect(result).toEqual([{ id: 'VIP', label: 'VIP' }])
    })

    it('does not add "Add X" when search is whitespace only', () => {
        const result = buildShopTagOptions(['VIP'], '   ', [])
        expect(result).toEqual([{ id: 'VIP', label: 'VIP' }])
    })
})
