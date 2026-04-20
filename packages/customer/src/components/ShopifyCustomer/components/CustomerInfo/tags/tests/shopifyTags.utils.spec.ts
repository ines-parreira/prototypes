import {
    addTagToList,
    buildShopTagOptions,
    canCreateTag,
    deduplicateTagIds,
    extractTagValues,
    formatTagCount,
    parseTags,
    removeTagFromList,
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
        const result = buildShopTagOptions(['VIP', 'Wholesale'], '')
        expect(result).toEqual([
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('handles undefined shop tags', () => {
        const result = buildShopTagOptions(undefined, '')
        expect(result).toEqual([])
    })

    it('filters options by search term', () => {
        const result = buildShopTagOptions(
            ['VIP', 'Wholesale', 'Returning'],
            'Wholesale',
        )
        expect(result).toEqual([{ id: 'Wholesale', label: 'Wholesale' }])
    })

    it('filters case-insensitively', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], 'vip')
        expect(result).toEqual([{ id: 'VIP', label: 'VIP' }])
    })

    it('returns all options when search is empty', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], '')
        expect(result).toEqual([
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('returns all options when search is whitespace only', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], '   ')
        expect(result).toEqual([
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ])
    })

    it('returns empty when no tags match search', () => {
        const result = buildShopTagOptions(['VIP', 'Wholesale'], 'NewTag')
        expect(result).toEqual([])
    })
})

describe('canCreateTag', () => {
    it('returns true when search does not match any shop or existing tag', () => {
        expect(canCreateTag('NewTag', ['VIP', 'Wholesale'], [])).toBe(true)
    })

    it('returns false when search matches a shop tag (case insensitive)', () => {
        expect(canCreateTag('vip', ['VIP', 'Wholesale'], [])).toBe(false)
    })

    it('returns false when search matches an existing tag (case insensitive)', () => {
        expect(
            canCreateTag('existing', ['VIP', 'Wholesale'], ['Existing']),
        ).toBe(false)
    })

    it('returns false when search is empty', () => {
        expect(canCreateTag('', ['VIP'], [])).toBe(false)
    })

    it('returns false when search is whitespace only', () => {
        expect(canCreateTag('   ', ['VIP'], [])).toBe(false)
    })
})

describe('deduplicateTagIds', () => {
    it('returns unique ids from options', () => {
        const options = [
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ]
        expect(deduplicateTagIds(options)).toEqual(['VIP', 'Wholesale'])
    })

    it('deduplicates repeated ids', () => {
        const options = [
            { id: 'VIP', label: 'VIP' },
            { id: 'VIP', label: 'VIP' },
            { id: 'Wholesale', label: 'Wholesale' },
        ]
        expect(deduplicateTagIds(options)).toEqual(['VIP', 'Wholesale'])
    })

    it('returns empty array for empty input', () => {
        expect(deduplicateTagIds([])).toEqual([])
    })

    it('preserves first occurrence order', () => {
        const options = [
            { id: 'B', label: 'B' },
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
        ]
        expect(deduplicateTagIds(options)).toEqual(['B', 'A'])
    })
})

describe('addTagToList', () => {
    it('adds new tag to existing list', () => {
        expect(addTagToList(['VIP', 'Wholesale'], 'Returning')).toEqual([
            'VIP',
            'Wholesale',
            'Returning',
        ])
    })

    it('deduplicates when tag already exists', () => {
        expect(addTagToList(['VIP', 'Wholesale'], 'VIP')).toEqual([
            'VIP',
            'Wholesale',
        ])
    })

    it('works with empty existing list', () => {
        expect(addTagToList([], 'VIP')).toEqual(['VIP'])
    })

    it('preserves existing tags', () => {
        expect(addTagToList(['A', 'B'], 'C')).toEqual(['A', 'B', 'C'])
    })
})

describe('removeTagFromList', () => {
    it('removes specified tag', () => {
        expect(removeTagFromList(['VIP', 'Wholesale'], 'VIP')).toEqual([
            'Wholesale',
        ])
    })

    it('returns same list when tag not found', () => {
        expect(removeTagFromList(['VIP', 'Wholesale'], 'Returning')).toEqual([
            'VIP',
            'Wholesale',
        ])
    })

    it('returns empty array when removing last tag', () => {
        expect(removeTagFromList(['VIP'], 'VIP')).toEqual([])
    })

    it('returns empty array for empty input', () => {
        expect(removeTagFromList([], 'VIP')).toEqual([])
    })
})
