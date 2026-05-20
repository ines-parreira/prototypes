import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import { mockArchiveSlaPolicyHandler } from '@gorgias/helpdesk-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { DeleteModal } from '../DeleteModal'

const server = setupServer()
const queryClient = mockQueryClient()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    toast.dismiss()
})

afterAll(() => {
    server.close()
})

const renderModal = (onClose: () => void = jest.fn()) =>
    render(
        <QueryClientProvider client={queryClient}>
            <DeleteModal isOpen={true} policyId="policy-1" onClose={onClose} />
        </QueryClientProvider>,
    )

describe('<DeleteModal />', () => {
    it('shows a success toast when archiving the policy succeeds', async () => {
        const archiveMock = mockArchiveSlaPolicyHandler(async () =>
            HttpResponse.json(undefined),
        )
        server.use(archiveMock.handler)
        const user = userEvent.setup()

        renderModal()

        await user.click(screen.getByRole('button', { name: 'Delete SLA' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'SLA policy deleted.' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows an error toast and closes the modal when archiving fails', async () => {
        const archiveMock = mockArchiveSlaPolicyHandler(
            async () => new HttpResponse(null, { status: 500 }),
        )
        server.use(archiveMock.handler)
        const onClose = jest.fn()
        const user = userEvent.setup()

        renderModal(onClose)

        await user.click(screen.getByRole('button', { name: 'Delete SLA' }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete SLA policy',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(onClose).toHaveBeenCalled()
    })
})
