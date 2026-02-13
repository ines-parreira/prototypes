import { FeatureFlagKey } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticleVersionBanner } from './ArticleVersionBanner'
import { useArticleContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

const mockUseFlag = jest.fn()

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: jest.requireActual('@repo/feature-flags').FeatureFlagKey,
    useFlag: (key: string) => mockUseFlag(key),
}))

jest.mock('@repo/utils', () => ({
    DateAndTimeFormatting: { CompactDateWithTime: 'CompactDateWithTime' },
    formatDatetime: jest.fn(() => 'Jan 1, 2024 12:00 PM'),
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

const mockUseVersionBanner = useVersionBanner as jest.Mock
const mockUseVersionHistory = useVersionHistory as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

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
        mockUseFlag.mockReturnValue(false)
        mockSwitchVersion = jest.fn()
        mockUseVersionBanner.mockReturnValue(createMockVersionBanner())
        mockUseVersionHistory.mockReturnValue({
            isViewingHistoricalVersion: false,
            onGoToLatest: jest.fn(),
        })
        mockUseArticleContext.mockReturnValue({
            state: { historicalVersion: null },
            dispatch: jest.fn(),
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

            const { container } = render(<ArticleVersionBanner />)

            expect(container.firstChild).toBeNull()
        })

        it('should return null when hasPublishedVersion is false', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: true,
                    hasPublishedVersion: false,
                }),
            )

            const { container } = render(<ArticleVersionBanner />)

            expect(container.firstChild).toBeNull()
        })

        it('should return null when both hasDraftVersion and hasPublishedVersion are false', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: false,
                    hasPublishedVersion: false,
                }),
            )

            const { container } = render(<ArticleVersionBanner />)

            expect(container.firstChild).toBeNull()
        })

        it('should render banner when both versions exist', () => {
            mockUseVersionBanner.mockReturnValue(
                createMockVersionBanner({
                    hasDraftVersion: true,
                    hasPublishedVersion: true,
                }),
            )

            render(<ArticleVersionBanner />)

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
            render(<ArticleVersionBanner />)

            expect(
                screen.getByText(/This is a draft version/i),
            ).toBeInTheDocument()
        })

        it('should render link to published version', () => {
            render(<ArticleVersionBanner />)

            expect(screen.getByText('published version')).toBeInTheDocument()
        })

        it('should render description about editing draft', () => {
            render(<ArticleVersionBanner />)

            expect(
                screen.getByText(
                    /Edit, test, and publish your draft to update the published version/i,
                ),
            ).toBeInTheDocument()
        })

        it('should call switchVersion when clicking published version link', async () => {
            const user = userEvent.setup()
            render(<ArticleVersionBanner />)

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
            render(<ArticleVersionBanner />)

            await user.click(screen.getByText('published version'))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
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
            render(<ArticleVersionBanner />)

            expect(
                screen.getByText(/This is a published version/i),
            ).toBeInTheDocument()
        })

        it('should render link to draft version', () => {
            render(<ArticleVersionBanner />)

            expect(screen.getByText('draft version')).toBeInTheDocument()
        })

        it('should not render description (only shown for draft view)', () => {
            render(<ArticleVersionBanner />)

            expect(
                screen.queryByText(/Edit, test, and publish/i),
            ).not.toBeInTheDocument()
        })

        it('should call switchVersion when clicking draft version link', async () => {
            const user = userEvent.setup()
            render(<ArticleVersionBanner />)

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
            render(<ArticleVersionBanner />)

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
                },
                dispatch: mockDispatch,
            })
        })

        it('should render historical version banner', () => {
            render(<ArticleVersionBanner />)

            expect(
                screen.getByText(/You are viewing a previous version/i),
            ).toBeInTheDocument()
        })

        it('should render commit message when provided', () => {
            render(<ArticleVersionBanner />)

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
                },
                dispatch: mockDispatch,
            })

            render(<ArticleVersionBanner />)

            expect(
                screen.queryByText(/Changes in this version/i),
            ).not.toBeInTheDocument()
        })

        it('should call onGoToLatest when "Back to latest" is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleVersionBanner />)

            await user.click(
                screen.getByRole('button', { name: /Back to latest/i }),
            )

            expect(mockOnGoToLatest).toHaveBeenCalledTimes(1)
        })

        it('should not render a restore button in the banner', () => {
            render(<ArticleVersionBanner />)

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

            render(<ArticleVersionBanner />)

            expect(
                screen.getByRole('button', { name: /Back to latest/i }),
            ).toBeDisabled()
        })

        describe('diff toggle', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key: string) =>
                        key === FeatureFlagKey.AddDiffingForVersionHistory,
                )
            })

            it('should render unchecked toggle when not in diff mode', () => {
                render(<ArticleVersionBanner />)

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
                    },
                    dispatch: mockDispatch,
                })

                render(<ArticleVersionBanner />)

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).toBeChecked()
            })

            it('should dispatch SET_MODE with "diff" when toggle is clicked on', async () => {
                const user = userEvent.setup()
                render(<ArticleVersionBanner />)

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'diff',
                })
            })

            it('should dispatch SET_MODE with "read" when toggle is clicked off', async () => {
                mockUseArticleContext.mockReturnValue({
                    state: {
                        articleMode: 'diff',
                        historicalVersion,
                    },
                    dispatch: mockDispatch,
                })
                const user = userEvent.setup()
                render(<ArticleVersionBanner />)

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

                render(<ArticleVersionBanner />)

                expect(screen.getByRole('switch')).toBeDisabled()
            })

            it('should not render diff toggle when feature flag is disabled', () => {
                mockUseFlag.mockReturnValue(false)

                render(<ArticleVersionBanner />)

                expect(
                    screen.queryByText('Compare to current'),
                ).not.toBeInTheDocument()
                expect(screen.queryByRole('switch')).not.toBeInTheDocument()
            })
        })
    })

    describe('when not viewing historical version', () => {
        it('should not render the diff toggle', () => {
            mockUseArticleContext.mockReturnValue({
                state: {
                    articleMode: 'read',
                    historicalVersion: null,
                },
                dispatch: jest.fn(),
            })

            render(<ArticleVersionBanner />)

            expect(
                screen.queryByText('Compare to current'),
            ).not.toBeInTheDocument()
            expect(screen.queryByRole('switch')).not.toBeInTheDocument()
        })
    })
})
