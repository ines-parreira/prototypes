import { render, screen, waitFor } from '@testing-library/react'

import type { Components } from 'rest_api/help_center_api/client.generated'

import { ArticleContextProvider, useArticleContext } from './ArticleContext'
import type { ArticleContextConfig } from './types'

type ArticleWithLocalTranslation =
    Components.Schemas.ArticleWithLocalTranslation

// Mock the playground hook
jest.mock('pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor', () => ({
    usePlaygroundPanelInKnowledgeEditor: jest.fn(() => ({
        isPlaygroundOpen: false,
        onTest: jest.fn(),
        onClosePlayground: jest.fn(),
        sidePanelWidth: 400,
        shouldHideFullscreenButton: false,
    })),
}))

// Test component that consumes the context
const TestConsumer = () => {
    const { state } = useArticleContext()
    return (
        <div>
            <div data-testid="article-id">
                {state.article?.id || 'no-article'}
            </div>
            <div data-testid="article-title">{state.title}</div>
            <div data-testid="article-content">{state.content}</div>
            <div data-testid="article-mode">{state.articleMode}</div>
        </div>
    )
}

describe('ArticleContext', () => {
    const mockHelpCenter = {
        id: 1,
        name: 'Test Help Center',
        default_locale: 'en-US' as const,
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        deleted_datetime: null,
        uid: 'test-help-center-uid',
        subdomain: 'test',
        deactivated_datetime: null,
        supported_locales: ['en-US' as const],
        favicon_url: null,
        brand_logo_url: null,
        brand_logo_light_url: null,
        search_deactivated_datetime: null,
        powered_by_deactivated_datetime: null,
        algolia_api_key: null,
        algolia_app_id: 'test-app-id',
        algolia_index_name: 'test-index',
        primary_color: '#000000',
        primary_font_family: 'Arial',
        theme: 'default',
        shop_name: null,
        shop_integration_id: null,
        shop_integration: null,
        self_service_deactivated_datetime: null,
        hotswap_session_token: null,
        source: 'manual' as const,
        gaid: null,
        email_integration: null,
        automation_settings_id: null,
        code_snippet_template: '',
        integration_id: null,
        wizard: null,
        type: 'faq' as const,
        layout: 'default' as const,
        main_embedment_base_url: null,
    }

    const mockArticle: ArticleWithLocalTranslation = {
        id: 123,
        help_center_id: 1,
        category_id: 100,
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        unlisted_id: 'unlisted123',
        available_locales: ['en-US' as const],
        translation: {
            locale: 'en-US' as const,
            title: 'Test Article Title',
            content: '<p>Test Article Content</p>',
            visibility_status: 'PUBLIC' as const,
            customer_visibility: 'PUBLIC' as const,
        },
        ingested_resource_id: 1,
        origin: undefined,
    } as ArticleWithLocalTranslation

    const baseConfig: ArticleContextConfig = {
        helpCenter: mockHelpCenter,
        supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
        categories: [],
        initialMode: 'read',
        onClose: jest.fn(),
    }

    describe('useEffect - article data syncing', () => {
        it('dispatches SWITCH_ARTICLE when initialArticle is provided and state.article is null', async () => {
            const configWithArticle: ArticleContextConfig = {
                ...baseConfig,
                articleId: 123,
                initialArticle: mockArticle,
            }

            render(
                <ArticleContextProvider config={configWithArticle}>
                    <TestConsumer />
                </ArticleContextProvider>,
            )

            // Wait for the useEffect to run and update the state
            await waitFor(() => {
                expect(screen.getByTestId('article-id')).toHaveTextContent(
                    '123',
                )
            })

            expect(screen.getByTestId('article-title')).toHaveTextContent(
                'Test Article Title',
            )
            expect(screen.getByTestId('article-content')).toHaveTextContent(
                'Test Article Content',
            )
            expect(screen.getByTestId('article-mode')).toHaveTextContent('read')
        })

        it('does not dispatch SWITCH_ARTICLE when initialArticle is not provided', () => {
            render(
                <ArticleContextProvider config={baseConfig}>
                    <TestConsumer />
                </ArticleContextProvider>,
            )

            // Article should remain null
            expect(screen.getByTestId('article-id')).toHaveTextContent(
                'no-article',
            )
            expect(screen.getByTestId('article-title')).toHaveTextContent('')
            expect(screen.getByTestId('article-content')).toHaveTextContent('')
        })

        it('uses helpCenter.default_locale when dispatching SWITCH_ARTICLE', async () => {
            const customHelpCenter = {
                ...mockHelpCenter,
                default_locale: 'fr-FR' as const,
            }

            const configWithCustomLocale: ArticleContextConfig = {
                ...baseConfig,
                helpCenter: customHelpCenter,
                articleId: 123,
                initialArticle: mockArticle,
            }

            render(
                <ArticleContextProvider config={configWithCustomLocale}>
                    <TestConsumer />
                </ArticleContextProvider>,
            )

            // Wait for the useEffect to run
            await waitFor(() => {
                expect(screen.getByTestId('article-id')).toHaveTextContent(
                    '123',
                )
            })

            // Article should be loaded with the custom locale
            expect(screen.getByTestId('article-title')).toHaveTextContent(
                'Test Article Title',
            )
        })
    })

    describe('useArticleContext hook', () => {
        it('throws error when used outside ArticleContextProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            const TestComponent = () => {
                useArticleContext()
                return null
            }

            expect(() => render(<TestComponent />)).toThrow(
                'useArticleContext must be used within an ArticleContextProvider',
            )

            consoleSpy.mockRestore()
        })

        it('returns context value when used within ArticleContextProvider', () => {
            const TestComponent = () => {
                const context = useArticleContext()
                return (
                    <div data-testid="context-exists">
                        {context ? 'exists' : 'null'}
                    </div>
                )
            }

            render(
                <ArticleContextProvider config={baseConfig}>
                    <TestComponent />
                </ArticleContextProvider>,
            )

            expect(screen.getByTestId('context-exists')).toHaveTextContent(
                'exists',
            )
        })
    })

    describe('playground hook integration', () => {
        it('calls usePlaygroundPanelInKnowledgeEditor with isFullscreen state', () => {
            const {
                usePlaygroundPanelInKnowledgeEditor,
            } = require('pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor')

            render(
                <ArticleContextProvider config={baseConfig}>
                    <TestConsumer />
                </ArticleContextProvider>,
            )

            expect(usePlaygroundPanelInKnowledgeEditor).toHaveBeenCalledWith(
                false,
            )
        })
    })
})
