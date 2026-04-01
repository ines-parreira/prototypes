import { baseEditorReducer } from '../state/base-editor-reducer'
import type { BaseEditorState } from '../types/base-editor-state'
import type { BaseEditorAction } from '../types/editor-actions'

type TestModal = 'publish' | 'delete' | null
type TestState = BaseEditorState<TestModal>

const createTestState = (overrides: Partial<TestState> = {}): TestState => ({
    mode: 'read',
    isFullscreen: false,
    isDetailsView: true,
    title: 'Test Title',
    content: '<p>Test Content</p>',
    savedSnapshot: { title: 'Test Title', content: '<p>Test Content</p>' },
    isAutoSaving: false,
    hasAutoSavedInSession: false,
    versionStatus: 'latest_draft',
    historicalVersion: null,
    comparisonVersion: null,
    activeModal: null,
    isUpdating: false,
    ...overrides,
})

describe('baseEditorReducer', () => {
    describe('SET_MODE', () => {
        it('sets the mode', () => {
            const state = createTestState({ mode: 'read' })
            const result = baseEditorReducer(state, {
                type: 'SET_MODE',
                payload: 'edit',
            })
            expect(result.mode).toBe('edit')
        })

        it('clears hasAutoSavedInSession when switching to read', () => {
            const state = createTestState({
                mode: 'edit',
                hasAutoSavedInSession: true,
            })
            const result = baseEditorReducer(state, {
                type: 'SET_MODE',
                payload: 'read',
            })
            expect(result.hasAutoSavedInSession).toBe(false)
        })

        it('preserves comparisonVersion when switching to diff', () => {
            const comparison = { title: 'old', content: 'old content' }
            const state = createTestState({ comparisonVersion: comparison })
            const result = baseEditorReducer(state, {
                type: 'SET_MODE',
                payload: 'diff',
            })
            expect(result.comparisonVersion).toBe(comparison)
        })

        it('clears comparisonVersion when switching to non-diff mode', () => {
            const comparison = { title: 'old', content: 'old content' }
            const state = createTestState({ comparisonVersion: comparison })
            const result = baseEditorReducer(state, {
                type: 'SET_MODE',
                payload: 'read',
            })
            expect(result.comparisonVersion).toBeNull()
        })
    })

    describe('SET_FULLSCREEN / TOGGLE_FULLSCREEN', () => {
        it('sets fullscreen', () => {
            const state = createTestState({ isFullscreen: false })
            const result = baseEditorReducer(state, {
                type: 'SET_FULLSCREEN',
                payload: true,
            })
            expect(result.isFullscreen).toBe(true)
        })

        it('toggles fullscreen', () => {
            const state = createTestState({ isFullscreen: false })
            const result = baseEditorReducer(state, {
                type: 'TOGGLE_FULLSCREEN',
            })
            expect(result.isFullscreen).toBe(true)
        })
    })

    describe('SET_DETAILS_VIEW / TOGGLE_DETAILS_VIEW', () => {
        it('sets details view', () => {
            const state = createTestState({ isDetailsView: true })
            const result = baseEditorReducer(state, {
                type: 'SET_DETAILS_VIEW',
                payload: false,
            })
            expect(result.isDetailsView).toBe(false)
        })

        it('toggles details view', () => {
            const state = createTestState({ isDetailsView: true })
            const result = baseEditorReducer(state, {
                type: 'TOGGLE_DETAILS_VIEW',
            })
            expect(result.isDetailsView).toBe(false)
        })
    })

    describe('SET_TITLE / SET_CONTENT', () => {
        it('sets title', () => {
            const state = createTestState()
            const result = baseEditorReducer(state, {
                type: 'SET_TITLE',
                payload: 'New Title',
            })
            expect(result.title).toBe('New Title')
        })

        it('sets content', () => {
            const state = createTestState()
            const result = baseEditorReducer(state, {
                type: 'SET_CONTENT',
                payload: '<p>New</p>',
            })
            expect(result.content).toBe('<p>New</p>')
        })
    })

    describe('SET_AUTO_SAVING', () => {
        it('sets auto saving', () => {
            const state = createTestState({ isAutoSaving: false })
            const result = baseEditorReducer(state, {
                type: 'SET_AUTO_SAVING',
                payload: true,
            })
            expect(result.isAutoSaving).toBe(true)
        })

        it('returns same reference when value unchanged', () => {
            const state = createTestState({ isAutoSaving: false })
            const result = baseEditorReducer(state, {
                type: 'SET_AUTO_SAVING',
                payload: false,
            })
            expect(result).toBe(state)
        })
    })

    describe('SET_MODAL / CLOSE_MODAL', () => {
        it('sets modal', () => {
            const state = createTestState()
            const result = baseEditorReducer(state, {
                type: 'SET_MODAL',
                payload: 'publish',
            } as BaseEditorAction<TestModal>)
            expect(result.activeModal).toBe('publish')
        })

        it('closes modal', () => {
            const state = createTestState({ activeModal: 'publish' })
            const result = baseEditorReducer(state, { type: 'CLOSE_MODAL' })
            expect(result.activeModal).toBeNull()
        })
    })

    describe('SET_UPDATING', () => {
        it('sets updating', () => {
            const state = createTestState({ isUpdating: false })
            const result = baseEditorReducer(state, {
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(result.isUpdating).toBe(true)
        })

        it('returns same reference when value unchanged', () => {
            const state = createTestState({ isUpdating: false })
            const result = baseEditorReducer(state, {
                type: 'SET_UPDATING',
                payload: false,
            })
            expect(result).toBe(state)
        })
    })

    describe('SET_COMPARISON_VERSION', () => {
        it('sets comparison version', () => {
            const state = createTestState()
            const result = baseEditorReducer(state, {
                type: 'SET_COMPARISON_VERSION',
                payload: { title: 'Old', content: 'Old content' },
            })
            expect(result.comparisonVersion).toEqual({
                title: 'Old',
                content: 'Old content',
            })
        })
    })

    describe('unknown action', () => {
        it('returns state unchanged', () => {
            const state = createTestState()
            const result = baseEditorReducer(state, {
                type: 'UNKNOWN_ACTION',
            } as unknown as BaseEditorAction<TestModal>)
            expect(result).toBe(state)
        })
    })
})
