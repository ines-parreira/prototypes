import { act, screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomer,
    mockGetCurrentUserHandler,
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
    mockListIntegrationsHandler,
    mockListPhoneNumbersHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { CustomerChannelsItem } from '@gorgias/helpdesk-types'

import {
    render,
    testAppQueryClient,
} from '../../../../../../tests/render.utils'
import { CustomerPreview } from '../CustomerPreview'

const mockOnGoBack = vi.fn()
const mockOnClose = vi.fn()
const mockOnSetCustomer = vi.fn()

const mockCustomerData = mockCustomer({
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    channels: [
        {
            id: 1,
            type: 'email',
            address: 'john@example.com',
        } as CustomerChannelsItem,
    ],
})

const defaultProps = {
    customer: mockCustomerData,
    onGoBack: mockOnGoBack,
    onClose: mockOnClose,
    onSetCustomer: mockOnSetCustomer,
}

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockUser()),
)

const mockListCustomFields = mockListCustomFieldsHandler(async () =>
    HttpResponse.json(mockListCustomFieldsResponse({ data: [] })),
)

const mockListCustomerFieldsValues = mockListCustomerCustomFieldsValuesHandler(
    async () =>
        HttpResponse.json(
            mockListCustomerCustomFieldsValuesResponse({ data: [] }),
        ),
)

const server = setupServer(
    mockGetCurrentUser.handler,
    mockListCustomFields.handler,
    mockListCustomerFieldsValues.handler,
    mockListIntegrationsHandler().handler,
    mockListPhoneNumbersHandler().handler,
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('CustomerPreview', () => {
    it('should render null when customer is null', () => {
        const { container } = render(
            <CustomerPreview {...defaultProps} customer={null} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render null when customer is undefined', () => {
        const { container } = render(
            <CustomerPreview {...defaultProps} customer={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render customer name in heading', () => {
        render(<CustomerPreview {...defaultProps} />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should render customer ID when name is not available', () => {
        const customerWithoutName = mockCustomer({
            id: 456,
            name: undefined,
            channels: [],
        })

        render(
            <CustomerPreview
                {...defaultProps}
                customer={customerWithoutName}
            />,
        )

        expect(screen.getByText('Customer #456')).toBeInTheDocument()
    })

    it('should call onGoBack when back button is clicked', async () => {
        const { user } = render(<CustomerPreview {...defaultProps} />)

        const backButton = screen.getByRole('button', {
            name: 'Back to previous screen',
        })

        await act(() => user.click(backButton))

        expect(mockOnGoBack).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when close button is clicked', async () => {
        const { user } = render(<CustomerPreview {...defaultProps} />)

        const closeButton = screen.getByRole('button', { name: 'close' })

        await act(() => user.click(closeButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onSwitchCustomer when switch customer button is clicked', async () => {
        const { user } = render(<CustomerPreview {...defaultProps} />)

        const switchButton = screen.getByRole('button', {
            name: 'Switch customer',
        })

        await act(() => user.click(switchButton))

        expect(mockOnSetCustomer).toHaveBeenCalledWith(mockCustomerData)
        expect(mockOnSetCustomer).toHaveBeenCalledTimes(1)
    })
})
