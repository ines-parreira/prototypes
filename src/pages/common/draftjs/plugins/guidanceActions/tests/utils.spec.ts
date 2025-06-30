import { replaceActionPlaceholdersWithLabels } from '../utils'

describe('replaceActionPlaceholdersWithLabels', () => {
    it('should replace action placeholders with labels', () => {
        const content =
            '$$$01JW674XH7CW5SP7VMHK9KJ3WZ$$$ $$$01JV61ETYEC8TCGQGDHQKERQVV$$$'
        const actions = [
            { name: 'Get Subscriptions', value: '01JW674XH7CW5SP7VMHK9KJ3WZ' },
            {
                name: 'Update shipping address',
                value: '01JV61ETYEC8TCGQGDHQKERQVV',
            },
        ]
        const result = replaceActionPlaceholdersWithLabels(content, actions)
        expect(result).toBe(
            'Use action: Get Subscriptions Use action: Update shipping address',
        )
    })

    it('should handle unknown actions', () => {
        const content =
            '$$$01JW674XH7CW5SP7VMHK9KJ3WZ$$$ $$$01JV61ETYEC8TCGQGDHQKERQVV$$$'
        const actions: any = []
        const result = replaceActionPlaceholdersWithLabels(content, actions)
        expect(result).toBe(
            'Use action: 01JW674XH7CW5SP7VMHK9KJ3WZ Use action: 01JV61ETYEC8TCGQGDHQKERQVV',
        )
    })

    it('should return the original content if no actions are provided', () => {
        const content = 'No actions here'
        const result = replaceActionPlaceholdersWithLabels(content, [])
        expect(result).toBe(content)
    })

    it('should handle empty content', () => {
        const result = replaceActionPlaceholdersWithLabels('', [])
        expect(result).toBe('')
    })
})
