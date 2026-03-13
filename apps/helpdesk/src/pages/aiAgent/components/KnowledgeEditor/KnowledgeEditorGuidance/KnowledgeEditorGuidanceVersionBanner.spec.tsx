import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { appQueryClient } from 'api/queryClient'
import {
    getDateAndTimeFormatter,
    getTimezone,
} from 'state/currentUser/selectors'

import type { VersionBannerState } from './hooks/useVersionBanner'
import type { VersionHistoryData } from './hooks/useVersionHistory'
import { KnowledgeEditorGuidanceVersionBanner } from './KnowledgeEditorGuidanceVersionBanner'

const mockSwitchVersion = jest.fn()
const mockOnGoToLatest = jest.fn()
const mockOnSelectVersion = jest.fn()
const mockDispatch = jest.fn()

const mockUseVersionBanner = jest.fn<VersionBannerState, []>()
const mockUseVersionHistory = jest.fn<VersionHistoryData, []>()
const mockUseGuidanceContext = jest.fn()
const mockUseGuidanceStore = jest.fn()

jest.mock('./hooks/useVersionBanner', () => ({
    useVersionBanner: () => mockUseVersionBanner(),
}))

jest.mock('./hooks/useVersionHistory', () => ({
    useVersionHistory: () => mockUseVersionHistory(),
}))

jest.mock('./context', () => ({
    useGuidanceContext: () => mockUseGuidanceContext(),
    useGuidanceStore: (selector: (storeState: unknown) => unknown) =>
        mockUseGuidanceStore(selector),
    fromArticleTranslation: (article: any) => ({
        title: article.translation?.title ?? article.title,
        content: article.translation?.content ?? article.content,
        id: article.id,
    }),
}))

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetUser: () => ({ data: undefined }),
}))

jest.mock('state/currentUser/selectors', () => ({
    getTimezone: jest.fn(),
    getDateAndTimeFormatter: jest.fn(() => () => {}),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: () => ({ client: {} }),
}))

jest.mock('models/helpCenter/resources', () => ({
    getHelpCenterArticle: jest.fn(),
}))

const defaultMockState: VersionBannerState = {
    isViewingDraft: true,
    hasDraftVersion: true,
    hasPublishedVersion: true,
    isDisabled: false,
    switchVersion: mockSwitchVersion,
}

const defaultContextValue = {
    state: {
        historicalVersion: null,
        guidanceMode: 'read' as const,
        guidance: { id: 1 },
    },
    dispatch: mockDispatch,
    config: {
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
    },
}

const getStoreValue = () => {
    const contextValue = mockUseGuidanceContext()

    return {
        state: contextValue.state,
        config: contextValue.config,
        dispatch: contextValue.dispatch,
        guidanceArticle:
            contextValue.guidanceArticle ?? contextValue.state?.guidance,
        playground: contextValue.playground ?? ({} as any),
        setConfig: jest.fn(),
        setGuidanceArticle: jest.fn(),
        setPlayground: jest.fn(),
    }
}

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
            <KnowledgeEditorGuidanceVersionBanner />
        </QueryClientProvider>,
    )
}

const mockGetTimezone = jest.mocked(getTimezone)
const mockGetDateAndTimeFormatter = jest.mocked(getDateAndTimeFormatter)

describe('KnowledgeEditorGuidanceVersionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        appQueryClient.clear()
        mockUseVersionBanner.mockReturnValue(defaultMockState)
        mockUseVersionHistory.mockReturnValue({
            versions: [],
            isLoading: false,
            isViewingHistoricalVersion: false,
            currentVersionId: null,
            selectedVersionId: null,
            onSelectVersion: mockOnSelectVersion,
            onGoToLatest: mockOnGoToLatest,
            isDisabled: false,
            hasNextPage: false,
            isFetchingNextPage: false,
            onLoadMore: jest.fn(),
            shouldLoadMore: false,
        })
        mockUseGuidanceContext.mockReturnValue(defaultContextValue)
        mockUseGuidanceStore.mockImplementation((selector) =>
            selector(getStoreValue()),
        )
        mockGetTimezone.mockReturnValue('UTC')
        mockGetDateAndTimeFormatter.mockReturnValue(
            () =>
                DateTimeFormatMapper[
                    DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_US_24_HOUR
                ],
        )
    })

    describe('when viewing draft with published version', () => {
        it('renders draft banner with link to published version', () => {
            renderComponent()

            expect(
                screen.getByText(/This is a draft version/i),
            ).toBeInTheDocument()
            expect(screen.getByText('published version')).toBeInTheDocument()
        })

        it('calls switchVersion when published version link is clicked', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByText('published version'))

            expect(mockSwitchVersion).toHaveBeenCalledTimes(1)
        })

        it('does not call switchVersion when disabled', async () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isDisabled: true,
            })
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByText('published version'))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
        })

        it('applies disabled styling to link when disabled', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isDisabled: true,
            })

            renderComponent()

            const link = screen.getByText('published version')
            expect(link.className).toContain('linkDisabled')
        })
    })

    describe('when viewing published version with draft', () => {
        beforeEach(() => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
            })
        })

        it('renders published banner with link to draft version', () => {
            renderComponent()

            expect(
                screen.getByText(/This is a published version/i),
            ).toBeInTheDocument()
            expect(screen.getByText('draft version')).toBeInTheDocument()
        })

        it('calls switchVersion when draft version link is clicked', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByText('draft version'))

            expect(mockSwitchVersion).toHaveBeenCalledTimes(1)
        })

        it('does not call switchVersion when disabled', async () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
                isDisabled: true,
            })
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByText('draft version'))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
        })

        it('applies disabled styling to link when disabled', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
                isDisabled: true,
            })

            renderComponent()

            const link = screen.getByText('draft version')
            expect(link.className).toContain('linkDisabled')
        })
    })

    describe('when viewing historical version', () => {
        beforeEach(() => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
            })
            mockUseVersionHistory.mockReturnValue({
                versions: [],
                isLoading: false,
                isViewingHistoricalVersion: true,
                currentVersionId: null,
                selectedVersionId: 42,
                onSelectVersion: mockOnSelectVersion,
                onGoToLatest: mockOnGoToLatest,
                isDisabled: false,
                hasNextPage: false,
                isFetchingNextPage: false,
                onLoadMore: jest.fn(),
                shouldLoadMore: false,
            })
            mockUseGuidanceContext.mockReturnValue({
                state: {
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Old title',
                        content: 'Old content',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                        commitMessage: 'Fixed typo in greeting',
                    },
                    guidanceMode: 'read' as const,
                    guidance: { id: 1 },
                },
                dispatch: mockDispatch,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
            })
        })

        it('renders published date and commit message', () => {
            renderComponent()

            expect(
                screen.getByText(/You are viewing a previous version/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Fixed typo in greeting/i),
            ).toBeInTheDocument()
        })

        it('does not render commit message when not provided', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: {
                    historicalVersion: {
                        versionId: 42,
                        version: 3,
                        title: 'Old title',
                        content: 'Old content',
                        publishedDatetime: '2025-03-15T14:30:00Z',
                    },
                    guidanceMode: 'read' as const,
                    guidance: { id: 1 },
                },
                dispatch: mockDispatch,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
            })

            renderComponent()

            expect(
                screen.queryByText(/Changes in this version/i),
            ).not.toBeInTheDocument()
        })

        it('"Back to current" button calls onGoToLatest', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /Back to latest/i }),
            )

            expect(mockOnGoToLatest).toHaveBeenCalledTimes(1)
        })

        it('does not render a restore button in the banner', () => {
            renderComponent()

            expect(
                screen.queryByRole('button', {
                    name: /Restore this version/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('back to latest button is disabled when isDisabled is true', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
                isDisabled: true,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /Back to latest/i }),
            ).toBeDisabled()
        })

        describe('conversation copy', () => {
            it('renders conversation-specific copy when initialVersionId matches historicalVersion', () => {
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                        },
                        guidanceMode: 'read' as const,
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                        initialVersionId: 42,
                    },
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
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                        },
                        guidanceMode: 'read' as const,
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                        initialVersionId: 99,
                    },
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
            it('renders unchecked toggle when not in diff mode', () => {
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        guidanceMode: 'read',
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                            commitMessage: 'Fixed typo in greeting',
                        },
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    },
                })

                renderComponent()

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).not.toBeChecked()
            })

            it('renders checked toggle when in diff mode', () => {
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        guidanceMode: 'diff',
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                            commitMessage: 'Fixed typo in greeting',
                        },
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    },
                })

                renderComponent()

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).toBeChecked()
            })

            it('dispatches SET_MODE with "diff" when toggle is clicked on', async () => {
                const user = userEvent.setup()
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        guidanceMode: 'read',
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                            commitMessage: 'Fixed typo in greeting',
                        },
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    },
                })

                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'diff',
                })
            })

            it('fetches and dispatches SET_COMPARISON_VERSION when toggling to diff mode on historical version', async () => {
                const { getHelpCenterArticle } = await import(
                    'models/helpCenter/resources'
                )
                const mockGetArticle = jest.mocked(getHelpCenterArticle)

                mockGetArticle.mockResolvedValue({
                    id: 1,
                    translation: {
                        title: 'Current Published Title',
                        content: 'Current Published Content',
                    },
                } as any)

                const user = userEvent.setup()
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        guidanceMode: 'read',
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                            commitMessage: 'Fixed typo in greeting',
                        },
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    },
                })

                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockGetArticle).toHaveBeenCalledWith(
                    {},
                    { help_center_id: 1, id: 1 },
                    { locale: 'en-US', version_status: 'current' },
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

            it('dispatches SET_MODE with "read" when toggle is clicked off', async () => {
                const user = userEvent.setup()
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        guidanceMode: 'diff',
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                            commitMessage: 'Fixed typo in greeting',
                        },
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    },
                })

                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'read',
                })
            })

            it('disables toggle when isDisabled is true', () => {
                mockUseVersionBanner.mockReturnValue({
                    ...defaultMockState,
                    isDisabled: true,
                })
                mockUseGuidanceContext.mockReturnValue({
                    state: {
                        guidanceMode: 'read',
                        historicalVersion: {
                            versionId: 42,
                            version: 3,
                            title: 'Old title',
                            content: 'Old content',
                            publishedDatetime: '2025-03-15T14:30:00Z',
                            commitMessage: 'Fixed typo in greeting',
                        },
                        guidance: { id: 1 },
                    },
                    dispatch: mockDispatch,
                    config: {
                        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    },
                })

                renderComponent()

                expect(screen.getByRole('switch')).toBeDisabled()
            })

            describe('when viewing draft version', () => {
                beforeEach(() => {
                    mockUseVersionBanner.mockReturnValue({
                        ...defaultMockState,
                        isViewingDraft: true,
                        hasDraftVersion: true,
                        hasPublishedVersion: true,
                    })
                    mockUseVersionHistory.mockReturnValue({
                        versions: [],
                        isLoading: false,
                        isViewingHistoricalVersion: false,
                        currentVersionId: null,
                        selectedVersionId: null,
                        onSelectVersion: mockOnSelectVersion,
                        onGoToLatest: mockOnGoToLatest,
                        isDisabled: false,
                        hasNextPage: false,
                        isFetchingNextPage: false,
                        onLoadMore: jest.fn(),
                        shouldLoadMore: false,
                    })
                })

                it('renders diff toggle when viewing draft with published version', () => {
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    expect(
                        screen.getByText('Compare to current'),
                    ).toBeInTheDocument()
                    expect(screen.getByRole('switch')).not.toBeChecked()
                })

                it('renders checked toggle when in diff mode on draft', () => {
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'diff',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    expect(
                        screen.getByText('Compare to current'),
                    ).toBeInTheDocument()
                    expect(screen.getByRole('switch')).toBeChecked()
                })

                it('dispatches SET_MODE when toggle is clicked on draft', async () => {
                    const user = userEvent.setup()
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    await user.click(screen.getByRole('switch'))

                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_MODE',
                        payload: 'diff',
                    })
                })

                it('fetches and dispatches SET_COMPARISON_VERSION when toggling to diff mode on draft', async () => {
                    const { getHelpCenterArticle } = await import(
                        'models/helpCenter/resources'
                    )
                    const mockGetArticle = jest.mocked(getHelpCenterArticle)

                    mockGetArticle.mockResolvedValue({
                        id: 1,
                        translation: {
                            title: 'Published Title',
                            content: 'Published Content',
                        },
                    } as any)

                    const user = userEvent.setup()
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    await user.click(screen.getByRole('switch'))

                    expect(mockGetArticle).toHaveBeenCalledWith(
                        {},
                        { help_center_id: 1, id: 1 },
                        { locale: 'en-US', version_status: 'current' },
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

                it('reuses cached published version when toggling to diff mode repeatedly', async () => {
                    const { getHelpCenterArticle } = await import(
                        'models/helpCenter/resources'
                    )
                    const mockGetArticle = jest.mocked(getHelpCenterArticle)

                    mockGetArticle.mockResolvedValue({
                        id: 1,
                        translation: {
                            title: 'Published Title',
                            content: 'Published Content',
                        },
                    } as any)

                    const user = userEvent.setup()
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    await user.click(screen.getByRole('switch'))
                    await waitFor(() =>
                        expect(mockGetArticle).toHaveBeenCalledTimes(1),
                    )

                    await user.click(screen.getByRole('switch'))

                    await waitFor(() =>
                        expect(mockGetArticle).toHaveBeenCalledTimes(1),
                    )
                })

                it('handles error when fetching published version fails', async () => {
                    const { getHelpCenterArticle } = await import(
                        'models/helpCenter/resources'
                    )
                    const mockGetArticle = jest.mocked(getHelpCenterArticle)
                    const consoleErrorSpy = jest
                        .spyOn(console, 'error')
                        .mockImplementation()

                    mockGetArticle.mockRejectedValue(
                        new Error('Failed to fetch'),
                    )

                    const user = userEvent.setup()
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

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
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    await user.click(screen.getByRole('switch'))

                    await screen.findByRole('switch')

                    expect(mockDispatch).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            type: 'SET_COMPARISON_VERSION',
                        }),
                    )
                })

                it('dispatches CLEAR_HISTORICAL_VERSION when toggling off from draft', async () => {
                    const user = userEvent.setup()
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'diff',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

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
                    mockUseVersionBanner.mockReturnValue({
                        ...defaultMockState,
                        isViewingDraft: true,
                        hasDraftVersion: true,
                        hasPublishedVersion: false,
                    })
                    mockUseGuidanceContext.mockReturnValue({
                        state: {
                            guidanceMode: 'read',
                            historicalVersion: null,
                            guidance: { id: 1 },
                        },
                        dispatch: mockDispatch,
                        config: {
                            guidanceHelpCenter: {
                                id: 1,
                                default_locale: 'en-US',
                            },
                        },
                    })

                    renderComponent()

                    expect(
                        screen.queryByText('Compare to current'),
                    ).not.toBeInTheDocument()
                    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
                })
            })
        })
    })

    describe('when not viewing historical version', () => {
        it('does not render the diff toggle', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
            })
            mockUseGuidanceContext.mockReturnValue({
                state: {
                    guidanceMode: 'read',
                    historicalVersion: null,
                    guidance: { id: 1 },
                },
                dispatch: mockDispatch,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                },
            })

            renderComponent()

            expect(
                screen.queryByText('Compare to current'),
            ).not.toBeInTheDocument()
            expect(screen.queryByRole('switch')).not.toBeInTheDocument()
        })
    })

    describe('when no banner should be shown', () => {
        it('returns null when no draft version exists', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                hasDraftVersion: false,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('returns null when no published version exists', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                hasPublishedVersion: false,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })

        it('returns null when neither draft nor published version exists', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                hasDraftVersion: false,
                hasPublishedVersion: false,
            })

            const { container } = renderComponent()

            expect(container.firstChild).toBeNull()
        })
    })
})
