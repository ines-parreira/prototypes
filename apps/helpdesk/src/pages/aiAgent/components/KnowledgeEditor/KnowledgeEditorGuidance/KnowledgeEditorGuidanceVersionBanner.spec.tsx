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

        it('"Restore this version" button dispatches SET_MODAL restore', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(
                screen.getByRole('button', {
                    name: /Restore this version/i,
                }),
            )

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'restore',
            })
        })

        it('buttons are disabled when isDisabled is true', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isDisabled: true,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /Back to latest/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', {
                    name: /Restore this version/i,
                }),
            ).toBeDisabled()
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
