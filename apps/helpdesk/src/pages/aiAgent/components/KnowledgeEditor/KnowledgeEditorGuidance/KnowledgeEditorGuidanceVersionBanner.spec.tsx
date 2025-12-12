import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { VersionBannerState } from './hooks/useVersionBanner'
import { KnowledgeEditorGuidanceVersionBanner } from './KnowledgeEditorGuidanceVersionBanner'

const mockSwitchVersion = jest.fn()

const mockUseVersionBanner = jest.fn<VersionBannerState, []>()

jest.mock('./hooks/useVersionBanner', () => ({
    useVersionBanner: () => mockUseVersionBanner(),
}))

const defaultMockState: VersionBannerState = {
    isViewingDraft: true,
    hasDraftVersion: true,
    hasPublishedVersion: true,
    isDisabled: false,
    switchVersion: mockSwitchVersion,
}

describe('KnowledgeEditorGuidanceVersionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseVersionBanner.mockReturnValue(defaultMockState)
    })

    describe('when viewing draft with published version', () => {
        it('renders draft banner with link to published version', () => {
            render(<KnowledgeEditorGuidanceVersionBanner />)

            expect(
                screen.getByText(/This is a draft version/i),
            ).toBeInTheDocument()
            expect(screen.getByText('published version')).toBeInTheDocument()
        })

        it('calls switchVersion when published version link is clicked', async () => {
            const user = userEvent.setup()

            render(<KnowledgeEditorGuidanceVersionBanner />)

            await act(() => user.click(screen.getByText('published version')))

            expect(mockSwitchVersion).toHaveBeenCalledTimes(1)
        })

        it('does not call switchVersion when disabled', async () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isDisabled: true,
            })
            const user = userEvent.setup()

            render(<KnowledgeEditorGuidanceVersionBanner />)

            await act(() => user.click(screen.getByText('published version')))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
        })

        it('applies disabled styling to link when disabled', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isDisabled: true,
            })

            render(<KnowledgeEditorGuidanceVersionBanner />)

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
            render(<KnowledgeEditorGuidanceVersionBanner />)

            expect(
                screen.getByText(/This is a published version/i),
            ).toBeInTheDocument()
            expect(screen.getByText('draft version')).toBeInTheDocument()
        })

        it('calls switchVersion when draft version link is clicked', async () => {
            const user = userEvent.setup()

            render(<KnowledgeEditorGuidanceVersionBanner />)

            await act(() => user.click(screen.getByText('draft version')))

            expect(mockSwitchVersion).toHaveBeenCalledTimes(1)
        })

        it('does not call switchVersion when disabled', async () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
                isDisabled: true,
            })
            const user = userEvent.setup()

            render(<KnowledgeEditorGuidanceVersionBanner />)

            await act(() => user.click(screen.getByText('draft version')))

            expect(mockSwitchVersion).not.toHaveBeenCalled()
        })

        it('applies disabled styling to link when disabled', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                isViewingDraft: false,
                isDisabled: true,
            })

            render(<KnowledgeEditorGuidanceVersionBanner />)

            const link = screen.getByText('draft version')
            expect(link.className).toContain('linkDisabled')
        })
    })

    describe('when no banner should be shown', () => {
        it('returns null when no draft version exists', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                hasDraftVersion: false,
            })

            const { container } = render(
                <KnowledgeEditorGuidanceVersionBanner />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('returns null when no published version exists', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                hasPublishedVersion: false,
            })

            const { container } = render(
                <KnowledgeEditorGuidanceVersionBanner />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('returns null when neither draft nor published version exists', () => {
            mockUseVersionBanner.mockReturnValue({
                ...defaultMockState,
                hasDraftVersion: false,
                hasPublishedVersion: false,
            })

            const { container } = render(
                <KnowledgeEditorGuidanceVersionBanner />,
            )

            expect(container.firstChild).toBeNull()
        })
    })
})
