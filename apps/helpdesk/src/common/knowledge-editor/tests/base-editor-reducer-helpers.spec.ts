import {
    clearHistoricalVersionUpdates,
    computeTemplateChanges,
    setModeEffects,
    viewHistoricalVersionUpdates,
} from '../state/base-editor-reducer-helpers'

describe('setModeEffects', () => {
    const baseState = {
        hasAutoSavedInSession: true,
        comparisonVersion: { title: 'old', content: 'old content' },
    }

    it('clears hasAutoSavedInSession when switching to read', () => {
        const result = setModeEffects(baseState, 'read')
        expect(result.hasAutoSavedInSession).toBe(false)
    })

    it('clears hasAutoSavedInSession when switching to diff', () => {
        const result = setModeEffects(baseState, 'diff')
        expect(result.hasAutoSavedInSession).toBe(false)
    })

    it('preserves hasAutoSavedInSession when switching to edit', () => {
        const result = setModeEffects(baseState, 'edit')
        expect(result.hasAutoSavedInSession).toBe(true)
    })

    it('preserves comparisonVersion when switching to diff', () => {
        const result = setModeEffects(baseState, 'diff')
        expect(result.comparisonVersion).toBe(baseState.comparisonVersion)
    })

    it('clears comparisonVersion when switching to non-diff mode', () => {
        const result = setModeEffects(baseState, 'edit')
        expect(result.comparisonVersion).toBeNull()
    })
})

describe('viewHistoricalVersionUpdates', () => {
    const payload = {
        id: 42,
        version: 3,
        title: 'V3 Title',
        content: '<p>V3 Content</p>',
        published_datetime: '2025-01-01T00:00:00Z',
        publisher_user_id: 7,
        commit_message: 'Fix typo',
        impactDateRange: {
            start_datetime: '2025-01-01T00:00:00Z',
            end_datetime: '2025-02-01T00:00:00Z',
        },
    }

    it('returns historicalVersion with mapped fields', () => {
        const result = viewHistoricalVersionUpdates(payload)
        expect(result.historicalVersion).toEqual({
            versionId: 42,
            version: 3,
            title: 'V3 Title',
            content: '<p>V3 Content</p>',
            publishedDatetime: '2025-01-01T00:00:00Z',
            publisherUserId: 7,
            commitMessage: 'Fix typo',
            impactDateRange: payload.impactDateRange,
        })
    })

    it('returns title and content at top level', () => {
        const result = viewHistoricalVersionUpdates(payload)
        expect(result.title).toBe('V3 Title')
        expect(result.content).toBe('<p>V3 Content</p>')
    })
})

describe('computeTemplateChanges', () => {
    const baseState = {
        isFromTemplate: true,
        hasTemplateChanges: false,
        savedSnapshot: { title: 'Template Title', content: '<p>Template</p>' },
    }

    it('returns true when title differs from snapshot', () => {
        expect(computeTemplateChanges(baseState, 'title', 'Changed')).toBe(true)
    })

    it('returns false when title matches snapshot', () => {
        expect(
            computeTemplateChanges(baseState, 'title', 'Template Title'),
        ).toBe(false)
    })

    it('returns true when content differs from snapshot', () => {
        expect(
            computeTemplateChanges(baseState, 'content', '<p>Changed</p>'),
        ).toBe(true)
    })

    it('preserves existing hasTemplateChanges even if current field matches', () => {
        const state = { ...baseState, hasTemplateChanges: true }
        expect(computeTemplateChanges(state, 'title', 'Template Title')).toBe(
            true,
        )
    })

    it('returns existing value when not from template', () => {
        const state = {
            ...baseState,
            isFromTemplate: false,
            hasTemplateChanges: false,
        }
        expect(computeTemplateChanges(state, 'title', 'Anything')).toBe(false)
    })
})

describe('clearHistoricalVersionUpdates', () => {
    it('returns null historicalVersion and comparisonVersion', () => {
        const result = clearHistoricalVersionUpdates(
            'Original Title',
            '<p>Original</p>',
        )
        expect(result.historicalVersion).toBeNull()
        expect(result.comparisonVersion).toBeNull()
    })

    it('restores entity title and content', () => {
        const result = clearHistoricalVersionUpdates(
            'Original Title',
            '<p>Original</p>',
        )
        expect(result.title).toBe('Original Title')
        expect(result.content).toBe('<p>Original</p>')
    })
})
