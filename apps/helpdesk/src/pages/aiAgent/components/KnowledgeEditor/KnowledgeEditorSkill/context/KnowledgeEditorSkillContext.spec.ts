import {
    canEdit,
    hasDraft,
    hasPendingChanges,
    isFormValid,
} from './KnowledgeEditorSkillContext'
import { createInitialState } from './types'

describe('KnowledgeEditorSkillContext utility functions', () => {
    it('isFormValid returns true when title, content, and intents are provided', () => {
        const state = createInitialState(undefined, undefined, 'create')
        const validState = {
            ...state,
            title: 'Title',
            content: 'Content',
            intents: ['intent-1'],
        }

        expect(isFormValid(validState)).toBe(true)
    })

    it('isFormValid returns false when intents are empty', () => {
        const state = createInitialState(undefined, undefined, 'create')
        const invalidState = {
            ...state,
            title: 'Title',
            content: 'Content',
            intents: [],
        }

        expect(isFormValid(invalidState)).toBe(false)
    })

    it('isFormValid returns false when title is empty', () => {
        const state = createInitialState(undefined, undefined, 'create')
        const invalidState = { ...state, title: '', content: 'Content' }

        expect(isFormValid(invalidState)).toBe(false)
    })

    it('hasPendingChanges returns false for a fresh state', () => {
        const state = createInitialState(undefined, undefined, 'create')

        expect(hasPendingChanges(state)).toBe(false)
    })

    it('hasDraft returns false when there is no skill', () => {
        const state = createInitialState(undefined, undefined, 'create')

        expect(hasDraft(state)).toBe(false)
    })

    it('canEdit returns false when there is no skill', () => {
        const state = createInitialState(undefined, undefined, 'create')

        expect(canEdit(state)).toBe(false)
    })
})
