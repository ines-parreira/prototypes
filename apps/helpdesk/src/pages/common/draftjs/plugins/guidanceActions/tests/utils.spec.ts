import { ContentState, EditorState } from 'draft-js'

import {
    attachGuidanceActionEntities,
    replaceActionPlaceholdersWithLabels,
} from '../utils'

describe('attachGuidanceActionEntities', () => {
    const buildUnfocusedState = (text: string) =>
        EditorState.createWithContent(ContentState.createFromText(text))

    it('attaches guidance_action entities to externally-set content without stealing focus', () => {
        const state = buildUnfocusedState('Do $$$01JW674XH7CW5SP7VMHK9KJ3WZ$$$')

        const result = attachGuidanceActionEntities(state)

        const contentState = result.getCurrentContent()
        const block = contentState.getFirstBlock()
        const entityKey = block.getEntityAt(6)
        expect(entityKey).not.toBeNull()
        expect(contentState.getEntity(entityKey).getType()).toBe(
            'guidance_action',
        )
        // Syncing external content must not focus the editor, otherwise it would
        // steal focus from wherever the user actually is.
        expect(result.getSelection().getHasFocus()).toBe(false)
    })

    it('returns the same editor state when there are no guidance actions', () => {
        const state = buildUnfocusedState('No actions here')

        expect(attachGuidanceActionEntities(state)).toBe(state)
    })

    it('is idempotent when entities are already attached', () => {
        const state = buildUnfocusedState('Do $$$01JW674XH7CW5SP7VMHK9KJ3WZ$$$')

        const once = attachGuidanceActionEntities(state)
        const twice = attachGuidanceActionEntities(once)

        expect(twice).toBe(once)
    })
})

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
