import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticleVersionBanner } from './ArticleVersionBanner'
import { useArticleContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

jest.mock('@repo/utils', () => ({
    DateAndTimeFormatting: { CompactDateWithTime: 'CompactDateWithTime' },
    formatDatetime: jest.fn(() => 'Jan 1, 2024 12:00 PM'),
    isProduction: jest.fn(),
    isStaging: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn((fn: () => unknown) => fn()),
}))

jest.mock('state/currentUser/selectors', () => ({
    getTimezone: jest.fn(() => 'UTC'),
    getDateAndTimeFormatter: jest.fn(() => () => 'MM/dd/yyyy HH:mm'),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetUser: () => ({ data: undefined }),
}))

jest.mock('./hooks/useVersionBanner', () => ({
    useVersionBanner: jest.fn(),
}))

jest.mock('./hooks/useVersionHistory', () => ({
    useVersionHistory: jest.fn(),
}))

jest.mock('./context', () => ({
    useArticleContext: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: () => ({
        client: {} as any,
    }),
}))

jest.mock('models/helpCenter/resources', () => ({
    getHelpCenterArticle: jest.fn(),
}))

const mockUseVersionBanner = useVersionBanner as jest.Mock
const mockUseVersionHistory = useVersionHistory as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

const renderComponent = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <ArticleVersionBanner />
        </QueryClientProvider>,
    )
}

describe('ArticleVersionBanner', () => {
    let mockSwitchVersion: jest.Mock

    const createMockVersionBanner = (
        overrides: Partial<{
            isViewingDraft: boolean
            hasDraftVersion: boolean
            hasPublishedVersion: boolean
            isDisabled: boolean
        }> = {},
    ) => ({
        isViewingDraft: overrides.isViewingDraft ?? false,
        hasDraftVersion: overrides.hasDraftVersion ?? true,
        hasPublishedVersion: overrides.hasPublishedVersion ?? true,
        isDisabled: overrides.isDisabled ?? false,
        switchVersion: mockSwitchVersion,
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockSwitchVersion = jest.fn()
        mockUseVersionBanner.mockReturnValue(createMockVersionBanner())
        mockUseVersionHistory.mockReturnValue({
            isViewingHistoricalVersion: false,
            onGoToLatest: jest.fn(),
        })
        mockUseArticleContext.mockReturnValue({
            state: {
                historicalVersion: null,
                articleMode: 'read',
                currentLocale: 'en',
                article: { id: 123 } as any,
            },
            dispatch: jest.fn(),
            config: {
                helpCenter: { id: 1 },
            } as any,
        })
    })

    describe('visibility conditions', () => {
        it('should return null when hasDraftVersion is false', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: false,
                    hasPublishedVersion: true,
                }),
            )

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('should return null when hasPublishedVersion is false', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: true,
                    hasPublishedVersion: false,
                }),
            )

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('should return null when both hasDraftVersion and hasPublishedVersion are false', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: false,
                    hasPublishedVersion: false,
                }),
            )

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('should render banner when both versions exist', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: true,
                    hasPublishedVersion: true,
                }),
            )

            renderComponent()

            expect(screen.getByText(/published version/i)).toBeInTheDocument()
        })
    })

    describe('viewing draft version', () => {
        beforeEach(() => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    isViewingDraft: true,
                    hasDraftVersion: true,
                    hasPublishedVersion: true,
                }),
            )
        })

        it('should render draft version message', () => {
            renderComponent()

            expect(
                screen.getByText(/This is a draft version/i),
            ).toBeInTheDocument()
        })

        it('should render link to published version', () => {
            renderComponent()

            expect(screen.getByText('published version')).toBeInTheDocument()
        })

        it('should render description about editing draft', () => {
            renderComponent()

            expect(
                screen.getByText(
                    /Edit, test, and publish your draft to update the published version/i,
                ),
            ).toBeInTheDocument()
        })

        it('should call switchVersion when clicking published version link', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByText('published version'))

            expect(mockSwitchVersion).toHaveBeenCalled()
        })

        it('should not call switchVersion when disabled', async () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    isViewingDraft: true,
                    hasDraftVersion: true,
                    hasPublishedVersion: true,
                    isDisabled: true,
                }),
            )
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByText('published version'))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
        })

        describe('diff toggle when viewing draft', () => {
            beforeEach(() => {
                mockUseVersionHistory.mockReturnValue({
                    isViewingHistoricalVersion: false,
                    onGoToLatest: jest.fn(),
                })
            })

            it('renders diff toggle when viewing draft with published version', () => {
                renderComponent()

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).not.toBeChecked()
            })

            it('renders checked toggle when in diff mode on draft', () => {
                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'diff',
                        historicalVersion: null,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: jest.fn(),
                    config: {
                        helpCenter: { id: 1 },
                    } as any,
                })

                renderComponent()

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).toBeChecked()
            })

            it('fetches and dispatches SET_COMPARISON_VERSION when toggling to diff mode on draft', async () => {
                const { getHelpCenterArticle } = await import(
                    'models/helpCenter/resources'
                )
                const mockGetArticle = jest.mocked(getHelpCenterArticle)
                const mockDispatch = jest.fn()

                mockGetArticle.mockResolvedValue({
                    id: 123,
                    translation: {
                        title: 'Published Title',
                        content: 'Published Content',
                    },
                } as any)

                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'read',
                        historicalVersion: null,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: mockDispatch,
                    config: {
                        helpCenter: { id: 1 },
                    } as any,
                })

                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockGetArticle).toHaveBeenCalledWith(
                    {} as any,
                    { help_center_id: 1, id: 123 },
                    { locale: 'en', version_status: 'current' },
                    { throwOn404: undefined },
                )

                await screen.findByRole('switch')

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_COMPARISON_VERSION',
                    payload: {
                        title: 'Published Title',
                        content: 'Published Content',
                    },
                })
            })

            it('reuses cached published version when toggling to diff repeatedly without state changes', async () => {
                const { getHelpCenterArticle } = await import(
                    'models/helpCenter/resources'
                )
                const mockGetArticle = jest.mocked(getHelpCenterArticle)

                mockGetArticle.mockResolvedValue({
                    id: 123,
                    translation: {
                        title: 'Published Title',
                        content: 'Published Content',
                    },
                } as any)

                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))
                await user.click(screen.getByRole('switch'))

                expect(mockGetArticle).toHaveBeenCalledTimes(1)
            })

            it('dispatches CLEAR_HISTORICAL_VERSION when toggling off from draft', async () => {
                const mockDispatch = jest.fn()

                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'diff',
                        historicalVersion: null,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: mockDispatch,
                    config: {
                        helpCenter: { id: 1 },
                    } as any,
                })

                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'read',
                })
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'CLEAR_HISTORICAL_VERSION',
                })
            })

            it('does not render diff toggle when viewing draft without published version', () => {
                mockUseVersionBanner.mockReturnValue(
                    createMockVersionBanner({
                        isViewingDraft: true,
                        hasDraftVersion: true,
                        hasPublishedVersion: false,
                    }),
                )

                renderComponent()

                expect(
                    screen.queryByText('Compare to current'),
                ).not.toBeInTheDocument()
                expect(screen.queryByRole('switch')).not.toBeInTheDocument()
            })
        })
    })

    describe('viewing published version', () => {
        beforeEach(() => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    isViewingDraft: false,
                    hasDraftVersion: true,
                    hasPublishedVersion: true,
                }),
            )
        })

        it('should render published version message', () => {
            renderComponent()

            expect(
                screen.getByText(/This is a published version/i),
            ).toBeInTheDocument()
        })

        it('should render link to draft version', () => {
            renderComponent()

            expect(screen.getByText('draft version')).toBeInTheDocument()
        })

        it('should not render description (only shown for draft view)', () => {
            renderComponent()

            expect(
                screen.queryByText(/Edit, test, and publish/i),
            ).not.toBeInTheDocument()
        })

        it('should call switchVersion when clicking draft version link', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByText('draft version'))

            expect(mockSwitchVersion).toHaveBeenCalled()
        })

        it('should not call switchVersion when disabled', async () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    isViewingDraft: false,
                    hasDraftVersion: true,
                    hasPublishedVersion: true,
                    isDisabled: true,
                }),
            )
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByText('draft version'))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
        })
    })

    describe('viewing historical version', () => {
        const mockDispatch = jest.fn()
        const mockOnGoToLatest = jest.fn()

        const historicalVersion = {
            versionId: 42,
            version: 3,
            title: 'Old title',
            content: 'Old content',
            publishedDatetime: '2025-03-15T14:30:00Z',
            commitMessage: 'Fixed article content',
        }

        beforeEach(() => {
            mockUseVersionHistory.mockReturnValue({
                isViewingHistoricalVersion: true,
                onGoToLatest: mockOnGoToLatest,
            })
            mockUseArticleContext.mockReturnValue({
                state: {
                    articleMode: 'read',
                    historicalVersion,
                    currentLocale: 'en',
                    article: { id: 123 } as any,
                },
                dispatch: mockDispatch,
                config: {
                    helpCenter: { id: 1 },
                } as any,
            })
        })

        it('should render historical version banner', () => {
            renderComponent()

            expect(
                screen.getByText(/You are viewing a previous version/i),
            ).toBeInTheDocument()
        })

        it('should render commit message when provided', () => {
            renderComponent()

            expect(
                screen.getByText(/Fixed article content/i),
            ).toBeInTheDocument()
        })

        it('should not render commit message when not provided', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    articleMode: 'read',
                    historicalVersion: {
                        ...historicalVersion,
                        commitMessage: undefined,
                    },
                    currentLocale: 'en',
                    article: { id: 123 } as any,
                },
                dispatch: mockDispatch,
                config: {
                    helpCenter: { id: 1 },
                } as any,
            })

            renderComponent()

            expect(
                screen.queryByText(/Changes in this version/i),
            ).not.toBeInTheDocument()
        })

        it('should call onGoToLatest when "Back to latest" is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /Back to latest/i }),
            )

            expect(mockOnGoToLatest).toHaveBeenCalledTimes(1)
        })

        it('should not render a restore button in the banner', () => {
            renderComponent()

            expect(
                screen.queryByRole('button', {
                    name: /Restore this version/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should disable back to latest button when isDisabled is true', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({ isDisabled: true }),
            )

            renderComponent()

            expect(
                screen.getByRole('button', { name: /Back to latest/i }),
            ).toBeDisabled()
        })

        describe('conversation copy', () => {
            it('renders conversation-specific copy when initialVersionId matches historicalVersion', () => {
                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'read',
                        historicalVersion,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: mockDispatch,
                    config: {
                        helpCenter: { id: 1 },
                        initialVersionId: 42,
                    } as any,
                })

                renderComponent()

                expect(
                    screen.getByText(
                        /This is the version used in this conversation/i,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', {
                        name: /View latest version/i,
                    }),
                ).toBeInTheDocument()
            })

            it('renders default copy when initialVersionId differs from viewed version', () => {
                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'read',
                        historicalVersion,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: mockDispatch,
                    config: {
                        helpCenter: { id: 1 },
                        initialVersionId: 99,
                    } as any,
                })

                renderComponent()

                expect(
                    screen.getByText(/You are viewing a previous version/i),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', {
                        name: /Back to latest/i,
                    }),
                ).toBeInTheDocument()
            })

            it('renders default copy when no initialVersionId is set', () => {
                renderComponent()

                expect(
                    screen.getByText(/You are viewing a previous version/i),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', {
                        name: /Back to latest/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        describe('diff toggle', () => {
            it('should render unchecked toggle when not in diff mode', () => {
                renderComponent()

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).not.toBeChecked()
            })

            it('should render checked toggle when in diff mode', () => {
                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'diff',
                        historicalVersion,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: mockDispatch,
                    config: {
                        helpCenter: { id: 1 },
                    } as any,
                })

                renderComponent()

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).toBeChecked()
            })

            it('should dispatch SET_MODE with "diff" when toggle is clicked on', async () => {
                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'diff',
                })
            })

            it('fetches and dispatches SET_COMPARISON_VERSION when toggling to diff mode', async () => {
                const { getHelpCenterArticle } = await import(
                    'models/helpCenter/resources'
                )
                const mockGetArticle = jest.mocked(getHelpCenterArticle)

                mockGetArticle.mockResolvedValue({
                    id: 123,
                    translation: {
                        title: 'Current Published Title',
                        content: 'Current Published Content',
                    },
                } as any)

                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockGetArticle).toHaveBeenCalledWith(
                    {} as any,
                    { help_center_id: 1, id: 123 },
                    { locale: 'en', version_status: 'current' },
                    { throwOn404: undefined },
                )

                await screen.findByRole('switch')

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_COMPARISON_VERSION',
                    payload: {
                        title: 'Current Published Title',
                        content: 'Current Published Content',
                    },
                })
            })

            it('handles error when fetching published version fails', async () => {
                const { getHelpCenterArticle } = await import(
                    'models/helpCenter/resources'
                )
                const mockGetArticle = jest.mocked(getHelpCenterArticle)
                const consoleErrorSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation()

                mockGetArticle.mockRejectedValue(new Error('Failed to fetch'))

                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                await screen.findByRole('switch')

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to fetch published version:',
                    expect.any(Error),
                )

                consoleErrorSpy.mockRestore()
            })

            it('does not dispatch SET_COMPARISON_VERSION when published version is null', async () => {
                const { getHelpCenterArticle } = await import(
                    'models/helpCenter/resources'
                )
                const mockGetArticle = jest.mocked(getHelpCenterArticle)

                mockGetArticle.mockResolvedValue(null)

                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                await screen.findByRole('switch')

                expect(mockDispatch).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'SET_COMPARISON_VERSION',
                    }),
                )
            })

            it('should dispatch SET_MODE with "read" when toggle is clicked off', async () => {
                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'diff',
                        historicalVersion,
                        currentLocale: 'en',
                        article: { id: 123 } as any,
                    },
                    dispatch: mockDispatch,
                    config: {
                        helpCenter: { id: 1 },
                    } as any,
                })
                const user = userEvent.setup()
                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'read',
                })
            })

            it('should disable toggle when isDisabled is true', () => {
                mockUseVersionBanner.mockReturnValue(
                    createMockVersionBanner({ isDisabled: true }),
                )

                renderComponent()

                expect(screen.getByRole('switch')).toBeDisabled()
            })
        })
    })

    describe('when not viewing historical version', () => {
        it('should not render the diff toggle', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    articleMode: 'read',
                    historicalVersion: null,
                    currentLocale: 'en',
                    article: { id: 123 } as any,
                },
                dispatch: jest.fn(),
                config: {
                    helpCenter: { id: 1 },
                } as any,
            })

            renderComponent()

            expect(
                screen.queryByText('Compare to current'),
            ).not.toBeInTheDocument()
            expect(screen.queryByRole('switch')).not.toBeInTheDocument()
        })
    })
})
