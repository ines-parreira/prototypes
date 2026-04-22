import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'

import { skillReducer } from './KnowledgeEditorSkillReducer'
import type { SkillState } from './types'
import { createInitialState } from './types'

const mockArticle = getGuidanceArticleFixture(1)

const createDefaultState = (
    overrides: Partial<SkillState> = {},
): SkillState => ({
    ...createInitialState(undefined, undefined, 'edit'),
    ...overrides,
})

describe('skillReducer', () => {
    it('SET_TITLE updates title', () => {
        const state = createDefaultState({ title: 'Old' })
        const result = skillReducer(state, {
            type: 'SET_TITLE',
            payload: 'New Title',
        })

        expect(result.title).toBe('New Title')
    })

    it('SET_CONTENT updates content', () => {
        const state = createDefaultState({ content: 'Old content' })
        const result = skillReducer(state, {
            type: 'SET_CONTENT',
            payload: 'New content',
        })

        expect(result.content).toBe('New content')
    })

    it('SET_VISIBILITY updates visibility and skill visibility when skill exists', () => {
        const state = createDefaultState({
            visibility: false,
            skill: mockArticle,
        })
        const result = skillReducer(state, {
            type: 'SET_VISIBILITY',
            payload: true,
        })

        expect(result.visibility).toBe(true)
        expect(result.skill?.visibility).toBe(VisibilityStatusEnum.PUBLIC)
    })

    it('SET_VISIBILITY sets skill to undefined when no skill exists', () => {
        const state = createDefaultState({
            visibility: true,
            skill: undefined,
        })
        const result = skillReducer(state, {
            type: 'SET_VISIBILITY',
            payload: false,
        })

        expect(result.visibility).toBe(false)
        expect(result.skill).toBeUndefined()
    })

    it('RESET_FORM resets title, content, visibility and savedSnapshot', () => {
        const state = createDefaultState({
            title: 'Dirty',
            content: 'Dirty content',
            visibility: false,
            isAutoSaving: true,
        })
        const result = skillReducer(state, {
            type: 'RESET_FORM',
            payload: {
                title: 'Clean',
                content: 'Clean content',
                visibility: true,
            },
        })

        expect(result.title).toBe('Clean')
        expect(result.content).toBe('Clean content')
        expect(result.visibility).toBe(true)
        expect(result.savedSnapshot).toEqual({
            title: 'Clean',
            content: 'Clean content',
        })
        expect(result.isAutoSaving).toBe(false)
    })

    it('MARK_AS_SAVED updates savedSnapshot and clears auto-save flags', () => {
        const state = createDefaultState({
            isAutoSaving: true,
            autoSaveError: true,
        })
        const result = skillReducer(state, {
            type: 'MARK_AS_SAVED',
            payload: { title: 'Saved Title', content: 'Saved Content' },
        })

        expect(result.savedSnapshot).toEqual({
            title: 'Saved Title',
            content: 'Saved Content',
        })
        expect(result.isAutoSaving).toBe(false)
        expect(result.hasAutoSavedInSession).toBe(true)
        expect(result.autoSaveError).toBe(false)
    })

    it('MARK_AS_SAVED without payload preserves existing snapshot', () => {
        const state = createDefaultState({
            savedSnapshot: { title: 'Existing', content: 'Existing content' },
            isAutoSaving: true,
        })
        const result = skillReducer(state, {
            type: 'MARK_AS_SAVED',
        })

        expect(result.savedSnapshot).toEqual({
            title: 'Existing',
            content: 'Existing content',
        })
    })

    it('SET_AUTO_SAVING sets isAutoSaving and clears error when true', () => {
        const state = createDefaultState({
            isAutoSaving: false,
            autoSaveError: true,
        })
        const result = skillReducer(state, {
            type: 'SET_AUTO_SAVING',
            payload: true,
        })

        expect(result.isAutoSaving).toBe(true)
        expect(result.autoSaveError).toBe(false)
    })

    it('SET_AUTO_SAVING returns same state when nothing changes', () => {
        const state = createDefaultState({
            isAutoSaving: false,
            autoSaveError: false,
        })
        const result = skillReducer(state, {
            type: 'SET_AUTO_SAVING',
            payload: false,
        })

        expect(result).toBe(state)
    })

    it('SET_AUTO_SAVE_ERROR updates autoSaveError', () => {
        const state = createDefaultState({ autoSaveError: false })
        const result = skillReducer(state, {
            type: 'SET_AUTO_SAVE_ERROR',
            payload: true,
        })

        expect(result.autoSaveError).toBe(true)
    })

    it('SWITCH_VERSION toggles versionStatus and updates skill data', () => {
        const newArticle = getGuidanceArticleFixture(2, {
            title: 'Published',
            content: 'Published content',
            publishedVersionId: 20,
            draftVersionId: 30,
        })
        const state = createDefaultState({
            versionStatus: 'latest_draft',
            mode: 'edit',
        })
        const result = skillReducer(state, {
            type: 'SWITCH_VERSION',
            payload: newArticle,
        })

        expect(result.versionStatus).toBe('current')
        expect(result.skill).toBe(newArticle)
        expect(result.title).toBe('Published')
        expect(result.content).toBe('Published content')
        expect(result.mode).toBe('read')
        expect(result.hasAutoSavedInSession).toBe(false)
        expect(result.historicalVersion).toBeNull()
    })

    it('SWITCH_VERSION sets mode to edit when switching to current and there is no draft', () => {
        const newArticle = getGuidanceArticleFixture(2, {
            publishedVersionId: 20,
            draftVersionId: 20,
        })
        const state = createDefaultState({
            versionStatus: 'latest_draft',
            mode: 'read',
        })
        const result = skillReducer(state, {
            type: 'SWITCH_VERSION',
            payload: newArticle,
        })

        expect(result.versionStatus).toBe('current')
        expect(result.mode).toBe('edit')
    })

    it('SWITCH_VERSION sets mode to edit when switching to latest_draft', () => {
        const newArticle = getGuidanceArticleFixture(2, {
            publishedVersionId: 20,
            draftVersionId: 30,
        })
        const state = createDefaultState({
            versionStatus: 'current',
            mode: 'read',
        })
        const result = skillReducer(state, {
            type: 'SWITCH_VERSION',
            payload: newArticle,
        })

        expect(result.versionStatus).toBe('latest_draft')
        expect(result.mode).toBe('edit')
    })

    it('SWITCH_VERSION updates intents from the new article', () => {
        const newArticle = getGuidanceArticleFixture(2, {
            title: 'Published',
            content: 'Published content',
            intents: ['order::status', 'order::cancel'],
        })
        const state = createDefaultState({
            versionStatus: 'latest_draft',
            intents: ['shipping::delay'],
        })
        const result = skillReducer(state, {
            type: 'SWITCH_VERSION',
            payload: newArticle,
        })

        expect(result.intents).toEqual(['order::status', 'order::cancel'])
    })

    it('SWITCH_SKILL resets to initial state for the new article', () => {
        const state = createDefaultState({
            title: 'Old skill',
            mode: 'edit',
        })
        const newArticle = getGuidanceArticleFixture(3, {
            title: 'New Skill',
            content: 'New content',
        })
        const result = skillReducer(state, {
            type: 'SWITCH_SKILL',
            payload: { article: newArticle, mode: 'read' },
        })

        expect(result.title).toBe('New Skill')
        expect(result.content).toBe('New content')
        expect(result.mode).toBe('read')
    })

    it('CLEAR_HISTORICAL_VERSION restores skill title/content and preserves mode', () => {
        const state = createDefaultState({
            skill: mockArticle,
            title: 'Historical title',
            content: 'Historical content',
            historicalVersion: {
                versionId: 5,
                version: 2,
                title: 'Historical title',
                content: 'Historical content',
                publishedDatetime: '2024-01-01',
                impactDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-02-01',
                },
            },
            mode: 'read',
        })
        const result = skillReducer(state, {
            type: 'CLEAR_HISTORICAL_VERSION',
        })

        expect(result.historicalVersion).toBeNull()
        expect(result.comparisonVersion).toBeNull()
        expect(result.title).toBe(mockArticle.title)
        expect(result.content).toBe(mockArticle.content)
        expect(result.mode).toBe('read')
    })

    it('SET_COMPARISON_VERSION stores comparison data', () => {
        const state = createDefaultState()
        const result = skillReducer(state, {
            type: 'SET_COMPARISON_VERSION',
            payload: {
                title: 'Compare Title',
                content: 'Compare Content',
                intents: [],
            },
        })

        expect(result.comparisonVersion).toEqual({
            title: 'Compare Title',
            content: 'Compare Content',
            intents: [],
        })
    })

    it('SET_MODAL opens and CLOSE_MODAL closes modal', () => {
        const state = createDefaultState()
        const withModal = skillReducer(state, {
            type: 'SET_MODAL',
            payload: 'publish',
        })

        expect(withModal.activeModal).toBe('publish')

        const closed = skillReducer(withModal, { type: 'CLOSE_MODAL' })

        expect(closed.activeModal).toBeNull()
    })

    it('SET_MODE switches mode via base reducer', () => {
        const state = createDefaultState({ mode: 'read' })
        const result = skillReducer(state, {
            type: 'SET_MODE',
            payload: 'edit',
        })

        expect(result.mode).toBe('edit')
    })
})
