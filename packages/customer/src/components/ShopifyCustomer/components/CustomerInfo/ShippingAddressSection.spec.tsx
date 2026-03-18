import { act, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { render } from '../../../../tests/render.utils'
import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../ShopifyCustomerContext'
import type { ShippingAddress } from './ShippingAddressSection'
import { ShippingAddressSection } from './ShippingAddressSection'
import { useOrderFieldPreferences } from './useOrderFieldPreferences'

vi.mock('./useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

const mockFullAddress: ShippingAddress = {
    name: 'Toni Lopez',
    address1: '1234 Random Ave',
    address2: 'Apt 404',
    city: 'New York',
    province_code: 'NY',
    country_code: 'US',
    zip: '10023',
}

describe('ShippingAddressSection', () => {
    beforeEach(() => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    shippingAddress: { fields: [], sectionVisible: true },
                },
            },
            savePreferences: vi.fn(),
            getVisibleFields: vi.fn().mockReturnValue([]),
            isLoading: false,
        } as ReturnType<typeof useOrderFieldPreferences>)
    })

    it('renders nothing when shippingAddress is null', () => {
        const { container } = render(
            <ShippingAddressSection shippingAddress={null} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when shippingAddress is undefined', () => {
        const { container } = render(
            <ShippingAddressSection shippingAddress={undefined} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders "Shipping address" title', () => {
        render(<ShippingAddressSection shippingAddress={mockFullAddress} />)
        expect(screen.getByText('Shipping address')).toBeInTheDocument()
    })

    it('renders "Copy to clipboard" button', () => {
        render(<ShippingAddressSection shippingAddress={mockFullAddress} />)
        expect(
            screen.getByRole('button', { name: /copy to clipboard/i }),
        ).toBeInTheDocument()
    })

    it('renders "Edit shipping address" button', () => {
        render(<ShippingAddressSection shippingAddress={mockFullAddress} />)
        expect(
            screen.getByRole('button', { name: /edit shipping address/i }),
        ).toBeInTheDocument()
    })

    describe('address formatting', () => {
        it('renders all address parts on separate lines', () => {
            render(<ShippingAddressSection shippingAddress={mockFullAddress} />)
            expect(screen.getByText('Toni Lopez')).toBeInTheDocument()
            expect(screen.getByText('1234 Random Ave,')).toBeInTheDocument()
            expect(screen.getByText('Apt 404,')).toBeInTheDocument()
            expect(screen.getByText('New York, NY,')).toBeInTheDocument()
            expect(screen.getByText('US 10023')).toBeInTheDocument()
        })

        it('omits address2 when null', () => {
            render(
                <ShippingAddressSection
                    shippingAddress={{ ...mockFullAddress, address2: null }}
                />,
            )
            expect(screen.queryByText('Apt 404,')).not.toBeInTheDocument()
            expect(screen.getByText('1234 Random Ave,')).toBeInTheDocument()
            expect(screen.getByText('New York, NY,')).toBeInTheDocument()
        })

        it('omits address2 when undefined', () => {
            const { address2: __address2, ...addressWithout } = mockFullAddress
            render(<ShippingAddressSection shippingAddress={addressWithout} />)
            expect(screen.queryByText('Apt 404,')).not.toBeInTheDocument()
            expect(screen.getByText('1234 Random Ave,')).toBeInTheDocument()
        })

        it('omits province_code when null', () => {
            render(
                <ShippingAddressSection
                    shippingAddress={{
                        ...mockFullAddress,
                        province_code: null,
                    }}
                />,
            )
            expect(screen.getByText('New York,')).toBeInTheDocument()
            expect(screen.queryByText('New York, NY,')).not.toBeInTheDocument()
        })

        it('renders with only required fields', () => {
            const minimalAddress: ShippingAddress = {
                name: 'Jane Doe',
                address1: '100 Main St',
                city: 'Boston',
                country_code: 'US',
                zip: '02101',
            }
            render(<ShippingAddressSection shippingAddress={minimalAddress} />)
            expect(screen.getByText('Jane Doe')).toBeInTheDocument()
            expect(screen.getByText('100 Main St,')).toBeInTheDocument()
            expect(screen.getByText('Boston,')).toBeInTheDocument()
            expect(screen.getByText('US 02101')).toBeInTheDocument()
        })
    })

    describe('copy to clipboard', () => {
        it('copies the formatted address when copy button is clicked', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)
            const { user } = render(
                <ShippingAddressSection shippingAddress={mockFullAddress} />,
            )

            await user.click(
                screen.getByRole('button', { name: /copy to clipboard/i }),
            )

            expect(writeTextSpy).toHaveBeenCalledWith(
                'Toni Lopez\n1234 Random Ave,\nApt 404,\nNew York, NY,\nUS 10023',
            )
        })

        it('copies address without optional fields when they are absent', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)
            const { user } = render(
                <ShippingAddressSection
                    shippingAddress={{
                        ...mockFullAddress,
                        address2: null,
                        province_code: null,
                    }}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /copy to clipboard/i }),
            )

            expect(writeTextSpy).toHaveBeenCalledWith(
                'Toni Lopez\n1234 Random Ave,\nNew York,\nUS 10023',
            )
        })

        it('dispatches a success notification when copy button is clicked', async () => {
            const dispatchNotification = vi.fn()
            vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(
                undefined,
            )

            const { user } = render(
                <ShopifyCustomerContext.Provider
                    value={{ dispatchNotification }}
                >
                    <ShippingAddressSection shippingAddress={mockFullAddress} />
                </ShopifyCustomerContext.Provider>,
            )

            await user.click(
                screen.getByRole('button', { name: /copy to clipboard/i }),
            )

            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Address copied to clipboard',
            })
        })
    })

    describe('edit button', () => {
        it('calls onEdit when edit button is clicked', async () => {
            const onEdit = vi.fn()
            const { user } = render(
                <ShippingAddressSection
                    shippingAddress={mockFullAddress}
                    onEdit={onEdit}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit shipping address/i }),
            )

            expect(onEdit).toHaveBeenCalledTimes(1)
        })

        it('renders edit button even without onEdit prop', () => {
            render(<ShippingAddressSection shippingAddress={mockFullAddress} />)
            expect(
                screen.getByRole('button', { name: /edit shipping address/i }),
            ).toBeInTheDocument()
        })
    })

    describe('renderEditShippingAddressModal', () => {
        it('opens modal when edit button is clicked', async () => {
            const renderEditShippingAddressModal = vi.fn().mockReturnValue(null)

            const { user } = render(
                <ShippingAddressSection
                    shippingAddress={mockFullAddress}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit shipping address/i }),
            )

            expect(renderEditShippingAddressModal).toHaveBeenCalledWith(
                expect.objectContaining({ isOpen: true }),
            )
        })

        it('does not call onEdit when renderEditShippingAddressModal is provided', async () => {
            const onEdit = vi.fn()
            const renderEditShippingAddressModal = vi.fn().mockReturnValue(null)

            const { user } = render(
                <ShippingAddressSection
                    shippingAddress={mockFullAddress}
                    onEdit={onEdit}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit shipping address/i }),
            )

            expect(onEdit).not.toHaveBeenCalled()
        })

        it('passes correct orderId, customerId, and integrationId to the render prop', () => {
            const renderEditShippingAddressModal = vi.fn().mockReturnValue(null)

            render(
                <ShippingAddressSection
                    shippingAddress={mockFullAddress}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                    orderId="order-123"
                    customerId="customer-456"
                    integrationId={99}
                />,
            )

            expect(renderEditShippingAddressModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: false,
                    orderId: 'order-123',
                    customerId: 'customer-456',
                    integrationId: 99,
                }),
            )
        })

        it('closes the modal when onClose is called', async () => {
            let capturedOnClose: (() => void) | undefined
            const renderEditShippingAddressModal = vi
                .fn()
                .mockImplementation(({ onClose }) => {
                    capturedOnClose = onClose
                    return null
                })

            const { user } = render(
                <ShippingAddressSection
                    shippingAddress={mockFullAddress}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit shipping address/i }),
            )

            expect(renderEditShippingAddressModal).toHaveBeenCalledWith(
                expect.objectContaining({ isOpen: true }),
            )

            act(() => {
                capturedOnClose?.()
            })

            expect(renderEditShippingAddressModal).toHaveBeenLastCalledWith(
                expect.objectContaining({ isOpen: false }),
            )
        })

        it('updates the displayed address when onSuccess is called', async () => {
            let capturedOnSuccess:
                | ((address: Record<string, unknown>) => void)
                | undefined
            const renderEditShippingAddressModal = vi
                .fn()
                .mockImplementation(({ onSuccess }) => {
                    capturedOnSuccess = onSuccess
                    return null
                })

            const { user } = render(
                <ShippingAddressSection
                    shippingAddress={mockFullAddress}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit shipping address/i }),
            )

            act(() => {
                capturedOnSuccess?.({
                    first_name: 'Jane',
                    last_name: 'Smith',
                    address1: '5678 New Street',
                    city: 'Los Angeles',
                    country_code: 'US',
                    zip: '90001',
                    province: 'CA',
                })
            })

            expect(screen.getByText('Jane Smith')).toBeInTheDocument()
            expect(screen.getByText('5678 New Street,')).toBeInTheDocument()
            expect(screen.getByText('Los Angeles, CA,')).toBeInTheDocument()
        })
    })

    describe('field preferences', () => {
        it('renders nothing when sectionVisible is false', () => {
            mockUseOrderFieldPreferences.mockReturnValue({
                preferences: {
                    sections: {
                        shippingAddress: {
                            fields: [],
                            sectionVisible: false,
                        },
                    },
                },
                savePreferences: vi.fn(),
                getVisibleFields: vi.fn().mockReturnValue([]),
                isLoading: false,
            } as ReturnType<typeof useOrderFieldPreferences>)

            const { container } = render(
                <ShippingAddressSection shippingAddress={mockFullAddress} />,
            )
            expect(container).toBeEmptyDOMElement()
        })
    })
})
