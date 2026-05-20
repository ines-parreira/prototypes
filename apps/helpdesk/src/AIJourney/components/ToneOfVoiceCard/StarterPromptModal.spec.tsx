import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { copyToClipboard } from 'AIJourney/utils/copyToClipboard'

import { StarterPromptModal } from './StarterPromptModal'

jest.mock('AIJourney/utils/copyToClipboard', () => ({
    copyToClipboard: jest.fn(),
}))

const mockCopyToClipboard = copyToClipboard as jest.MockedFunction<
    typeof copyToClipboard
>

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const renderModal = () =>
    render(<StarterPromptModal isOpen onClose={jest.fn()} />)

describe('<StarterPromptModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCopyToClipboard.mockResolvedValue(true)
    })

    it('renders the heading and a Copy button', () => {
        renderModal()

        expect(
            screen.getByRole('heading', { name: 'Starter prompt' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /copy/i }),
        ).toBeInTheDocument()
    })

    it('copies the prompt and flips the label when Copy is clicked', async () => {
        const user = userEvent.setup()

        renderModal()

        await user.click(screen.getByRole('button', { name: 'Copy' }))

        await waitFor(() => {
            expect(mockCopyToClipboard).toHaveBeenCalledWith(expect.any(String))
        })
        await waitFor(() => {
            expect(screen.getByText('Copied')).toBeInTheDocument()
        })
    })
})
