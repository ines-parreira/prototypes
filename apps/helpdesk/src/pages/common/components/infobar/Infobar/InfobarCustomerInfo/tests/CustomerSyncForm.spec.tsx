import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import {
    mockListCustomerIntegrationsWithChannelDefaultHandler,
    mockListCustomerIntegrationsWithChannelDefaultResponse,
    mockScheduleShopifyCreateNewCustomerActionHandler,
    mockScheduleShopifyUpdateCustomerActionHandler,
} from '@gorgias/helpdesk-mocks'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { useAppDispatch } from 'hooks/useAppDispatch'

import { CustomerSyncForm } from '../CustomerSyncForm/CustomerSyncForm'

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)

const activeCustomer = Map({
    id: 123,
    name: 'John Smith',
    email: 'john.smith@example.com',
})

const state = {}

const defaultHandlers = [
    mockListCustomerIntegrationsWithChannelDefaultHandler(async () =>
        HttpResponse.json(
            mockListCustomerIntegrationsWithChannelDefaultResponse({
                integrations: [],
            }),
        ),
    ).handler,
    mockScheduleShopifyCreateNewCustomerActionHandler().handler,
    mockScheduleShopifyUpdateCustomerActionHandler().handler,
]

const server = setupServer(...defaultHandlers)

const createShopifyIntegrationsResponse = (hasCustomerData?: boolean) => ({
    integrations: [
        {
            integration_id: 1,
            integration_name: 'store1',
            integration_type: SHOPIFY_INTEGRATION_TYPE,
            has_customer_data: false,
            default: false,
        },
        {
            integration_id: 2,
            integration_name: 'store2',
            integration_type: SHOPIFY_INTEGRATION_TYPE,
            has_customer_data: hasCustomerData ?? false,
            default: true,
        },
    ],
})

const setupMockIntegrations = (hasCustomerData?: boolean) => {
    server.use(
        mockListCustomerIntegrationsWithChannelDefaultHandler(async () =>
            HttpResponse.json(
                createShopifyIntegrationsResponse(hasCustomerData) as never,
            ),
        ).handler,
    )
}

const waitForDefaultStore = async () => {
    await screen.findByText('store2')
}

const createPendingResponse = () => {
    let resolveResponse!: (response: HttpResponse<undefined>) => void
    const response = new Promise<HttpResponse<undefined>>((resolve) => {
        resolveResponse = resolve
    })

    return {
        response,
        resolve: () =>
            resolveResponse(
                new HttpResponse(null, {
                    status: 200,
                }) as HttpResponse<undefined>,
            ),
    }
}

const renderCustomerSyncForm = (props = {}) => {
    const defaultProps = {
        activeCustomer,
        isCustomerSyncFormOpen: true,
        setIsCustomerSyncFormOpen: jest.fn(),
        ...props,
    }

    return render(<CustomerSyncForm {...defaultProps} />, { storeState: state })
}

const fillBasicForm = (includePhone = true) => {
    fireEvent.change(screen.getByLabelText('Email*'), {
        target: { value: 'john.smith@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Smith' },
    })

    if (includePhone) {
        const phoneInput = screen.getByLabelText('phone')
        fireEvent.change(phoneInput, {
            target: { value: '123-456-7890' },
        })
    }
}

const fillAddressForm = async (includeShippingPhone = true) => {
    await waitFor(() => {
        expect(screen.getByText('Add delivery address')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Add delivery address'))

    const countryElements = screen.getAllByText('🇺🇸')
    fireEvent.click(countryElements[1])

    await screen.findByText('Monaco')
    fireEvent.click(screen.getByText('Monaco'))

    await waitFor(() => {
        expect(screen.getByLabelText('Company')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Company'), {
        target: { value: 'Company' },
    })
    fireEvent.change(screen.getByLabelText('Address'), {
        target: { value: 'Address' },
    })
    fireEvent.change(screen.getByLabelText('Apartment, suite, etc'), {
        target: { value: 'Apartment 1' },
    })
    fireEvent.change(screen.getByLabelText('City'), {
        target: { value: 'City' },
    })
    fireEvent.change(screen.getByPlaceholderText('Type state or province...'), {
        target: { value: 'Monte Carlo' },
    })
    fireEvent.change(screen.getByLabelText('ZIP/Postal code'), {
        target: { value: '12345' },
    })

    if (includeShippingPhone) {
        const defaultAddressPhoneInput = screen.getByLabelText(
            'defaultAddressPhone',
        )
        fireEvent.change(defaultAddressPhoneInput, {
            target: { value: '987-654-3210' },
        })
    }
}

const getExpectedDataWithAddress = (
    includePhone = true,
    includeShippingPhone = true,
) => ({
    email: 'john.smith@example.com',
    first_name: 'John',
    last_name: 'Smith',
    phone: includePhone ? '+11234567890' : null,
    address: {
        address1: 'Address',
        address2: 'Apartment 1',
        company: 'Company',
        city: 'City',
        country_code: 'MC',
        zip: '12345',
        province_code: 'Monte Carlo',
        phone: includeShippingPhone ? '+19876543210' : null,
    },
})

const getExpectedDataWithoutAddress = (includePhone = true) => ({
    email: 'john.smith@example.com',
    first_name: 'John',
    last_name: 'Smith',
    phone: includePhone ? '+11234567890' : undefined,
    address: undefined,
})

describe('CustomerSyncForm', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(jest.fn())
    })

    afterEach(() => {
        server.resetHandlers()
        toast.dismiss()
    })

    afterAll(() => {
        server.close()
    })

    it('renders the form correctly', () => {
        renderCustomerSyncForm()

        expect(
            screen.getByText('Sync John Smith profile to Shopify'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Email*')).toBeInTheDocument()
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
    })

    it('resets the email after render when integrations are unstable', async () => {
        setupMockIntegrations(false)

        const { rerender } = renderCustomerSyncForm()

        await waitForDefaultStore()

        rerender(
            <CustomerSyncForm
                activeCustomer={Map({
                    id: 123,
                    name: 'John Smith',
                    email: 'john.updated@example.com',
                })}
                isCustomerSyncFormOpen
                setIsCustomerSyncFormOpen={jest.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByLabelText('Email*')).toHaveValue(
                'john.updated@example.com',
            )
        })
    })

    it('validates the form fields', () => {
        renderCustomerSyncForm({
            activeCustomer: Map({
                name: 'John Smith',
                email: '',
            }),
        })

        fireEvent.click(screen.getByText('Add delivery address'))
        fireEvent.click(screen.getByText('Sync Profile'))

        expect(
            screen.getByText(
                /Please enter a valid email address to sync this profile with Shopify/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Please select shopify store'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Please enter a street name and house number'),
        ).toBeInTheDocument()
        expect(screen.getByText('Please enter a city')).toBeInTheDocument()
        expect(screen.getByText('Please select a state')).toBeInTheDocument()
        expect(screen.getByText('Please enter a zip code')).toBeInTheDocument()
    })

    it.each([
        ['creating', false],
        ['updating', true],
    ])(
        'handles form submission when %s a customer with address',
        async (_, hasCustomerData) => {
            setupMockIntegrations(hasCustomerData)
            const shopifyCustomerActionMock = hasCustomerData
                ? mockScheduleShopifyUpdateCustomerActionHandler()
                : mockScheduleShopifyCreateNewCustomerActionHandler()
            const waitForShopifyCustomerActionRequest =
                shopifyCustomerActionMock.waitForRequest(server)
            server.use(shopifyCustomerActionMock.handler)
            const setIsCustomerSyncFormOpen = jest.fn()

            renderCustomerSyncForm({ setIsCustomerSyncFormOpen })
            await waitForDefaultStore()

            fillBasicForm()
            await fillAddressForm()
            fireEvent.click(screen.getByText('Sync Profile'))

            const expectedData = getExpectedDataWithAddress()
            await waitForShopifyCustomerActionRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.pathname).toBe(
                    `/api/ecom/integrations/2/customers/${
                        hasCustomerData ? 'update' : 'create'
                    }`,
                )
                if (hasCustomerData) {
                    expect(url.searchParams.get('customer_id')).toBe('123')
                }
                await expect(request.json()).resolves.toEqual(expectedData)
            })
        },
    )

    it.each([
        ['creating', false],
        ['updating', true],
    ])(
        'handles form submission when %s a customer without address',
        async (_, hasCustomerData) => {
            setupMockIntegrations(hasCustomerData)
            const shopifyCustomerActionMock = hasCustomerData
                ? mockScheduleShopifyUpdateCustomerActionHandler()
                : mockScheduleShopifyCreateNewCustomerActionHandler()
            const waitForShopifyCustomerActionRequest =
                shopifyCustomerActionMock.waitForRequest(server)
            server.use(shopifyCustomerActionMock.handler)

            renderCustomerSyncForm()
            await waitForDefaultStore()

            fillBasicForm()
            fireEvent.click(screen.getByText('Sync Profile'))

            const expectedData = getExpectedDataWithoutAddress()
            await waitForShopifyCustomerActionRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.pathname).toBe(
                    `/api/ecom/integrations/2/customers/${
                        hasCustomerData ? 'update' : 'create'
                    }`,
                )
                if (hasCustomerData) {
                    expect(url.searchParams.get('customer_id')).toBe('123')
                }
                await expect(request.json()).resolves.toEqual(expectedData)
            })
        },
    )

    it('dispatches error notification on create customer error', async () => {
        setupMockIntegrations(false)
        server.use(
            mockScheduleShopifyCreateNewCustomerActionHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        renderCustomerSyncForm()
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'There was an error syncing the customer',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('dispatches error notification on update customer error', async () => {
        setupMockIntegrations(true)
        server.use(
            mockScheduleShopifyUpdateCustomerActionHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        renderCustomerSyncForm()
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'There was an error syncing the customer',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('dispatches loading notification when create customer sync is in progress', async () => {
        setupMockIntegrations(false)
        const pendingResponse = createPendingResponse()
        server.use(
            mockScheduleShopifyCreateNewCustomerActionHandler(
                () => pendingResponse.response,
            ).handler,
        )

        renderCustomerSyncForm()
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Syncing profile to Shopify...',
                }),
            ).toHaveAttribute('data-intent', 'info')
        })
        pendingResponse.resolve()
    })

    it('dispatches loading notification when update customer sync is in progress', async () => {
        setupMockIntegrations(true)
        const pendingResponse = createPendingResponse()
        server.use(
            mockScheduleShopifyUpdateCustomerActionHandler(
                () => pendingResponse.response,
            ).handler,
        )

        renderCustomerSyncForm()
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Syncing profile to Shopify...',
                }),
            ).toHaveAttribute('data-intent', 'info')
        })
        pendingResponse.resolve()
    })

    it('dismisses the loading notification when sync succeeds', async () => {
        const dismissSpy = jest.spyOn(toast, 'dismiss')
        setupMockIntegrations(false)
        const pendingResponse = createPendingResponse()
        server.use(
            mockScheduleShopifyCreateNewCustomerActionHandler(
                () => pendingResponse.response,
            ).handler,
        )

        renderCustomerSyncForm()
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Syncing profile to Shopify...',
                }),
            ).toHaveAttribute('data-intent', 'info')
        })

        pendingResponse.resolve()

        await waitFor(() => {
            expect(dismissSpy).toHaveBeenCalledWith('customer-sync-to-shopify')
        })

        dismissSpy.mockRestore()
    })

    it('closes form when the message success on create customer action', async () => {
        setupMockIntegrations(false)

        const mockSetIsCustomerSyncFormOpen = jest.fn()
        renderCustomerSyncForm({
            setIsCustomerSyncFormOpen: mockSetIsCustomerSyncFormOpen,
        })
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(mockSetIsCustomerSyncFormOpen).toHaveBeenCalledWith(false)
        })
    })

    it('closes form when the message success on update customer action', async () => {
        setupMockIntegrations(true)

        const mockSetIsCustomerSyncFormOpen = jest.fn()
        renderCustomerSyncForm({
            setIsCustomerSyncFormOpen: mockSetIsCustomerSyncFormOpen,
        })
        await waitForDefaultStore()

        fillBasicForm()
        fireEvent.click(screen.getByText('Sync Profile'))

        await waitFor(() => {
            expect(mockSetIsCustomerSyncFormOpen).toHaveBeenCalledWith(false)
        })
    })

    it.each([
        ['creating', false],
        ['updating', true],
    ])(
        'handles form submission with falsy defaultAddressPhone when %s a customer (value: %s)',
        async (_, hasCustomerData) => {
            setupMockIntegrations(hasCustomerData)
            const shopifyCustomerActionMock = hasCustomerData
                ? mockScheduleShopifyUpdateCustomerActionHandler()
                : mockScheduleShopifyCreateNewCustomerActionHandler()
            const waitForShopifyCustomerActionRequest =
                shopifyCustomerActionMock.waitForRequest(server)
            server.use(shopifyCustomerActionMock.handler)

            renderCustomerSyncForm()
            await waitForDefaultStore()

            fillBasicForm()
            await fillAddressForm(false)

            const defaultAddressPhoneInput = screen.getByLabelText(
                'defaultAddressPhone',
            )
            expect(defaultAddressPhoneInput).toHaveValue('')

            fireEvent.click(screen.getByText('Sync Profile'))

            const expectedData = getExpectedDataWithAddress(true, false)
            await waitForShopifyCustomerActionRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.pathname).toBe(
                    `/api/ecom/integrations/2/customers/${
                        hasCustomerData ? 'update' : 'create'
                    }`,
                )
                if (hasCustomerData) {
                    expect(url.searchParams.get('customer_id')).toBe('123')
                }
                await expect(request.json()).resolves.toEqual(expectedData)
            })
        },
    )
})
