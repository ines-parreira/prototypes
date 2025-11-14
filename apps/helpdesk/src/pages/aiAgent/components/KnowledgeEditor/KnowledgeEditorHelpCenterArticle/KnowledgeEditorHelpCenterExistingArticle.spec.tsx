import { assumeMock } from '@repo/testing'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'

import useFlag from 'core/flags/hooks/useFlag'
import { useNotify } from 'hooks/useNotify'
import {
    useCreateArticleTranslation,
    useDeleteArticle,
    useDeleteArticleTranslation,
    useGetHelpCenterArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import { LocaleCode } from 'models/helpCenter/types'
import { flattenCategories } from 'models/helpCenter/utils'
import { Props as HelpCenterEditorProps } from 'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getCategoriesResponseEnglish } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { mockStore } from 'utils/testing'

import {
    InitialArticleMode,
    KnowledgeEditorHelpCenterExistingArticle,
} from './KnowledgeEditorHelpCenterExistingArticle'

let onChangeCallback: (value: string) => void = jest.fn()

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

jest.mock('core/flags/hooks/useFlag')
const useFlagMock = assumeMock(useFlag)

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor',
    () =>
        ({ value, onChange }: HelpCenterEditorProps) => {
            onChangeCallback = onChange
            return (
                <>
                    <div>EDITOR</div>
                    <div>{value}</div>
                </>
            )
        },
)

jest.mock('models/helpCenter/queries', () => ({
    useCreateArticleTranslation: jest.fn(),
    useDeleteArticle: jest.fn(),
    useDeleteArticleTranslation: jest.fn(),
    useGetHelpCenterArticle: jest.fn(),
    useUpdateArticleTranslation: jest.fn(),
}))

const mockedUseCreateArticleTranslation = jest.mocked(
    useCreateArticleTranslation,
)
const mockedUseDeleteArticle = jest.mocked(useDeleteArticle)
const mockedUseDeleteArticleTranslation = jest.mocked(
    useDeleteArticleTranslation,
)
const mockedUseGetHelpCenterArticle = jest.mocked(useGetHelpCenterArticle)
const mockedUseUpdateArticleTranslation = jest.mocked(
    useUpdateArticleTranslation,
)

const helpCenter = {
    ...getHelpCentersResponseFixture.data[0],
    supported_locales: ['en-US', 'de-DE'] as LocaleCode[],
}
const categories = flattenCategories(getCategoriesResponseEnglish)
const article = {
    ...getSingleArticleEnglish,
    translation: {
        ...getSingleArticleEnglish.translation,
        title: 'Test Article',
        content: 'Test Content',
    },
}

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

describe('KnowledgeEditorHelpCenterExistingArticle', () => {
    const updateArticleTranslationMock = jest.fn()
    const deleteArticleMock = jest.fn()
    const createArticleTranslationMock = jest.fn()
    const deleteArticleTranslationMock = jest.fn()
    const onClose = jest.fn()
    const notifyMock = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()

        useNotifyMock.mockReturnValue({ error: notifyMock } as any)
        useFlagMock.mockReturnValue(false)

        updateArticleTranslationMock.mockImplementation((o) =>
            Promise.resolve({ data: o }),
        )
        deleteArticleMock.mockResolvedValue(undefined)
        deleteArticleTranslationMock.mockResolvedValue(undefined)

        mockedUseCreateArticleTranslation.mockReturnValue({
            mutateAsync: createArticleTranslationMock,
            isLoading: false,
        } as any)

        mockedUseDeleteArticle.mockReturnValue({
            mutateAsync: deleteArticleMock,
            isLoading: false,
        } as any)

        mockedUseDeleteArticleTranslation.mockReturnValue({
            mutateAsync: deleteArticleTranslationMock,
            isLoading: false,
        } as any)

        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: article,
            isLoading: false,
        } as any)

        mockedUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: updateArticleTranslationMock,
            isLoading: false,
        } as any)
    })

    it('renders the read view', async () => {
        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()
        expect(screen.getByText(article.translation.title)).toBeInTheDocument()
        expect(
            screen.getByText(article.translation.content),
        ).toBeInTheDocument()

        expect(screen.queryByText('Settings')).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', { name: 'collapse side panel' }),
        )

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'edit' }))

        expect(screen.getByText('EDITOR')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'cancel' }))

        expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'close' }))

        expect(onClose).toHaveBeenCalled()
    })

    it('renders the edit view', async () => {
        const { rerender } = render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('EDITOR')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'title' })).toHaveValue(
            article.translation.title,
        )
        expect(
            screen.getByText(article.translation.content),
        ).toBeInTheDocument()

        act(() => onChangeCallback('Updated text'))

        rerender(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Updated text')).toBeInTheDocument()

        updateArticleTranslationMock.mockRejectedValue('some error')

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Publish' })),
        )

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith(
                'An error occurred while updating the article.',
            )
        })

        expect(updateArticleTranslationMock).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: article.id,
                locale: helpCenter.default_locale,
            },
            {
                title: article.translation.title,
                content: 'Updated text',
            },
        ])

        updateArticleTranslationMock.mockResolvedValue({
            data: {
                ...article.translation,
                content: 'Updated text',
            },
        })

        notifyMock.mockClear()

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Publish' })),
        )

        await waitFor(() => {
            expect(notifyMock).not.toHaveBeenCalled()
        })

        expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()
        expect(screen.getByText(article.translation.title)).toBeInTheDocument()
        expect(screen.getByText('Updated text')).toBeInTheDocument()
    })

    it('saves draft', async () => {
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: {
                ...article,
                translation: {
                    ...article.translation,
                    visibility_status: 'UNLISTED',
                },
                is_current: false,
            },
            isLoading: false,
        } as any)

        const { rerender } = render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('EDITOR')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'title' })).toHaveValue(
            article.translation.title,
        )
        expect(
            screen.getByText(article.translation.content),
        ).toBeInTheDocument()

        act(() => onChangeCallback('Updated text'))

        rerender(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Updated text')).toBeInTheDocument()

        updateArticleTranslationMock.mockRejectedValue('some error')

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Save draft' })),
        )

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith(
                'An error occurred while updating the article.',
            )
        })

        expect(updateArticleTranslationMock).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: article.id,
                locale: helpCenter.default_locale,
            },
            {
                title: article.translation.title,
                content: 'Updated text',
            },
        ])

        updateArticleTranslationMock.mockResolvedValue({
            data: {
                ...article.translation,
                content: 'Updated text',
            },
        })

        notifyMock.mockClear()

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Save draft' })),
        )

        await waitFor(() => {
            expect(notifyMock).not.toHaveBeenCalled()
        })

        expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()
        expect(screen.getByText(article.translation.title)).toBeInTheDocument()
        expect(screen.getByText('Updated text')).toBeInTheDocument()
    })

    it('deletes the article', async () => {
        deleteArticleMock.mockRejectedValue('some error')

        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'delete' }))

        expect(
            screen.getByText('Are you sure you want to delete this article?'),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Delete article',
            }),
        )

        expect(deleteArticleMock).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: helpCenter.id,
                id: article.id,
            },
        ])

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith(
                'An error occurred while deleting the article.',
            )

            expect(onClose).not.toHaveBeenCalled()
        })

        deleteArticleMock.mockResolvedValue(undefined)

        fireEvent.click(screen.getByRole('button', { name: 'delete' }))

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Delete article',
            }),
        )

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled()
        })
    })

    it('discards changes if clicking cancel and confirming', () => {
        const { rerender } = render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        act(() => onChangeCallback('Updated text'))

        rerender(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Updated text')).toBeInTheDocument()

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'cancel' })),
        )

        expect(screen.getByText('Discard Changes')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()

        act(() =>
            fireEvent.click(
                screen.getByRole('button', { name: 'Discard Changes' }),
            ),
        )

        expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()
        expect(screen.getByText(article.translation.title)).toBeInTheDocument()
        expect(
            screen.getByText(article.translation.content),
        ).toBeInTheDocument()
    })

    it('saves changes if clicking cancel and saving', async () => {
        const { rerender } = render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        act(() => onChangeCallback('Updated text'))

        rerender(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Updated text')).toBeInTheDocument()

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'cancel' })),
        )

        expect(screen.getByText('Discard Changes')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()

        updateArticleTranslationMock.mockResolvedValue({
            data: {
                ...article.translation,
                content: 'Updated text',
            },
        })

        act(() =>
            fireEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            ),
        )

        await waitFor(() => {
            expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()
            expect(screen.getByText('Updated text')).toBeInTheDocument()
        })
    })

    it('opens a new translation', async () => {
        const { rerender } = render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        act(() =>
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'en-US English - USA arrow_drop_down',
                }),
            ),
        )

        rerender(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        expect(
            screen.getByRole('button', { name: 'create' }),
        ).toBeInTheDocument()

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'create' })),
        )

        expect(screen.getByText('EDITOR')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'title' })).toHaveValue('')

        act(() => {
            userEvent.type(
                screen.getByRole('textbox', { name: 'title' }),
                'Title in German',
            )
            onChangeCallback('Content in German')
        })

        await waitFor(() => {
            expect(screen.getByRole('textbox', { name: 'title' })).toHaveValue(
                'Title in German',
            )
            expect(screen.getByText('Content in German')).toBeInTheDocument()
        })

        createArticleTranslationMock.mockRejectedValue('some error')

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Publish' })),
        )

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith(
                'An error occurred while creating the article.',
            )
        })

        createArticleTranslationMock.mockResolvedValue(undefined)

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Publish' })),
        )

        expect(createArticleTranslationMock).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: article.id,
            },
            {
                category_id: null,
                excerpt: 'Content in German',
                is_current: true,
                locale: 'de-DE',
                seo_meta: {
                    title: null,
                    description: null,
                },
                slug: 'title-in-german',
                title: 'Title in German',
                content: 'Content in German',
                visibility_status: 'PUBLIC',
            },
        ])
    })

    it('deletes a translation', async () => {
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: {
                ...article,
                available_locales: ['en-US', 'de-DE'],
            },
            isLoading: false,
        } as any)

        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        deleteArticleTranslationMock.mockRejectedValue('some error')

        act(() =>
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'en-US English - USA arrow_drop_down',
                }),
            ),
        )

        act(() => {
            fireEvent.click(
                within(screen.getByTestId('option-de-DE')).getByRole('button', {
                    name: 'delete',
                }),
            )
        })

        act(() => {
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'Delete German - Germany',
                }),
            )
        })

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith(
                'An error occurred while deleting the article translation.',
            )
        })

        deleteArticleTranslationMock.mockResolvedValue(undefined)

        act(() => {
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'en-US English - USA arrow_drop_down',
                }),
            )
        })

        act(() => {
            fireEvent.click(
                within(screen.getByTestId('option-de-DE')).getByRole('button', {
                    name: 'delete',
                }),
            )
        })

        act(() => {
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'Delete German - Germany',
                }),
            )
        })

        await waitFor(() =>
            expect(deleteArticleTranslationMock).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: helpCenter.id,
                    article_id: article.id,
                    locale: 'de-DE',
                },
            ]),
        )
    })

    it('switches to different translation', async () => {
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: {
                ...article,
                available_locales: ['en-US', 'de-DE'],
            },
            isLoading: false,
        } as any)

        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: {
                ...article,
                available_locales: ['en-US', 'de-DE'],
                translation: {
                    ...article.translation,
                    locale: 'de-DE',
                    title: 'Title in German',
                    content: 'Content in German',
                },
            },
            isLoading: false,
        } as any)

        act(() =>
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'en-US English - USA arrow_drop_down',
                }),
            ),
        )

        act(() => {
            fireEvent.click(
                within(screen.getByTestId('option-de-DE')).getByRole('button', {
                    name: 'view',
                }),
            )
        })

        await waitFor(() => {
            expect(screen.queryByText('EDITOR')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Title in English'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Title in German')).toBeInTheDocument()
            expect(screen.getByText('Content in German')).toBeInTheDocument()
        })
    })

    it('displays loader', () => {
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('updates settings', async () => {
        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        act(() => {
            userEvent.clear(screen.getByRole('textbox', { name: 'Slug' }))

            userEvent.type(
                screen.getByRole('textbox', { name: 'Slug' }),
                'updated-slug',
            )
        })

        await waitFor(
            () => {
                expect(updateArticleTranslationMock.mock.calls.length).toBe(1)
                expect(updateArticleTranslationMock).toHaveBeenCalledWith([
                    undefined,
                    {
                        help_center_id: helpCenter.id,
                        article_id: article.id,
                        locale: helpCenter.default_locale,
                    },
                    {
                        slug: 'updated-slug',
                    },
                ])
            },
            { timeout: 1500 },
        )
    })

    it('closes the side panel and saves changes', async () => {
        const { rerender } = render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        act(() => onChangeCallback('Updated text'))

        rerender(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.EDIT}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Updated text')).toBeInTheDocument()

        act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'close' })),
        )

        expect(screen.getByText('Discard Changes')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()

        act(() =>
            fireEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            ),
        )

        expect(updateArticleTranslationMock).toHaveBeenCalledWith([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: article.id,
                locale: helpCenter.default_locale,
            },
            {
                title: article.translation.title,
                content: 'Updated text',
            },
        ])

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled()
        })
    })

    it('renders impact section when performance stats flag is enabled', () => {
        useFlagMock.mockReturnValue(true)

        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('does not render impact section when performance stats flag is disabled', () => {
        useFlagMock.mockReturnValue(false)

        render(
            <Wrapper>
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={helpCenter}
                    supportedLocales={getLocalesResponseFixture}
                    categories={categories}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    initialArticleMode={InitialArticleMode.READ}
                    articleId={1}
                    isFullscreen={false}
                    onToggleFullscreen={() => {}}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('Impact')).not.toBeInTheDocument()
        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })
})
