import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import {
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
        const html = '<p>Use $$$1$$$ here.</p>'
        const actions = [action({ value: '1', enabled: false })]
        expect(hasActionRequiringSetup(html, actions)).toBe(false)
    })

    it('returns false when the referenced action is not in the available list', () => {
        const html = '<p>Use $$$missing$$$ here.</p>'
        expect(hasActionRequiringSetup(html, [])).toBe(false)
    })
})
