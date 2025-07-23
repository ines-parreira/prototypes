import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockCreateBusinessHoursHandler } from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import AddCustomBusinessHoursModal from '../AddCustomBusinessHoursModal'

jest.mock('../CustomBusinessHoursIntegrationsTable', () => () => (
    <div>CustomBusinessHoursIntegrationsTable</div>
))

jest.mock('core/forms', () => ({
    ...jest.requireActual('core/forms'),
    FormSubmitButton: jest.fn(({ children }: { children: React.ReactNode }) => (
        <button type="submit">{children}</button>
    )),
}))

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const server = setupServer()

beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

const mockCreateBusinessHours = mockCreateBusinessHoursHandler()

beforeEach(() => {
    server.use(mockCreateBusinessHours.handler)
})

afterEach(() => {
    server.resetHandlers()
})

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onCreateSuccess: jest.fn(),
}
const renderComponent = (props = defaultProps) => {
    return renderWithStoreAndQueryClientAndRouter(
        <AddCustomBusinessHoursModal {...props} />,
        {},
    )
}

describe('AddCustomBusinessHoursModal', () => {
    it('renders the modal with correct title and sections', () => {
        renderComponent()

        expect(screen.getByText('Integrations')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Assign one or multiple integrations for your custom business hours.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Add Custom Business Hours'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('textbox', { name: 'Name required' }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('CustomBusinessHoursIntegrationsTable'),
        ).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add Business Hours' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await act(() => user.click(cancelButton))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls createBusinessHours when Add Business Hours button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const nameField = screen.getByRole('textbox', {
            name: 'Name required',
        })
        await act(() => user.type(nameField, 'test'))

        const addBusinessHoursButton = screen.getByRole('button', {
            name: 'Add Business Hours',
        })
        await act(() => user.click(addBusinessHoursButton))

        await waitFor(() => {
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
            expect(defaultProps.onCreateSuccess).toHaveBeenCalledWith(
                mockCreateBusinessHours.data.id,
            )
            expect(mockNotify.success).toHaveBeenCalledWith(
                `'${mockCreateBusinessHours.data.name}' business hours were successfully created.`,
            )
        })
    })

    it('calls errorNotify when createBusinessHours fails', async () => {
        const mockCreateBusinessHours = mockCreateBusinessHoursHandler(
            async ({ data }) =>
                HttpResponse.json(
                    { ...data },
                    {
                        status: 500,
                    },
                ),
        )

        server.use(mockCreateBusinessHours.handler)

        const user = userEvent.setup()
        renderComponent()

        const nameField = screen.getByRole('textbox', {
            name: 'Name required',
        })
        await act(() => user.type(nameField, 'test'))

        const addBusinessHoursButton = screen.getByRole('button', {
            name: 'Add Business Hours',
        })

        await act(() => user.click(addBusinessHoursButton))

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledTimes(1)
        })
    })
})
