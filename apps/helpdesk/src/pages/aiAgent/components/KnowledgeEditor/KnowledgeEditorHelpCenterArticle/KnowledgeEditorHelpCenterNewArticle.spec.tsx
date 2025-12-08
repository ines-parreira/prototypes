import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useNotify } from 'hooks/useNotify'
import { useCreateArticle } from 'models/helpCenter/queries'
import { flattenCategories } from 'models/helpCenter/utils'
import type { Props as HelpCenterEditorProps } from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { getCategoriesResponseEnglish } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorHelpCenterNewArticle } from './KnowledgeEditorHelpCenterNewArticle'

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor',
    () =>
        ({ value }: HelpCenterEditorProps) => (
            <>
                <div>EDITOR</div>
                <div>{value}</div>
            </>
        ),
)

jest.mock('models/helpCenter/queries', () => ({
    useCreateArticle: jest.fn(),
}))

const mockedUseCreateArticle = jest.mocked(useCreateArticle)

const helpCenter = getHelpCentersResponseFixture.data[0]
const categories = flattenCategories(getCategoriesResponseEnglish)

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider
        store={mockStore({
            entities: {
                helpCenter: {
                    helpCenters: {
                        helpCentersById: {
                            [helpCenter.id]: helpCenter,
                        },
                    },
                    articles: {
                        articlesById: {},
                    },
                    categories: {
                        categoriesById: Object.fromEntries(
                            categories.map((category) => [
                                category.id,
                                category,
                            ]),
                        ),
                    },
                },
            },
            ui: {
                helpCenter: {
                    currentId: helpCenter.id,
                    currentLanguage: 'en-US',
                },
            },
        })}
    >
        <CurrentHelpCenterContext.Provider value={helpCenter}>
            {children}
        </CurrentHelpCenterContext.Provider>
    </Provider>
)

describe('KnowledgeEditorHelpCenterNewArticle', () => {
    const mutateAsyncMock = jest.fn()
    const notifyMock = jest.fn()
    const onClose = jest.fn()
    const onCreated = jest.fn()
    const onClickPrevious = jest.fn()
    const onClickNext = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseCreateArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        useNotifyMock.mockReturnValue({ error: notifyMock } as any)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('renders the editor', async () => {
        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterNewArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickNext={onClickNext}
                    onClickPrevious={onClickPrevious}
                    onClose={onClose}
                    onCreated={onCreated}
                    template={{
                        title: 'Test Article',
                        content: 'Test Content',
                        key: 'test-template',
                    }}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                    onTest={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('EDITOR')).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()

        mutateAsyncMock.mockRejectedValue('some error')

        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith(
                'An error occurred while creating the article.',
            )
        })

        mutateAsyncMock.mockResolvedValue({
            data: {
                id: 1,
                title: 'Test Article',
                content: 'Test Content',
                slug: 'test-article',
                locale: 'en-US',
                category_id: null,
                visibility_status: 'PUBLIC',
                is_current: true,
                excerpt: '',
                seo_meta: {
                    title: null,
                    description: null,
                },
            },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

        expect(mutateAsyncMock).toHaveBeenCalledWith([
            undefined,
            { help_center_id: helpCenter.id },
            {
                template_key: 'test-template',
                translation: {
                    title: 'Test Article',
                    content: 'Test Content',
                    slug: 'test-article',
                    locale: 'en-US',
                    category_id: null,
                    visibility_status: 'PUBLIC',
                    is_current: true,
                    excerpt: '',
                    seo_meta: {
                        title: null,
                        description: null,
                    },
                },
            },
        ])

        await waitFor(() => {
            expect(onCreated).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(Number),
                    title: 'Test Article',
                    content: 'Test Content',
                    slug: 'test-article',
                    locale: 'en-US',
                }),
            )
        })
    })

    it('cancels changes', async () => {
        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterNewArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    onClickPrevious={onClickPrevious}
                    onClickNext={onClickNext}
                    categories={categories}
                    onClose={onClose}
                    onCreated={onCreated}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                    onTest={() => {}}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'cancel' }))

        expect(onClose).toHaveBeenCalled()

        await waitFor(() => {
            expect(onCreated).not.toHaveBeenCalled()
        })
    })

    it('saves as draft', async () => {
        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterNewArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickNext={onClickNext}
                    onClickPrevious={onClickPrevious}
                    onClose={onClose}
                    onCreated={onCreated}
                    template={{
                        title: 'Test Article',
                        content: 'Test Content',
                        key: 'test-template',
                    }}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                    onTest={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('EDITOR')).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()

        mutateAsyncMock.mockResolvedValue({
            data: {
                id: 1,
                title: 'Test Article',
                content: 'Test Content',
                slug: 'test-article',
                locale: 'en-US',
                category_id: null,
                visibility_status: 'UNLISTED',
                is_current: false,
                excerpt: '',
                seo_meta: {
                    title: null,
                    description: null,
                },
            },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))

        expect(mutateAsyncMock).toHaveBeenCalledWith([
            undefined,
            { help_center_id: helpCenter.id },
            {
                template_key: 'test-template',
                translation: {
                    title: 'Test Article',
                    content: 'Test Content',
                    slug: 'test-article',
                    locale: 'en-US',
                    category_id: null,
                    visibility_status: 'UNLISTED',
                    is_current: false,
                    excerpt: '',
                    seo_meta: {
                        title: null,
                        description: null,
                    },
                },
            },
        ])

        await waitFor(() => {
            expect(onCreated).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(Number),
                    title: 'Test Article',
                    content: 'Test Content',
                    slug: 'test-article',
                    locale: 'en-US',
                    visibility_status: 'UNLISTED',
                    is_current: false,
                }),
            )
        })
    })
})
