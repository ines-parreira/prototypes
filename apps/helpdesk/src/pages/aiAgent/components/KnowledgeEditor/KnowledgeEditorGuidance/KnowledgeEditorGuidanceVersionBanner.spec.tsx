import { FeatureFlagKey } from '@repo/feature-flags'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
const mockUseFlag = jest.fn()

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: jest.requireActual('@repo/feature-flags').FeatureFlagKey,
    useFlag: (key: string) => mockUseFlag(key),
}))

jest.mock('./hooks/useVersionBanner', () => ({
    useVersionBanner: () => mockUseVersionBanner(),
}))

jest.mock('./hooks/useVersionHistory', () => ({
    useVersionHistory: () => mockUseVersionHistory(),
}))

jest.mock('./context', () => ({
    useGuidanceContext: () => mockUseGuidanceContext(),
}))

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetUser: () => ({ data: undefined }),
}))

jest.mock('state/currentUser/selectors', () => ({
    getTimezone: jest.fn(),
    getDateAndTimeFormatter: jest.fn(() => () => {}),
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
    },
    dispatch: mockDispatch,
}

const renderComponent = () => {
    return render(<KnowledgeEditorGuidanceVersionBanner />)
}

const mockGetTimezone = jest.mocked(getTimezone)
const mockGetDateAndTimeFormatter = jest.mocked(getDateAndTimeFormatter)

describe('KnowledgeEditorGuidanceVersionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(false)
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
                },
                dispatch: mockDispatch,
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
                },
                dispatch: mockDispatch,
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
                isDisabled: true,
            })

            renderComponent()

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
                    },
                    dispatch: mockDispatch,
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
                    },
                    dispatch: mockDispatch,
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
                    },
                    dispatch: mockDispatch,
                })

                renderComponent()

                await user.click(screen.getByRole('switch'))

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODE',
                    payload: 'diff',
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
                    },
                    dispatch: mockDispatch,
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
                    },
                    dispatch: mockDispatch,
                })

                renderComponent()

                expect(screen.getByRole('switch')).toBeDisabled()
            })

            it('does not render diff toggle when feature flag is disabled', () => {
                mockUseFlag.mockReturnValue(false)
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
                    },
                    dispatch: mockDispatch,
                })

                renderComponent()

                expect(
                    screen.queryByText('Compare to current'),
                ).not.toBeInTheDocument()
                expect(screen.queryByRole('switch')).not.toBeInTheDocument()
            })
        })
    })

    describe('when not viewing historical version', () => {
        it('does not render the diff toggle', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: {
                    guidanceMode: 'read',
                    historicalVersion: null,
                },
                dispatch: mockDispatch,
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
