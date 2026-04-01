import {
    canEdit,
    hasDraft,
    hasPendingChanges,
    isFormValid,
} from '../utils/editor-state'

describe('hasPendingChanges', () => {
    const baseState = {
        title: 'Original',
        content: '<p>Original content</p>',
        savedSnapshot: {
            title: 'Original',
            content: '<p>Original content</p>',
        },
    }

    it('returns false when in read mode', () => {
        expect(hasPendingChanges({ ...baseState, mode: 'read' })).toBe(false)
    })

    it('returns false when in diff mode', () => {
        expect(hasPendingChanges({ ...baseState, mode: 'diff' })).toBe(false)
    })

    it('returns false when title and content match snapshot', () => {
        expect(hasPendingChanges({ ...baseState, mode: 'edit' })).toBe(false)
    })

    it('returns true when title differs from snapshot', () => {
        expect(
            hasPendingChanges({
                ...baseState,
                mode: 'edit',
                title: 'Changed title',
            }),
        ).toBe(true)
    })

    it('returns true when content differs from snapshot', () => {
        expect(
            hasPendingChanges({
                ...baseState,
                mode: 'edit',
                content: '<p>Changed content</p>',
            }),
        ).toBe(true)
    })

    it('ignores leading/trailing whitespace in title comparison', () => {
        expect(
            hasPendingChanges({
                ...baseState,
                mode: 'edit',
                title: '  Original  ',
            }),
        ).toBe(false)
    })

    it('returns true in create mode when content differs', () => {
        expect(
            hasPendingChanges({
                ...baseState,
                mode: 'create',
                content: '<p>New content</p>',
            }),
        ).toBe(true)
    })
})

describe('isFormValid', () => {
    it('returns true when title and content are non-empty', () => {
        expect(isFormValid({ title: 'Title', content: '<p>Content</p>' })).toBe(
            true,
        )
    })

    it('returns false when title is empty', () => {
        expect(isFormValid({ title: '', content: '<p>Content</p>' })).toBe(
            false,
        )
    })

    it('returns false when title is whitespace-only', () => {
        expect(isFormValid({ title: '   ', content: '<p>Content</p>' })).toBe(
            false,
        )
    })

    it('returns false when content is empty', () => {
        expect(isFormValid({ title: 'Title', content: '' })).toBe(false)
    })

    it('returns false when content is whitespace-only', () => {
        expect(isFormValid({ title: 'Title', content: '   ' })).toBe(false)
    })

    it('uses extraValidator when provided', () => {
        const alwaysFails = () => false
        expect(
            isFormValid(
                { title: 'Title', content: '<p>Content</p>' },
                alwaysFails,
            ),
        ).toBe(false)
    })

    it('skips extraValidator when base validation fails', () => {
        const validator = jest.fn(() => true)
        isFormValid({ title: '', content: '' }, validator)
        expect(validator).not.toHaveBeenCalled()
    })
})

describe('hasDraft', () => {
    it('returns false for undefined entity', () => {
        expect(hasDraft(undefined)).toBe(false)
    })

    it('returns false for null entity', () => {
        expect(hasDraft(null)).toBe(false)
    })

    it('returns true when publishedVersionId is null', () => {
        expect(hasDraft({ draftVersionId: 1, publishedVersionId: null })).toBe(
            true,
        )
    })

    it('returns true when draftVersionId differs from publishedVersionId', () => {
        expect(hasDraft({ draftVersionId: 2, publishedVersionId: 1 })).toBe(
            true,
        )
    })

    it('returns false when draftVersionId equals publishedVersionId', () => {
        expect(hasDraft({ draftVersionId: 1, publishedVersionId: 1 })).toBe(
            false,
        )
    })
})

describe('canEdit', () => {
    it('returns false for undefined entity', () => {
        expect(canEdit(undefined)).toBe(false)
    })

    it('returns false for null entity', () => {
        expect(canEdit(null)).toBe(false)
    })

    it('returns false when isCurrent is true and entity has a draft', () => {
        expect(
            canEdit({
                isCurrent: true,
                draftVersionId: 2,
                publishedVersionId: 1,
            }),
        ).toBe(false)
    })

    it('returns true when isCurrent is true but no draft exists', () => {
        expect(
            canEdit({
                isCurrent: true,
                draftVersionId: 1,
                publishedVersionId: 1,
            }),
        ).toBe(true)
    })

    it('returns true when isCurrent is false', () => {
        expect(
            canEdit({
                isCurrent: false,
                draftVersionId: 2,
                publishedVersionId: 1,
            }),
        ).toBe(true)
    })

    it('returns true when isCurrent is undefined', () => {
        expect(canEdit({ draftVersionId: 2, publishedVersionId: 1 })).toBe(true)
    })
})
