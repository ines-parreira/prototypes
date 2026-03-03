import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import { useArticleDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'

const mockToggleAIAgentVisibility = jest.fn()

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks',
    () => ({
        useArticleDetailsFromContext: jest.fn(),
        useToggleAIAgentVisibility: () => ({
            toggleAIAgentVisibility: mockToggleAIAgentVisibility,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context',
    () => ({
        useArticleContext: jest.fn(),
    }),
)

jest.mock('../KnowledgeEditorSidePanelCommonFields', () => ({
    KnowledgeEditorSidePanelFieldAIAgentStatus: ({
        tooltip,
        checked,
        showMultiLanguageInfo,
    }: {
        tooltip: string
        checked: boolean
        showMultiLanguageInfo?: boolean
    }) => (
        <div data-testid="ai-agent-status">
            <span data-testid="ai-agent-checked">{String(checked)}</span>
            <span data-testid="ai-agent-tooltip">{tooltip}</span>
            {showMultiLanguageInfo && <span aria-label="info">ℹ️</span>}
        </div>
    ),
    KnowledgeEditorSidePanelFieldDateField: ({ date }: { date?: Date }) =>
        date ? <div>{date.toISOString()}</div> : <div>-</div>,
    KnowledgeEditorSidePanelFieldKnowledgeType: () => (
        <div>Help Center Article</div>
    ),
    KnowledgeEditorSidePanelFieldURL: ({ url }: { url?: string }) =>
        url ? <div>{url}</div> : <div>-</div>,
}))

const mockUseArticleDetailsFromContext =
    useArticleDetailsFromContext as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleDetails', () => {
    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                    <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
                </KnowledgeEditorSidePanel>
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        mockUseArticleContext.mockReturnValue({
            state: {
                article: {
                    available_locales: ['en-US'],
                    translation: { visibility_status: 'PUBLIC' },
                },
                currentLocale: 'en-US',
                historicalVersion: null,
                isUpdating: false,
            },
            config: {
                supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                helpCenter: { id: 1 },
            },
        })
    })

    it('renders published article when isCurrent is true', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: {
                id: 123,
                title: 'Test Article',
                draftVersionId: 100,
                publishedVersionId: 100,
                isCurrent: true,
            },
            createdDatetime: new Date('2025-06-17'),
            lastUpdatedDatetime: new Date('2025-06-17'),
            articleUrl:
                'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
            helpCenter: {
                label: 'My Help Center',
                id: 1,
            },
        })

        renderComponent()

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(
            screen.getByText(
                'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
            ),
        ).toBeInTheDocument()
    })

    it('renders draft when isCurrent is false', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: {
                id: 123,
                title: 'Test Article',
                draftVersionId: 100,
                publishedVersionId: null,
                isCurrent: false,
            },
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
            helpCenter: {
                label: 'My Help Center',
                id: 1,
            },
        })

        renderComponent()
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders draft when viewing draft version (isCurrent is false)', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: {
                id: 123,
                title: 'Test Article',
                draftVersionId: 101,
                publishedVersionId: 100,
                isCurrent: false,
            },
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
            helpCenter: {
                label: 'My Help Center',
                id: 1,
            },
        })

        renderComponent()
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders dash when article is undefined', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: undefined,
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
            helpCenter: undefined,
        })

        renderComponent()
        expect(screen.getAllByText('-')).toHaveLength(5)
    })

    describe('Help Center link', () => {
        it('renders Help Center link with correct URL and label', () => {
            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Test Help Center',
                    id: 42,
                },
            })

            renderComponent()

            const helpCenterLink = screen.getByRole('link', {
                name: 'My Test Help Center',
            })
            expect(helpCenterLink).toBeInTheDocument()
            expect(helpCenterLink).toHaveAttribute(
                'href',
                '/app/settings/help-center/42/articles',
            )
        })

        it('renders dash when helpCenter is undefined', () => {
            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: undefined,
            })

            renderComponent()

            const helpCenterLabel = screen.getByText('Help Center')
            expect(helpCenterLabel).toBeInTheDocument()

            expect(
                screen.queryByRole('link', { name: /Help Center/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Multi-language info icon', () => {
        it('does not show info icon when article has single language', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            expect(screen.queryByLabelText('info')).not.toBeInTheDocument()
        })

        it('shows info icon for multi-language articles', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US', 'fr-FR'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [
                        { code: 'en-US', name: 'English (US)' },
                        { code: 'fr-FR', name: 'French (FR)' },
                    ],
                    helpCenter: { id: 42 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 42,
                },
            })

            renderComponent()

            const infoIcon = screen.getByLabelText('info')
            expect(infoIcon).toBeInTheDocument()
        })

        it('shows info icon with French locale', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US', 'fr-FR'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'fr-FR',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [
                        { code: 'en-US', name: 'English (US)' },
                        { code: 'fr-FR', name: 'French (FR)' },
                    ],
                    helpCenter: { id: 42 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 42,
                },
            })

            renderComponent()

            const infoIcon = screen.getByLabelText('info')
            expect(infoIcon).toBeInTheDocument()
        })

        it('uses locale code as fallback when locale name is not found', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US', 'es-ES'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'es-ES',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 42 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 42,
                },
            })

            renderComponent()

            const infoIcon = screen.getByLabelText('info')
            expect(infoIcon).toBeInTheDocument()
        })

        it('does not show info icon when available_locales is empty', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: [],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            expect(screen.queryByLabelText('info')).not.toBeInTheDocument()
        })

        it('does not show info icon when article is undefined', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: undefined,
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: undefined,
                createdDatetime: undefined,
                lastUpdatedDatetime: undefined,
                articleUrl: undefined,
                helpCenter: undefined,
            })

            renderComponent()

            expect(screen.queryByLabelText('info')).not.toBeInTheDocument()
        })
    })

    describe('AI Agent visibility tooltip', () => {
        it('shows no tooltip when published article is unlisted', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'UNLISTED' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const tooltip = screen.getByTestId('ai-agent-tooltip')
            expect(tooltip).toHaveTextContent('')
        })

        it('shows correct tooltip when article is a draft', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 101,
                    publishedVersionId: 100,
                    isCurrent: false,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl: undefined,
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const tooltip = screen.getByTestId('ai-agent-tooltip')
            expect(tooltip).toHaveTextContent(
                'Publish your draft edits in order to enable this version for AI Agent',
            )
        })

        it('shows no tooltip when article is published and public', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const tooltip = screen.getByTestId('ai-agent-tooltip')
            expect(tooltip).toHaveTextContent('')
        })

        it('treats undefined visibility_status as not unlisted', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: {},
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const checked = screen.getByTestId('ai-agent-checked')
            expect(checked).toHaveTextContent('true')
        })

        it('checks AI Agent status correctly when unlisted', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'UNLISTED' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: null,
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const checked = screen.getByTestId('ai-agent-checked')
            expect(checked).toHaveTextContent('false')
        })
    })

    describe('Historical version viewing', () => {
        it('shows Previous version status when viewing a historical version', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: {
                        versionId: 1,
                        version: 1,
                        title: 'Old version',
                        content: '<p>Old</p>',
                        publishedDatetime: '2024-01-01T00:00:00Z',
                        publisherUserId: 1,
                        commitMessage: null,
                        impactDateRange: null,
                    },
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl: 'https://example.com/article',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            expect(screen.getByText('Previous version')).toBeInTheDocument()
            expect(screen.queryByText('Published')).not.toBeInTheDocument()
        })

        it('shows restore tooltip when viewing a historical version', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: {
                        versionId: 1,
                        version: 1,
                        title: 'Old version',
                        content: '<p>Old</p>',
                        publishedDatetime: '2024-01-01T00:00:00Z',
                        publisherUserId: 1,
                        commitMessage: null,
                        impactDateRange: null,
                    },
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl: 'https://example.com/article',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const tooltip = screen.getByTestId('ai-agent-tooltip')
            expect(tooltip).toHaveTextContent(
                'Restore this version to be able to use it.',
            )
        })

        it('shows AI agent status as unchecked when viewing a historical version', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    article: {
                        available_locales: ['en-US'],
                        translation: { visibility_status: 'PUBLIC' },
                    },
                    currentLocale: 'en-US',
                    historicalVersion: {
                        versionId: 1,
                        version: 1,
                        title: 'Old version',
                        content: '<p>Old</p>',
                        publishedDatetime: '2024-01-01T00:00:00Z',
                        publisherUserId: 1,
                        commitMessage: null,
                        impactDateRange: null,
                    },
                    isUpdating: false,
                },
                config: {
                    supportedLocales: [{ code: 'en-US', name: 'English (US)' }],
                    helpCenter: { id: 1 },
                },
            })

            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl: 'https://example.com/article',
                helpCenter: {
                    label: 'My Help Center',
                    id: 1,
                },
            })

            renderComponent()

            const checked = screen.getByTestId('ai-agent-checked')
            expect(checked).toHaveTextContent('false')
        })
    })
})
