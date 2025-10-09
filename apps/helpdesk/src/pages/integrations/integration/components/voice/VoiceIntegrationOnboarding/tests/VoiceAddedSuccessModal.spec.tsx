import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSearchParam } from 'hooks/useSearchParam'

import VoiceAddedSuccessModal from '../VoiceAddedSuccessModal'

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))

jest.mock('../../flows/VoiceFlowPreview', () => ({
    __esModule: true,
    default: ({ integrationId }: { integrationId: number }) => (
        <div
            data-testid="voice-flow-preview"
            data-integration-id={integrationId}
        >
            VoiceFlowPreview
        </div>
    ),
}))

jest.mock('pages/integrations/components/ConnectLink', () => ({
    __esModule: true,
    default: ({
        children,
        connectUrl,
    }: {
        children: React.ReactNode
        connectUrl: string
    }) => <a href={connectUrl}>{children}</a>,
}))

const mockedUseSearchParam = jest.mocked(useSearchParam)

describe('VoiceAddedSuccessModal', () => {
    const mockSetSearchParam = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = () => {
        return render(<VoiceAddedSuccessModal />)
    }

    it('should not render modal when no integration id in query param', () => {
        mockedUseSearchParam.mockReturnValue([null, mockSetSearchParam])

        renderComponent()

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should not render modal when integration id is invalid', () => {
        mockedUseSearchParam.mockReturnValue(['invalid', mockSetSearchParam])

        renderComponent()

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render modal with success message when integration id is present', () => {
        mockedUseSearchParam.mockReturnValue(['123', mockSetSearchParam])

        renderComponent()

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Great job!')).toBeInTheDocument()
        expect(
            screen.getByText('Your voice integration is ready.'),
        ).toBeInTheDocument()
    })

    it('should render VoiceFlowPreview with correct integration id', () => {
        mockedUseSearchParam.mockReturnValue(['456', mockSetSearchParam])

        renderComponent()

        const preview = screen.getByTestId('voice-flow-preview')
        expect(preview).toBeInTheDocument()
        expect(preview).toHaveAttribute('data-integration-id', '456')
    })

    it('should render call flow editor description', () => {
        mockedUseSearchParam.mockReturnValue(['123', mockSetSearchParam])

        renderComponent()

        expect(screen.getByText(/Call Flow Editor/)).toBeInTheDocument()
        expect(
            screen.getByText(
                /visually manage routing logic, create multi-level IVR menus/,
            ),
        ).toBeInTheDocument()
    })

    it('should render navigation buttons with correct links', () => {
        mockedUseSearchParam.mockReturnValue(['123', mockSetSearchParam])

        renderComponent()

        const generalSettingsButton = screen.getByText('Go To General Settings')
        expect(generalSettingsButton.closest('a')).toHaveAttribute(
            'to',
            '/app/settings/channels/phone/123/preferences',
        )

        const editFlowButton = screen.getByText('Edit Call Flow')
        expect(editFlowButton.closest('a')).toHaveAttribute(
            'to',
            '/app/settings/channels/phone/123/flow',
        )
    })

    it('should close modal and clear search param when modal is closed', async () => {
        mockedUseSearchParam.mockReturnValue(['123', mockSetSearchParam])

        renderComponent()

        const closeButton = screen.getByText('close')
        await act(async () => {
            await userEvent.click(closeButton)
        })

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
    })

    it('should render success icon', () => {
        mockedUseSearchParam.mockReturnValue(['123', mockSetSearchParam])

        renderComponent()

        const icon = screen.getByAltText('success icon')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute(
            'src',
            expect.stringContaining('party-popper.png'),
        )
    })
})
