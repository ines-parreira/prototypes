import { useEffect } from 'react'
import { render } from '@repo/testing'

import type { HelpCenter } from 'models/helpCenter/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import {
    KnowledgeEditorGuidanceProvider,
    useGuidanceStoreApi,
} from '../KnowledgeEditorGuidanceContext'
import type { GuidanceContextConfig } from '../types'

describe('KnowledgeEditorGuidanceContext sync effects', () => {
    const mockHelpCenter = { id: 1 } as HelpCenter

    const makeArticle = (overrides: Partial<GuidanceArticle> = {}) =>
        ({
            id: 42,
            title: 'Original title',
            content: '<p>Original content</p>',
            visibility: VisibilityStatusEnum.PUBLIC,
            isCurrent: true,
            draftVersionId: 1,
            publishedVersionId: 1,
            lastUpdated: '2026-01-01T00:00:00Z',
            createdDatetime: '2026-01-01T00:00:00Z',
            templateKey: null,
            ...overrides,
        }) as GuidanceArticle

    const makeConfig = (article: GuidanceArticle): GuidanceContextConfig => ({
        shopName: 'shop',
        shopType: 'shopify',
        guidanceArticle: article,
        guidanceArticles: [],
        initialMode: 'edit',
        guidanceHelpCenter: mockHelpCenter,
        onClose: () => {},
    })

    type StoreApi = ReturnType<typeof useGuidanceStoreApi>

    const renderProvider = (article: GuidanceArticle) => {
        const storeRef: { current: StoreApi | null } = { current: null }

        const Capture = () => {
            const api = useGuidanceStoreApi()
            useEffect(() => {
                storeRef.current = api
            }, [api])
            return null
        }

        const ui = (config: GuidanceContextConfig) => (
            <KnowledgeEditorGuidanceProvider config={config}>
                <Capture />
            </KnowledgeEditorGuidanceProvider>
        )

        const { rerender } = render(ui(makeConfig(article)))

        return {
            storeRef,
            rerender: (nextArticle: GuidanceArticle) =>
                rerender(ui(makeConfig(nextArticle))),
        }
    }

    it('re-syncs editor state when the same guidance id arrives with new title and content', () => {
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

    it('does not clobber local edits when the same guidance id arrives with new content', () => {
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
