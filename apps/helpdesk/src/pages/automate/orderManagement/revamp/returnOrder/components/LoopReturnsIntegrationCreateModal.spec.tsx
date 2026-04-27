import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { LoopReturnsIntegrationCreateModal } from './LoopReturnsIntegrationCreateModal'

const mockDispatch = jest.fn(() => Promise.resolve())

jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('hooks/useAppSelector', () => () => false)
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(() => ({ type: 'MOCK_ACTION' })),
}))
jest.mock('../ReturnOrderFlowViewContext', () => ({
    useReturnOrderFlowViewContext: () => ({
        storeIntegration: { id: 1, name: 'my-store' },
    }),
}))

const renderModal = (
    props?: Partial<
        React.ComponentProps<typeof LoopReturnsIntegrationCreateModal>
    >,
) =>
    render(
        <MemoryRouter>
            <LoopReturnsIntegrationCreateModal
                isOpen={true}
                onClose={jest.fn()}
                onCreate={jest.fn()}
                {...props}
            />
        </MemoryRouter>,
    )

describe('LoopReturnsIntegrationCreateModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render modal title and form', () => {
        renderModal()

        expect(
            screen.getByText('Create new return integration'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('API Key')).toBeInTheDocument()
    })

    it('should render cancel and create buttons', () => {
        renderModal()

        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Create' }),
        ).toBeInTheDocument()
    })

    it('should have create button disabled when API key is empty', () => {
        renderModal()

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    })

    it('should enable create button after typing API key', async () => {
        const user = userEvent.setup()
        renderModal()

        await user.type(screen.getByLabelText('API Key'), 'test-api-key')

        expect(
            screen.getByRole('button', { name: 'Create' }),
        ).not.toBeDisabled()
    })

    it('should call onClose when cancel is clicked', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderModal({ onClose })

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when close icon is clicked', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderModal({ onClose })

        await user.click(screen.getByRole('button', { name: 'Close modal' }))

        expect(onClose).toHaveBeenCalled()
    })

    it('should render info links', () => {
        renderModal()

        expect(
            screen.getByText('Find your API Key in Loop Returns.'),
        ).toBeInTheDocument()
        expect(screen.getByText('HTTP integrations page')).toBeInTheDocument()
    })

    it('should dispatch integration creation on submit', async () => {
        const user = userEvent.setup()
        renderModal()

        await user.type(screen.getByLabelText('API Key'), 'test-key')
        await user.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockDispatch).toHaveBeenCalled()
    })
})
