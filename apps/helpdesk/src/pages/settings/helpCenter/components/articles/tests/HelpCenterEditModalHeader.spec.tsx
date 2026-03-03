import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import type { DeepPartial } from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { initialState as helpCenterState } from 'state/entities/helpCenter/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import type { LocaleCode } from '../../../../../../models/helpCenter/types'
import { getSingleArticleEnglish } from '../../../fixtures/getArticlesResponse.fixture'
import { getLocalesResponseFixture } from '../../../fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from '../../../providers/SupportedLocales'
import { getArticleUrl } from '../../../utils/helpCenter.utils'
import useCategoriesOptions from '../ArticleCategorySelect/hooks/useCategoriesOptions'
import type { Props as HelpCenterEditModalHeaderProps } from '../HelpCenterEditModalHeader'
import HelpCenterEditModalHeader from '../HelpCenterEditModalHeader'

const windowOpenMock = jest.fn().mockReturnValue({
    focus: jest.fn(),
})

global.open = windowOpenMock

const mockedUseEditionManager = {
    selectedCategoryId: null,
    setSelectedCategoryId: jest.fn(),
    selectedArticle: getSingleArticleEnglish,
    selectedArticleLanguage: 'fr-FR' as LocaleCode,
}

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])
const defaultState: DeepPartial<RootState> = {
    entities: {
        helpCenter: helpCenterState,
    },
    ui: { helpCenter: uiState },
}

jest.mock('../../../providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        '../../../providers/EditionManagerContext',
    )

    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})

const mockedOnLanguageSelect = jest.fn()
const mockedOnClose = jest.fn()
const mockedOnResize = jest.fn()
const mockedOnCopyToClipboard = jest.fn()
const mockedOnArticleLanguageSelectActionClick = jest.fn()
const mockedOnSave = jest.fn()
const mockedOnDelete = jest.fn()
const mockedOnPublish = jest.fn()
const mockedOnCreate = jest.fn()

jest.mock('../../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('../ArticleCategorySelect/hooks/useCategoriesOptions')
;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
    {
        id: 'no-category',
        label: '- no category -',
        value: null,
        textValue: 'No category',
    },
    { id: 'category-1', label: 'Orders', value: 1, textValue: 'Orders' },
    { id: 'category-2', label: 'Pricing', value: 2, textValue: 'Pricing' },
])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))

describe('<HelpCenterEditModalHeader />', () => {
    const domain = 'acme.gorgias.help'

    const props: HelpCenterEditModalHeaderProps = {
        title: getSingleArticleEnglish.translation.title,
        supportedLocales: ['en-US', 'fr-FR'] as LocaleCode[],
        onLanguageSelect: mockedOnLanguageSelect,
        onClose: mockedOnClose,
        onCopyLinkToClipboard: mockedOnCopyToClipboard,
        onArticleLanguageSelectActionClick:
            mockedOnArticleLanguageSelectActionClick,
        articleMode: {
            mode: 'modified',
            onSave: mockedOnSave,
            onDelete: mockedOnDelete,
        },
        domain,
        helpCenterHasDefaultLayout: true,
    }

    it('should render the article title and close button', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <HelpCenterEditModalHeader {...props} />
            </Provider>,
        )

        expect(
            screen.getByText(getSingleArticleEnglish.translation.title),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /close edit modal/i }),
        ).toBeInTheDocument()
    })

    it('should render the category select when showCategorySelect is true', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <HelpCenterEditModalHeader
                    {...props}
                    showCategorySelect={true}
                />
            </Provider>,
        )

        expect(screen.getByText('Help Center category')).toBeInTheDocument()
    })

    it('should render a text input when onTitleChange is provided', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <HelpCenterEditModalHeader
                    {...props}
                    onTitleChange={() => null}
                />
            </Provider>,
        )

        expect(
            screen.getByRole('textbox', {
                name: getSingleArticleEnglish.translation.title,
            }),
        ).toBeInTheDocument()
    })

    it('should render a `preview article button` when article is published', () => {
        const propsWithPublishedArticle: HelpCenterEditModalHeaderProps = {
            ...props,
            articleMode: {
                mode: 'unchanged_published',
                onDelete: mockedOnDelete,
            },
        }
        const { getByRole } = render(
            <Provider store={mockStore(defaultState)}>
                <HelpCenterEditModalHeader {...propsWithPublishedArticle} />
            </Provider>,
        )

        const previewBtn = getByRole('button', { name: /preview article/i })
        fireEvent.click(previewBtn)

        const articleUrl = getArticleUrl({
            domain,
            locale: getSingleArticleEnglish.translation.locale,
            slug: getSingleArticleEnglish.translation.slug,
            articleId: getSingleArticleEnglish.id,
            unlistedId: '',
            isUnlisted: false,
        })

        expect(windowOpenMock).toHaveBeenCalledWith(articleUrl, '_blank')
    })

    describe('resize modal buttons', () => {
        it('should not have a fullscreen button when the resize callback is not in props', () => {
            const { queryByRole } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader {...props} />
                </Provider>,
            )

            const fullscreenBtn = queryByRole('button', { name: /fullscreen/i })

            expect(fullscreenBtn).toBeNull()
        })

        it('should have a fullscreen button when the resize callback is in props', () => {
            const { getByRole } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader
                        {...props}
                        onResize={mockedOnResize}
                    />
                </Provider>,
            )

            const fullscreenBtn = getByRole('button', { name: /fullscreen/i })
            fireEvent.click(fullscreenBtn)

            expect(mockedOnResize).toHaveBeenCalledTimes(1)
        })

        it('should have a halfscreen button when the resize callback is in props and isFullscreen is true', () => {
            const { getByRole } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader
                        {...props}
                        onResize={mockedOnResize}
                        isFullscreen={true}
                    />
                </Provider>,
            )

            const halfScreenBtn = getByRole('button', { name: /halfscreen/i })
            fireEvent.click(halfScreenBtn)

            expect(mockedOnResize).toHaveBeenCalledTimes(1)
        })

        it('should show the UNSAVED editing state when content is modified', async () => {
            const { findByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader {...props} />
                </Provider>,
            )

            await findByText('UNSAVED')
        })

        it('should show the UNSAVED editing state for new, unsaved articles', async () => {
            const { findByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader
                        {...props}
                        articleMode={{
                            mode: 'new',
                            onCreate: mockedOnCreate,
                        }}
                    />
                </Provider>,
            )

            await findByText('UNSAVED')
        })

        it('should show the PUBLISHED editing state', async () => {
            const { findByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader
                        {...props}
                        articleMode={{
                            mode: 'unchanged_published',
                            onDelete: mockedOnDelete,
                        }}
                    />
                </Provider>,
            )

            await findByText('PUBLISHED')
        })

        it('should show the SAVED editing state', async () => {
            const { findByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <HelpCenterEditModalHeader
                        {...props}
                        articleMode={{
                            mode: 'unchanged_not_published',
                            onDelete: mockedOnDelete,
                            onPublish: mockedOnPublish,
                        }}
                    />
                </Provider>,
            )

            await findByText('SAVED')
        })
    })
})
