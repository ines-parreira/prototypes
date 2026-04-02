import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { createInitialState } from './types'

const mockArticle = {
    id: 1,
    title: 'Existing Skill',
    content: '<p>Existing content</p>',
    visibility: VisibilityStatusEnum.PUBLIC,
} as GuidanceArticle

const mockTemplate = {
    id: 'template-1',
    name: 'Order Status',
    guidance: { content: '<p>Template content</p>' },
} as SkillTemplate

describe('createInitialState', () => {
    it('creates state for a new skill without template', () => {
        const state = createInitialState(undefined, undefined, 'create')

        expect(state.mode).toBe('create')
        expect(state.title).toBe('')
        expect(state.content).toBe('')
        expect(state.visibility).toBe(false)
        expect(state.isFromTemplate).toBe(false)
    })

    it('creates state from an existing article', () => {
        const state = createInitialState(undefined, mockArticle, 'read')

        expect(state.mode).toBe('read')
        expect(state.title).toBe('Existing Skill')
        expect(state.content).toBe('<p>Existing content</p>')
        expect(state.visibility).toBe(true)
        expect(state.skill).toBe(mockArticle)
    })

    it('creates state from a template in create mode', () => {
        const state = createInitialState(mockTemplate, undefined, 'create')

        expect(state.mode).toBe('create')
        expect(state.title).toBe('Order Status')
        expect(state.content).toBe('<p>Template content</p>')
        expect(state.isFromTemplate).toBe(true)
        expect(state.hasTemplateChanges).toBe(false)
    })

    it('sets savedSnapshot matching initial title and content', () => {
        const state = createInitialState(undefined, mockArticle, 'read')

        expect(state.savedSnapshot).toEqual({
            title: 'Existing Skill',
            content: '<p>Existing content</p>',
        })
    })

    it('uses routeState title when no template or article', () => {
        const state = createInitialState(
            undefined,
            undefined,
            'create',
            undefined,
            { title: 'Route Title', intents: ['order::status'] },
        )

        expect(state.title).toBe('Route Title')
    })

    it('prefers template name over routeState title', () => {
        const state = createInitialState(
            mockTemplate,
            undefined,
            'create',
            undefined,
            { title: 'Route Title' },
        )

        expect(state.title).toBe('Order Status')
    })

    it('applies initialVersionData when provided', () => {
        const versionData = {
            versionId: 5,
            version: 2,
            title: 'Historical Title',
            content: '<p>Historical content</p>',
            publishedDatetime: '2024-01-01',
            publisherUserId: 1,
            commitMessage: '',
            impactDateRange: {
                start_datetime: '2024-01-01',
                end_datetime: '2024-02-01',
            },
        }
        const state = createInitialState(
            undefined,
            mockArticle,
            'read',
            versionData,
        )

        expect(state.title).toBe('Historical Title')
        expect(state.content).toBe('<p>Historical content</p>')
        expect(state.mode).toBe('read')
        expect(state.historicalVersion).toBe(versionData)
    })
})
