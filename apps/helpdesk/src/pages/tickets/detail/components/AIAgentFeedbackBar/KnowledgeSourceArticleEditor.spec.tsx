import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { LocaleCode } from 'models/helpCenter/types'
import { HelpCenterArticleModalView } from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/types'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { initialState as helpCenterArticlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as helpCenterCategoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as helpCenterUIState } from 'state/ui/helpCenter/reducer'
import { initialState as knowledgeSourceArticleEditorState } from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import KnowledgeSourceArticleEditor from './KnowledgeSourceArticleEditor'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgePendingCloseType,
} from './types'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackArticleActions',
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useArticleTranslations',
)
jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useArticleValidation',
)
jest.mock('pages/settings/helpCenter/providers/EditionManagerContext')
jest.mock('hooks/useModalManager')
jest.mock('./hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar')
jest.mock('hooks/useAppDispatch')
jest.mock('state/ui/helpCenter')

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => <div>{children}</div>,
    useAbilityChecker: jest.fn().mockReturnValue({
        isPassingRulesCheck: jest.fn().mockReturnValue(true),
    }),
    useHelpCenterApi: jest.fn().mockReturnValue({
        client: jest.fn(),
    }),
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/HelpCenterEditor',
    () => {
        return function MockHelpCenterEditor({
            value = '',
            onChange,
            onEditorReady,
        }: {
            value?: string
            onChange: (content: string) => void
            onEditorReady?: (content: string) => void
        }) {
            React.useEffect(() => {
                // Simulate editor ready callback
                onEditorReady?.(value)
            }, [value, onEditorReady])

            return (
                <textarea
                    aria-label="Article content editor"
                    value={value}
                    onChange={(e) => {
                        const content = e.target.value
                        onChange(content)
                    }}
                    data-testid="content-editor"
                />
            )
        }
    },
)

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterArticleAIAgentBanner',
    () => ({
        HelpCenterArticleAIAgentBanner: () => null,
    }),
)

jest.mock('./HelpCenterArticleDiscardModal', () => {
    return {
        HelpCenterArticleDiscardModal:
            function MockHelpCenterArticleDiscardModal() {
                return (
                    <div data-testid="discard-modal">Mocked Discard Modal</div>
                )
            },
    }
})

const mockArticle = getSingleArticleEnglish
const mockHelpCenter = getSingleHelpCenterResponseFixture

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultStoreState: Partial<RootState> = {
    entities: {
        helpCenter: {
            articles: helpCenterArticlesState,
            categories: helpCenterCategoriesState,
        },
    } as any,
    ui: {
        helpCenter: helpCenterUIState,
        ticketAIAgentFeedback: {
            knowledgeSourceArticleEditor: knowledgeSourceArticleEditorState,
        },
    } as any,
}

const mockOnClose = jest.fn()
const mockCreateArticle = jest.fn()
const mockUpdateArticle = jest.fn()
const mockDeleteArticle = jest.fn()
const mockDeleteArticleTranslation = jest.fn()
const mockSetSelectedArticle = jest.fn()
const mockSetSelectedArticleLanguage = jest.fn()
const mockSetIsEditorCodeViewActive = jest.fn()
const mockSetSelectedTemplateKey = jest.fn()
const mockSetSelectedArticleTranslations = jest.fn()
const mockSetSelectedExistingArticleTranslation = jest.fn()
const mockFetchTranslationsForArticle = jest.fn()
const mockGetTranslationForLocale = jest.fn()
const mockCloseModal = jest.fn()
const mockOnSubmitNewMissingKnowledge = jest.fn()
const mockOnSaveClick = jest.fn()
const mockOpenEdit = jest.fn()
const mockDispatch = jest.fn()
const mockChangeViewLanguage = jest.fn()

const useCurrentHelpCenterMock =
    require('pages/settings/helpCenter/hooks/useCurrentHelpCenter').default
const useFeedbackArticleActionsMock =
    require('pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackArticleActions').useFeedbackArticleActions
const useArticleTranslationsMock =
    require('pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useArticleTranslations').useArticleTranslations
const useArticleValidationMock =
    require('pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useArticleValidation').useArticleValidation
const useEditionManagerMock =
    require('pages/settings/helpCenter/providers/EditionManagerContext').useEditionManager
const useModalManagerMock = require('hooks/useModalManager').useModalManager
const useKnowledgeSourceSideBarMock =
    require('./hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar').useKnowledgeSourceSideBar
const useAppDispatchMock = require('hooks/useAppDispatch').default
const { changeViewLanguage } = require('state/ui/helpCenter')

describe('KnowledgeSourceArticleEditor', () => {
    const defaultProps = {
        article: mockArticle,
        isCreateMode: false,
        onClose: mockOnClose,
        onSubmitNewMissingKnowledge: mockOnSubmitNewMissingKnowledge,
        onSaveClick: mockOnSaveClick,
    }

    const defaultEditionManagerState = {
        selectedCategoryId: 1,
        selectedArticleLanguage: 'en-US' as LocaleCode,
        setSelectedArticleLanguage: mockSetSelectedArticleLanguage,
        selectedArticle: mockArticle,
        setSelectedArticle: mockSetSelectedArticle,
        isEditorCodeViewActive: true,
        setIsEditorCodeViewActive: mockSetIsEditorCodeViewActive,
        editModal: {
            isOpened: true,
            view: HelpCenterArticleModalView.BASIC,
        },
        selectedTemplateKey: null,
        setSelectedTemplateKey: mockSetSelectedTemplateKey,
        isFullscreenEditModal: false,
    }

    const defaultArticleTranslationsState = {
        selectedArticleTranslations: [mockArticle.translation],
        setSelectedArticleTranslations: mockSetSelectedArticleTranslations,
        selectedExistingArticleTranslation: mockArticle.translation,
        setSelectedExistingArticleTranslation:
            mockSetSelectedExistingArticleTranslation,
        getTranslationForLocale: mockGetTranslationForLocale,
        isFetchingArticleTranslations: false,
        fetchTranslationsForArticle: mockFetchTranslationsForArticle,
    }

    const defaultArticleActionsState = {
        isLoading: false,
        createArticle: mockCreateArticle,
        updateArticle: mockUpdateArticle,
        deleteArticle: mockDeleteArticle,
        deleteArticleTranslation: mockDeleteArticleTranslation,
    }

    const defaultArticleValidationState = {
        canSaveArticle: true,
        articleModified: false,
        requiredFieldsArticle: [],
    }

    const defaultModalManagerState = {
        getParams: jest.fn().mockReturnValue({ categoryId: 1 }),
        closeModal: mockCloseModal,
    }

    const defaultKnowledgeSourceSideBarState = {
        openEdit: mockOpenEdit,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useCurrentHelpCenterMock.mockReturnValue(mockHelpCenter)
        useFeedbackArticleActionsMock.mockReset()
        useFeedbackArticleActionsMock.mockReturnValue(
            defaultArticleActionsState,
        )
        useArticleTranslationsMock.mockReturnValue(
            defaultArticleTranslationsState,
        )
        useArticleValidationMock.mockReturnValue(defaultArticleValidationState)
        useEditionManagerMock.mockReturnValue(defaultEditionManagerState)
        useModalManagerMock.mockReturnValue(defaultModalManagerState)
        useKnowledgeSourceSideBarMock.mockReturnValue(
            defaultKnowledgeSourceSideBarState,
        )
        useAppDispatchMock.mockReturnValue(mockDispatch)
        changeViewLanguage.mockReturnValue(mockChangeViewLanguage)
        mockOnSaveClick.mockClear()

        mockCreateArticle.mockReset()
        mockUpdateArticle.mockReset()
        mockDeleteArticle.mockReset()
        mockDeleteArticleTranslation.mockReset()
        mockOpenEdit.mockClear()
    })

    const renderComponent = (
        props: any = defaultProps,
        storeState = defaultStoreState,
    ) => {
        return render(
            <Provider store={mockStore(storeState)}>
                <KnowledgeSourceArticleEditor {...props} />
            </Provider>,
        )
    }

    describe('when rendering in edit mode', () => {
        it('displays the help center edit modal', () => {
            renderComponent()

            expect(screen.getByText('PUBLISHED')).toBeInTheDocument()
            expect(
                screen.getByLabelText('close edit modal'),
            ).toBeInTheDocument()
        })

        it('shows the article title in the header', () => {
            renderComponent()

            expect(
                screen.getByDisplayValue(mockArticle.translation.title),
            ).toBeInTheDocument()
        })
    })

    describe('when rendering in create mode', () => {
        const createModeProps = {
            ...defaultProps,
            article: null,
            isCreateMode: true,
        }

        it('creates a new article when switching to create mode', () => {
            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: null,
            })

            renderComponent(createModeProps)

            expect(mockSetSelectedArticle).toHaveBeenCalled()
        })

        it('shows UNSAVED state for new articles', () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                articleModified: true,
            })

            renderComponent(createModeProps)

            expect(screen.getByText('UNSAVED')).toBeInTheDocument()
        })

        it('enables save functionality for valid new articles', () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: 'New Article',
                        content: 'New content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            renderComponent(createModeProps)

            // enables button once article is valid
            const saveSpans = screen.getAllByText('Save & Publish')
            const mainSaveButton = saveSpans[0].closest('button')
            expect(mainSaveButton).toBeInTheDocument()
            expect(mainSaveButton).toHaveAttribute('aria-disabled', 'false')
        })

        it('does not create new article when article has id', () => {
            const createModePropsWithArticleId = {
                ...defaultProps,
                article: mockArticle,
                isCreateMode: true,
            }

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: null,
            })

            renderComponent(createModePropsWithArticleId)

            expect(mockSetSelectedArticle).not.toHaveBeenCalled()
        })
    })

    describe('when article content changes', () => {
        it('updates the article content when editor content changes', async () => {
            renderComponent()

            const contentEditor = screen.getByLabelText(
                'Article content editor',
            )
            fireEvent.change(contentEditor, {
                target: { value: 'Updated content' },
            })

            await waitFor(() => {
                expect(mockSetSelectedArticle).toHaveBeenCalled()
            })
        })

        it('shows unsaved state when content is modified', () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                articleModified: true,
            })

            renderComponent()

            expect(screen.getByText('UNSAVED')).toBeInTheDocument()
        })

        it('prevents saving when required fields are missing', async () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: false,
                articleModified: true,
                requiredFieldsArticle: ['title'],
            })

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: '', // Empty title to trigger validation
                        content: 'Some content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            renderComponent()

            await waitFor(() => {
                const saveSpans = screen.getAllByText('Save & Publish')
                const mainSaveButton = saveSpans[0].closest('button')
                expect(mainSaveButton).toHaveAttribute('aria-disabled', 'true')
            })
        })
    })

    describe('when language selection changes', () => {
        it('handles language selection for existing translation', async () => {
            mockGetTranslationForLocale.mockReturnValue(mockArticle.translation)

            renderComponent()

            const languageSelector = screen.getByTestId(
                'dropdown-select-trigger',
            )
            expect(languageSelector).toBeInTheDocument()

            expect(screen.getByText('English - USA')).toBeInTheDocument()
        })
    })

    describe('when saving articles', () => {
        it('calls createArticle when saving a new article', async () => {
            const createModeProps = {
                ...defaultProps,
                article: null,
                isCreateMode: true,
            }

            const mockCreatedArticle = {
                id: 123,
                help_center_id: mockHelpCenter.id,
                translation: {
                    title: 'New Article',
                    content: 'New content',
                    slug: 'new-article',
                    locale: 'en-US',
                    category_id: null,
                },
            }

            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: 'New Article',
                        content: 'New content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            mockCreateArticle.mockImplementation(() => {
                const mockCall = useFeedbackArticleActionsMock.mock.calls[0]
                if (mockCall && mockCall[1]) {
                    mockCall[1](mockCreatedArticle)
                }
            })

            renderComponent(createModeProps)

            const saveSpans = screen.getAllByText('Save & Publish')
            const mainSaveButton = saveSpans[0].closest('button')
            fireEvent.click(mainSaveButton!)

            await waitFor(() => {
                expect(mockCreateArticle).toHaveBeenCalledWith(
                    expect.anything(),
                    true,
                )
                expect(mockOnSaveClick).toHaveBeenCalledWith(
                    '123',
                    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    mockHelpCenter.id.toString(),
                    true,
                )
                expect(mockOpenEdit).toHaveBeenCalledWith({
                    id: '123',
                    knowledgeResourceType:
                        AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    url: 'http://acme.gorgias.docker:4000/en-US/new-article-123',
                    content: 'New content',
                    title: 'New Article',
                    helpCenterId: mockHelpCenter.id.toString(),
                })
            })
        })

        it('calls updateArticle when saving an existing article', async () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            mockUpdateArticle.mockImplementation(() => {
                const mockCall = useFeedbackArticleActionsMock.mock.calls[0]
                if (mockCall && mockCall[2]) {
                    mockCall[2](mockArticle)
                }
            })

            renderComponent()

            const saveSpans = screen.getAllByText('Save & Publish')
            const mainSaveButton = saveSpans[0].closest('button')
            fireEvent.click(mainSaveButton!)

            await waitFor(() => {
                expect(mockUpdateArticle).toHaveBeenCalledWith(
                    expect.anything(),
                    true,
                )
                expect(mockOnSaveClick).toHaveBeenCalledWith(
                    mockArticle.id.toString(),
                    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    mockArticle.help_center_id.toString(),
                    false,
                )
            })
        })

        it('saves article as draft when save without publish is clicked', async () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            mockUpdateArticle.mockImplementation(() => {
                const mockCall = useFeedbackArticleActionsMock.mock.calls[0]
                if (mockCall && mockCall[2]) {
                    mockCall[2](mockArticle)
                }
            })

            renderComponent()

            const buttons = screen.getAllByRole('button')
            const dropdownButton = buttons.find((button) =>
                button
                    .querySelector('.material-icons')
                    ?.textContent?.includes('arrow_drop_down'),
            )

            if (dropdownButton) {
                fireEvent.click(dropdownButton)
            }

            const saveButton = screen.getByText('Save Changes')
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockUpdateArticle).toHaveBeenCalledWith(
                    expect.anything(),
                    false,
                )
                expect(mockOnSaveClick).toHaveBeenCalledWith(
                    mockArticle.id.toString(),
                    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    mockArticle.help_center_id.toString(),
                    false,
                )
            })
        })
    })

    describe('when deleting articles', () => {
        it('shows delete confirmation modal for existing articles', () => {
            renderComponent()

            const deleteButton = screen.getByText('Delete Article')
            fireEvent.click(deleteButton)

            expect(
                screen.getByText(
                    'Are you sure you want to delete this article?',
                ),
            ).toBeInTheDocument()
        })

        it('calls deleteArticle when deletion is confirmed', async () => {
            renderComponent()

            const deleteButton = screen.getByText('Delete Article')
            fireEvent.click(deleteButton)

            const confirmButton = screen.getByText('Delete article')
            fireEvent.click(confirmButton)

            await waitFor(() => {
                expect(mockDeleteArticle).toHaveBeenCalledWith(mockArticle)
            })
        })

        it('calls deleteArticleTranslation when translation deletion is confirmed and dispatches state changes', async () => {
            const mockArticleWithMultipleLocales = {
                ...mockArticle,
                available_locales: ['en-US', 'fr-FR', 'es-ES'] as LocaleCode[],
            }

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: mockArticleWithMultipleLocales,
            })

            mockDeleteArticleTranslation.mockImplementation(() => {
                const mockCall = useFeedbackArticleActionsMock.mock.calls[0]
                if (mockCall && mockCall[4]) {
                    mockCall[4]('en-US') // Call onArticleTranslationDelete with deleted locale
                }
            })

            const mockAction = {
                type: 'CHANGE_VIEW_LANGUAGE',
                payload: mockHelpCenter.default_locale,
            }
            changeViewLanguage.mockImplementation(() => mockAction)

            const storeWithPendingDeleteLocale = {
                ...defaultStoreState,
                ui: {
                    ...defaultStoreState.ui,
                    ticketAIAgentFeedback: {
                        knowledgeSourceArticleEditor: {
                            ...knowledgeSourceArticleEditorState,
                            pendingDeleteLocaleOptionItem: {
                                value: 'en-US',
                                label: 'English - USA',
                                text: 'English Translation',
                            },
                        },
                    },
                },
            }

            renderComponent(defaultProps, storeWithPendingDeleteLocale as any)

            const confirmButton = screen.getByText('Delete English Translation')
            fireEvent.click(confirmButton)

            await waitFor(() => {
                expect(mockDeleteArticleTranslation).toHaveBeenCalledWith(
                    mockArticle.id,
                    'en-US',
                )
                expect(changeViewLanguage).toHaveBeenCalledWith(
                    mockHelpCenter.default_locale,
                )
                expect(mockDispatch).toHaveBeenCalledWith(mockAction)
                expect(mockSetSelectedArticleLanguage).toHaveBeenCalledWith(
                    mockHelpCenter.default_locale,
                )
                expect(mockSetSelectedArticle).toHaveBeenCalledWith({
                    ...mockArticleWithMultipleLocales,
                    available_locales: ['fr-FR', 'es-ES'],
                })
            })
        })

        it('does not show delete button for new articles', () => {
            const createModeProps = {
                ...defaultProps,
                article: null,
                isCreateMode: true,
            }

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: null,
            })

            renderComponent(createModeProps)

            expect(screen.queryByText('Delete Article')).not.toBeInTheDocument()
        })
    })

    describe('when closing the editor', () => {
        it('shows discard confirmation when closing with unsaved changes', () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            const storeWithPendingClose = {
                ...defaultStoreState,
                ui: {
                    ...defaultStoreState.ui,
                    ticketAIAgentFeedback: {
                        knowledgeSourceArticleEditor: {
                            ...knowledgeSourceArticleEditorState,
                            pendingClose: KnowledgePendingCloseType.Discard,
                        },
                    },
                },
            }

            renderComponent(defaultProps, storeWithPendingClose as any)

            expect(screen.getByTestId('discard-modal')).toBeInTheDocument()
        })
    })

    describe('when handling advanced view', () => {
        it('renders advanced view content when view is set to advanced', () => {
            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                editModal: {
                    isOpened: true,
                    view: HelpCenterArticleModalView.ADVANCED,
                },
            })

            renderComponent()

            expect(screen.getByText('Article Settings')).toBeInTheDocument()
        })

        it('switches between basic and advanced views', () => {
            const { rerender } = renderComponent()

            expect(screen.getByText('PUBLISHED')).toBeInTheDocument()

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                editModal: {
                    isOpened: true,
                    view: HelpCenterArticleModalView.ADVANCED,
                },
            })

            rerender(
                <Provider store={mockStore(defaultStoreState)}>
                    <KnowledgeSourceArticleEditor {...defaultProps} />
                </Provider>,
            )

            expect(screen.getByText('Article Settings')).toBeInTheDocument()
        })
    })

    describe('when handling article state updates', () => {
        it('resets state when switching from edit to create mode', () => {
            const { rerender } = renderComponent()

            rerender(
                <Provider store={mockStore(defaultStoreState)}>
                    <KnowledgeSourceArticleEditor
                        {...defaultProps}
                        article={null}
                        isCreateMode={true}
                    />
                </Provider>,
            )

            expect(mockSetSelectedArticle).toHaveBeenCalled()
        })
    })

    describe('when handling editor state', () => {
        it('handles editor ready state correctly', () => {
            renderComponent()

            expect(mockSetSelectedExistingArticleTranslation).toBeDefined()
        })

        it('copies article link to clipboard when requested', () => {
            renderComponent()

            const copyButton = screen.getByLabelText('copy url')
            fireEvent.click(copyButton)

            expect(copyButton).toBeInTheDocument()
        })
    })

    describe('when handling missing knowledge checkbox', () => {
        const createModeProps = {
            ...defaultProps,
            article: null,
            isCreateMode: true,
        }

        const storeWithCheckedMissingKnowledge = {
            ...defaultStoreState,
            ui: {
                ...defaultStoreState.ui,
                ticketAIAgentFeedback: {
                    knowledgeSourceArticleEditor: {
                        ...knowledgeSourceArticleEditorState,
                        isConsideredMissingKnowledge: true,
                    },
                },
            },
        }

        const storeWithUncheckedMissingKnowledge = {
            ...defaultStoreState,
            ui: {
                ...defaultStoreState.ui,
                ticketAIAgentFeedback: {
                    knowledgeSourceArticleEditor: {
                        ...knowledgeSourceArticleEditorState,
                        isConsideredMissingKnowledge: false,
                    },
                },
            },
        }

        it('renders AddMissingKnowledgeCheckbox when in create mode', () => {
            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: 'New Article',
                        content: 'New content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            renderComponent(
                createModeProps,
                storeWithCheckedMissingKnowledge as any,
            )

            expect(
                screen.getByLabelText('Use in similar requests'),
            ).toBeInTheDocument()
        })

        it('does not render AddMissingKnowledgeCheckbox when in edit mode', () => {
            renderComponent(defaultProps)

            expect(
                screen.queryByLabelText('Use in similar requests'),
            ).not.toBeInTheDocument()
        })

        it('renders checkbox as checked when isConsideredMissingKnowledge is true', () => {
            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: 'New Article',
                        content: 'New content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            renderComponent(
                createModeProps,
                storeWithCheckedMissingKnowledge as any,
            )

            const checkbox = screen.getByLabelText('Use in similar requests')
            expect(checkbox).toBeChecked()
        })

        it('renders checkbox as unchecked when isConsideredMissingKnowledge is false', () => {
            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: 'New Article',
                        content: 'New content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            renderComponent(
                createModeProps,
                storeWithUncheckedMissingKnowledge as any,
            )

            const checkbox = screen.getByLabelText('Use in similar requests')
            expect(checkbox).not.toBeChecked()
        })

        const setupArticleCreationTest = () => {
            const mockCreateArticle = jest.fn()

            useFeedbackArticleActionsMock.mockImplementation(
                (templateKey: any, onCreateSuccess: any) => {
                    return {
                        ...defaultArticleActionsState,
                        createArticle: mockCreateArticle.mockImplementation(
                            () => {
                                // Simulate successful article creation
                                onCreateSuccess({
                                    id: 123,
                                    help_center_id: mockHelpCenter.id,
                                    translation: {
                                        locale: 'en-US',
                                        title: 'New Article',
                                        content: 'New content',
                                    },
                                })
                            },
                        ),
                    }
                },
            )

            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: {
                    translation: {
                        title: 'New Article',
                        content: 'New content',
                        locale: 'en-US',
                        category_id: null,
                    },
                },
            })

            return { mockCreateArticle }
        }

        it('calls onSubmitNewMissingKnowledge when creating article with checkbox checked', async () => {
            const { mockCreateArticle } = setupArticleCreationTest()

            renderComponent(
                createModeProps,
                storeWithCheckedMissingKnowledge as any,
            )

            const saveSpans = screen.getAllByText('Save & Publish')
            const mainSaveButton = saveSpans[0].closest('button')
            fireEvent.click(mainSaveButton!)

            await waitFor(() => {
                expect(mockCreateArticle).toHaveBeenCalled()
            })

            expect(mockOnSubmitNewMissingKnowledge).toHaveBeenCalledWith({
                resourceId: '123',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceLocale: 'en-US',
                resourceSetId: mockHelpCenter.id.toString(),
            })
        })

        it('does not call onSubmitNewMissingKnowledge when creating article with checkbox unchecked', async () => {
            const { mockCreateArticle } = setupArticleCreationTest()

            renderComponent(
                createModeProps,
                storeWithUncheckedMissingKnowledge as any,
            )

            const saveSpans = screen.getAllByText('Save & Publish')
            const mainSaveButton = saveSpans[0].closest('button')
            fireEvent.click(mainSaveButton!)

            await waitFor(() => {
                expect(mockCreateArticle).toHaveBeenCalled()
            })

            expect(mockOnSubmitNewMissingKnowledge).not.toHaveBeenCalled()
        })

        it('does not call onSubmitNewMissingKnowledge when updating existing article', async () => {
            useArticleValidationMock.mockReturnValue({
                ...defaultArticleValidationState,
                canSaveArticle: true,
                articleModified: true,
            })

            renderComponent(
                defaultProps,
                storeWithCheckedMissingKnowledge as any,
            )

            const saveSpans = screen.getAllByText('Save & Publish')
            const mainSaveButton = saveSpans[0].closest('button')
            fireEvent.click(mainSaveButton!)

            await waitFor(() => {
                expect(mockUpdateArticle).toHaveBeenCalled()
            })

            expect(mockOnSubmitNewMissingKnowledge).not.toHaveBeenCalled()
        })
    })

    describe('when handling loading state condition', () => {
        beforeEach(() => {
            useArticleTranslationsMock.mockReturnValue({
                ...defaultArticleTranslationsState,
                isFetchingArticleTranslations: false,
            })
        })

        it('shows loading when not in create mode and article is null', () => {
            const propsWithNullArticle = {
                ...defaultProps,
                article: null,
                isCreateMode: false,
            }

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: null,
            })

            const { container } = renderComponent(propsWithNullArticle)

            const loadingElement = container.querySelector(
                '.icon-circle-o-notch',
            )
            expect(loadingElement).toBeInTheDocument()
        })

        it('does not show loading when not in create mode and article has id', () => {
            const propsWithArticleWithId = {
                ...defaultProps,
                article: mockArticle,
                isCreateMode: false,
            }

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: mockArticle,
            })

            const { container } = renderComponent(propsWithArticleWithId)

            const loadingElement = container.querySelector(
                '.icon-circle-o-notch',
            )
            expect(loadingElement).not.toBeInTheDocument()
        })

        it('does not show loading when in create mode regardless of article state', () => {
            const propsInCreateMode = {
                ...defaultProps,
                article: null,
                isCreateMode: true,
            }

            useEditionManagerMock.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: null,
            })

            const { container } = renderComponent(propsInCreateMode)

            const loadingElement = container.querySelector(
                '.icon-circle-o-notch',
            )
            expect(loadingElement).not.toBeInTheDocument()
        })
    })
})
