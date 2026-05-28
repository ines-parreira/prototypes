import { useEffect } from 'react'
import { render } from '@repo/testing'

import type { HelpCenter } from 'models/helpCenter/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import {
    canEdit,
    hasDraft,
    hasPendingChanges,
    isFormValid,
    KnowledgeEditorSkillProvider,
    useSkillEditorStoreApi,
} from './KnowledgeEditorSkillContext'
import { createInitialState } from './types'
import type { SkillContextConfig } from './types'

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

describe('KnowledgeEditorSkillContext sync effects', () => {
    const mockHelpCenter = { id: 1 } as HelpCenter

    const makeArticle = (overrides: Partial<GuidanceArticle> = {}) =>
        ({
            id: 42,
            title: 'Original title',
            content: '<p>Original content</p>',
            visibility: VisibilityStatusEnum.PUBLIC,
            intents: ['intent-a'],
            isCurrent: true,
            draftVersionId: 1,
            publishedVersionId: 1,
            lastUpdated: '2026-01-01T00:00:00Z',
            createdDatetime: '2026-01-01T00:00:00Z',
            templateKey: null,
            ...overrides,
        }) as GuidanceArticle

    const makeConfig = (skill: GuidanceArticle): SkillContextConfig => ({
        shopName: 'shop',
        shopType: 'shopify',
        skill,
        initialMode: 'edit',
        helpCenter: mockHelpCenter,
        onClose: () => {},
    })

    type StoreApi = ReturnType<typeof useSkillEditorStoreApi>

    const renderProvider = (article: GuidanceArticle) => {
        const storeRef: { current: StoreApi | null } = { current: null }

        const Capture = () => {
            const api = useSkillEditorStoreApi()
            useEffect(() => {
                storeRef.current = api
            }, [api])
            return null
        }

        const ui = (config: SkillContextConfig) => (
            <KnowledgeEditorSkillProvider config={config}>
                <Capture />
            </KnowledgeEditorSkillProvider>
        )

        const { rerender } = render(ui(makeConfig(article)))

        return {
            storeRef,
            rerender: (nextArticle: GuidanceArticle) =>
                rerender(ui(makeConfig(nextArticle))),
        }
    }

    it('re-syncs editor state when the same skill id arrives with new title and content', () => {
        const original = makeArticle()
        const { storeRef, rerender } = renderProvider(original)

        expect(storeRef.current?.getState().state.title).toBe('Original title')

        rerender(
            makeArticle({
                title: 'Updated title',
                content: '<p>Updated content</p>',
            }),
        )

        const nextState = storeRef.current?.getState().state
        expect(nextState?.title).toBe('Updated title')
        expect(nextState?.content).toBe('<p>Updated content</p>')
    })

    it('does not clobber local edits when the same skill id arrives with new content', () => {
        const original = makeArticle()
        const { storeRef, rerender } = renderProvider(original)

        storeRef.current?.getState().dispatch({
            type: 'SET_TITLE',
            payload: 'User-edited title',
        })

        expect(storeRef.current?.getState().state.title).toBe(
            'User-edited title',
        )

        rerender(
            makeArticle({
                title: 'Server title',
                content: '<p>Server content</p>',
            }),
        )

        const nextState = storeRef.current?.getState().state
        expect(nextState?.title).toBe('User-edited title')
        expect(nextState?.content).toBe('<p>Original content</p>')
    })
})
