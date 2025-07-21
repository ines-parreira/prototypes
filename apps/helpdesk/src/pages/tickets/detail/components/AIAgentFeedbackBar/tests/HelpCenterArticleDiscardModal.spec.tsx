import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { LocaleCode } from 'models/helpCenter/types'
import {
    getArticleFixture,
    getCreateArticleDtoFixture,
} from 'pages/aiAgent/fixtures/article.fixture'

import { HelpCenterArticleDiscardModal } from '../HelpCenterArticleDiscardModal'
import { KnowledgePendingCloseType } from '../types'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('pages/settings/helpCenter/providers/EditionManagerContext')

const mockDispatch = jest.fn()
const mockUseAppSelector = jest.fn()
const mockUseEditionManager = jest.fn()

require('hooks/useAppDispatch').default = () => mockDispatch
require('hooks/useAppSelector').default = mockUseAppSelector

const mockEditionManagerContext = require('pages/settings/helpCenter/providers/EditionManagerContext')
mockEditionManagerContext.useEditionManager = mockUseEditionManager

const mockStore = configureMockStore()

const mockDefaultState = {
    ui: {
        ticketAIAgentFeedback: {
            knowledgeSourceArticleEditor: {
                pendingClose: KnowledgePendingCloseType.Article,
            },
        },
    },
}

describe('HelpCenterArticleDiscardModal', () => {
    const createArticleMock = jest.fn()
    const updateArticleMock = jest.fn()
    const setSelectedArticleMock = jest.fn()
    const onAfterCloseMock = jest.fn()

    const defaultProps = {
        isOpen: true,
        createArticle: createArticleMock,
        updateArticle: updateArticleMock,
        onAfterClose: onAfterCloseMock,
    }

    const defaultEditionManagerState = {
        selectedArticle: null,
        setSelectedArticle: setSelectedArticleMock,
        selectedArticleLanguage: 'en-US' as LocaleCode,
    }

    const renderWithProviders = (props = {}, stateOverrides = {}) => {
        const mockState = {
            ...mockDefaultState,
            ui: {
                ...mockDefaultState.ui,
                ticketAIAgentFeedback: {
                    ...mockDefaultState.ui.ticketAIAgentFeedback,
                    knowledgeSourceArticleEditor: {
                        ...mockDefaultState.ui.ticketAIAgentFeedback
                            .knowledgeSourceArticleEditor,
                        ...stateOverrides,
                    },
                },
            },
        }

        mockUseAppSelector.mockImplementation((selector) => selector(mockState))

        const store = mockStore({})
        return render(
            <Provider store={store}>
                <HelpCenterArticleDiscardModal {...defaultProps} {...props} />
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockDispatch.mockClear()
        mockUseEditionManager.mockReturnValue(defaultEditionManagerState)
    })

    describe('when rendering the modal', () => {
        it('should display correct title and content for article pending close type', () => {
            renderWithProviders(
                {},
                { pendingClose: KnowledgePendingCloseType.Article },
            )

            expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
            expect(
                screen.getByText(
                    "Do you want to save the changes made to this article? All changes will be lost if you don't save them.",
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Save')).toBeInTheDocument()
            expect(screen.getByText("Don't save")).toBeInTheDocument()
            expect(screen.getByText('Back to editing')).toBeInTheDocument()
        })

        it('should display correct title and content for discard pending close type', () => {
            renderWithProviders(
                {},
                { pendingClose: KnowledgePendingCloseType.Discard },
            )

            expect(screen.getByText('Quit without saving?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'By discarding changes you will lose all progress you made editing. Are you sure you want to proceed?',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Save')).toBeInTheDocument()
            expect(screen.getByText("Don't save")).toBeInTheDocument()
            expect(screen.getByText('Back to editing')).toBeInTheDocument()
        })

        it('should not display modal content when pendingClose is null', () => {
            renderWithProviders({}, { pendingClose: null })

            expect(
                screen.queryByText('Unsaved changes'),
            ).not.toBeInTheDocument()
        })

        it('should not display modal content when isOpen is false', () => {
            renderWithProviders({ isOpen: false })

            expect(
                screen.queryByText('Unsaved changes'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when user clicks discard button', () => {
        it('should dispatch setPendingClose(null) and call onAfterClose', () => {
            renderWithProviders()

            fireEvent.click(screen.getByText("Don't save"))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: expect.any(String),
                payload: null,
            })
            expect(onAfterCloseMock).toHaveBeenCalledTimes(1)
        })

        it('should dispatch setPendingClose(null) and not fail when onAfterClose is provided', () => {
            renderWithProviders()

            fireEvent.click(screen.getByText("Don't save"))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: expect.any(String),
                payload: null,
            })
            expect(onAfterCloseMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('when user clicks back to editing button', () => {
        it('should dispatch setPendingClose(null)', () => {
            renderWithProviders()

            fireEvent.click(screen.getByText('Back to editing'))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: expect.any(String),
                payload: null,
            })
        })
    })

    describe('when user clicks save button', () => {
        it('should not call any action when selectedArticle is null', async () => {
            mockUseEditionManager.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle: null,
            })

            renderWithProviders()

            fireEvent.click(screen.getByText('Save'))

            await waitFor(() => {
                expect(createArticleMock).not.toHaveBeenCalled()
                expect(updateArticleMock).not.toHaveBeenCalled()
            })
        })

        it('should call createArticle when selectedArticle is a new article', async () => {
            createArticleMock.mockResolvedValue(undefined)
            const selectedArticle = getCreateArticleDtoFixture()

            mockUseEditionManager.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle,
            })

            renderWithProviders()

            fireEvent.click(screen.getByText('Save'))

            await waitFor(() => {
                expect(createArticleMock).toHaveBeenCalledWith(
                    selectedArticle,
                    false,
                )
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: expect.any(String),
                    payload: null,
                })
            })
        })

        it('should call updateArticle and add locale when selectedArticle is an existing article', async () => {
            updateArticleMock.mockResolvedValue(undefined)
            const selectedArticle = getArticleFixture(1, {
                available_locales: ['fr-FR'],
            })
            const selectedArticleLanguage = 'en-US'

            mockUseEditionManager.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle,
                selectedArticleLanguage,
            })

            renderWithProviders()

            fireEvent.click(screen.getByText('Save'))

            await waitFor(() => {
                expect(setSelectedArticleMock).toHaveBeenCalledWith({
                    ...selectedArticle,
                    available_locales: ['fr-FR', 'en-US'],
                })
                expect(updateArticleMock).toHaveBeenCalledWith(
                    selectedArticle,
                    false,
                )
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: expect.any(String),
                    payload: null,
                })
                expect(onAfterCloseMock).toHaveBeenCalledTimes(1)
            })
        })

        it('should not add duplicate locale to available_locales when locale already exists', async () => {
            updateArticleMock.mockResolvedValue(undefined)
            const selectedArticle = getArticleFixture(1, {
                available_locales: ['en-US', 'fr-FR'],
            })
            const selectedArticleLanguage = 'en-US'

            mockUseEditionManager.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle,
                selectedArticleLanguage,
            })

            renderWithProviders()

            fireEvent.click(screen.getByText('Save'))

            await waitFor(() => {
                expect(setSelectedArticleMock).toHaveBeenCalledWith({
                    ...selectedArticle,
                    available_locales: ['en-US', 'fr-FR'],
                })
            })
        })
    })

    describe('when handling complete workflows', () => {
        it('should successfully complete the workflow for new article creation', async () => {
            createArticleMock.mockResolvedValue(undefined)
            const selectedArticle = getCreateArticleDtoFixture()

            mockUseEditionManager.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle,
            })

            renderWithProviders(
                {},
                { pendingClose: KnowledgePendingCloseType.Article },
            )

            expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
            expect(
                screen.getByText(
                    "Do you want to save the changes made to this article? All changes will be lost if you don't save them.",
                ),
            ).toBeInTheDocument()

            fireEvent.click(screen.getByText('Save'))

            await waitFor(() => {
                expect(createArticleMock).toHaveBeenCalledWith(
                    selectedArticle,
                    false,
                )
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: expect.any(String),
                    payload: null,
                })
            })
        })

        it('should successfully complete the workflow for existing article update', async () => {
            updateArticleMock.mockResolvedValue(undefined)
            const selectedArticle = getArticleFixture(42, {
                available_locales: ['fr-FR'],
            })

            mockUseEditionManager.mockReturnValue({
                ...defaultEditionManagerState,
                selectedArticle,
                selectedArticleLanguage: 'en-US',
            })

            renderWithProviders(
                {},
                { pendingClose: KnowledgePendingCloseType.Discard },
            )

            expect(screen.getByText('Quit without saving?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'By discarding changes you will lose all progress you made editing. Are you sure you want to proceed?',
                ),
            ).toBeInTheDocument()

            fireEvent.click(screen.getByText('Save'))

            await waitFor(() => {
                expect(setSelectedArticleMock).toHaveBeenCalledWith({
                    ...selectedArticle,
                    available_locales: ['fr-FR', 'en-US'],
                })
                expect(updateArticleMock).toHaveBeenCalledWith(
                    selectedArticle,
                    false,
                )
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: expect.any(String),
                    payload: null,
                })
                expect(onAfterCloseMock).toHaveBeenCalledTimes(1)
            })
        })
    })
})
