import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import {
    getDisabledActionIds,
    hasActionRequiringSetup,
    isInstructionsEmpty,
} from './skillReviewValidation.utils'

describe('isInstructionsEmpty', () => {
    it('returns true for empty string', () => {
        expect(isInstructionsEmpty('')).toBe(true)
    })

    it('returns true when only HTML tags and whitespace remain', () => {
        expect(isInstructionsEmpty('<p></p>')).toBe(true)
        expect(isInstructionsEmpty('<p>   </p>')).toBe(true)
        expect(isInstructionsEmpty('<p>&nbsp;</p>')).toBe(true)
    })

    it('returns false when there is meaningful text', () => {
        expect(isInstructionsEmpty('<p>Hello</p>')).toBe(false)
    })
})

const action = (overrides: Partial<GuidanceAction>): GuidanceAction => ({
    name: 'Action',
    value: '1',
    enabled: true,
    requiresAuth: false,
    hasMissingValues: false,
    ...overrides,
})

describe('hasActionRequiringSetup', () => {
    it('returns false when content has no action markers', () => {
        expect(hasActionRequiringSetup('<p>Hello</p>', [])).toBe(false)
    })

    it('returns true when a referenced action requires auth', () => {
        const html = '<p>Use $$$1$$$ here.</p>'
        const actions = [action({ value: '1', requiresAuth: true })]
        expect(hasActionRequiringSetup(html, actions)).toBe(true)
    })

    it('returns true when a referenced action has missing values', () => {
        const html = '<p>Use $$$1$$$ here.</p>'
        const actions = [action({ value: '1', hasMissingValues: true })]
        expect(hasActionRequiringSetup(html, actions)).toBe(true)
    })

    it('returns false when the only issue is the action being disabled', () => {
        // Disabled actions can be auto-enabled on Apply, so they don't force
        // a skill to draft during review.
        const html = '<p>Use $$$1$$$ here.</p>'
        const actions = [action({ value: '1', enabled: false })]
        expect(hasActionRequiringSetup(html, actions)).toBe(false)
    })

    it('returns false when the referenced action is not in the available list', () => {
        const html = '<p>Use $$$missing$$$ here.</p>'
        expect(hasActionRequiringSetup(html, [])).toBe(false)
    })
})

describe('getDisabledActionIds', () => {
    it('returns the IDs of actions that are disabled', () => {
        const html = '<p>$$$1$$$ $$$2$$$ $$$3$$$ $$$4$$$</p>'
        const actions = [
            action({ value: '1', enabled: false }),
            action({ value: '2', requiresAuth: true }),
            action({ value: '3' }),
            action({ value: '4', enabled: false }),
        ]
        // Only enabled === false actions are surfaced; requiresAuth +
        // hasMissingValues are handled upstream by the review step.
        expect(getDisabledActionIds(html, actions)).toEqual(['1', '4'])
    })

    it('deduplicates repeated references in document order', () => {
        const html = '<p>$$$1$$$ $$$2$$$ $$$1$$$</p>'
        const actions = [
            action({ value: '1', enabled: false }),
            action({ value: '2', enabled: false }),
        ]
        expect(getDisabledActionIds(html, actions)).toEqual(['1', '2'])
    })

    it('returns an empty array when no referenced action is disabled', () => {
        const html = '<p>$$$1$$$</p>'
        expect(getDisabledActionIds(html, [action({ value: '1' })])).toEqual([])
    })

    it('returns an empty array for empty html', () => {
        expect(getDisabledActionIds('', [])).toEqual([])
    })
})
