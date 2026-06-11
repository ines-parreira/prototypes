import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { ShippingAddressSection } from './ShippingAddressSection'

const { mockUseFlag, mockCopyToClipboard } = vi.hoisted(() => ({
    mockUseFlag: vi.fn().mockReturnValue(false),
    mockCopyToClipboard: vi.fn(),
}))

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        NewOrdersSidebar: 'linear-HELP-6616-new-orders-sidebar',
    },
    useFlag: mockUseFlag,
}))

vi.mock('@repo/hooks', () => ({
    useCopyToClipboard: () => [null, mockCopyToClipboard],
}))

vi.mock('@gorgias/toolkit-react', () => ({
    useCopyToClipboard: () => [null, mockCopyToClipboard],
}))

const mockUseOrderFieldPreferences = vi.fn(() => ({
    preferences: { sections: {} },
    savePreferences: vi.fn(),
    getVisibleFields: () => [],
}))

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: () => mockUseOrderFieldPreferences(),
}))

const mockAddress = {
    name: 'John Doe',
    address1: '123 Main St',
    address2: null,
    city: 'New York',
    province_code: 'NY',
    country: 'United States',
    zip: '10001',
}

describe('ShippingAddressSection (V2)', () => {
    beforeAll(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: vi.fn().mockResolvedValue(undefined) },
            writable: true,
            configurable: true,
        })
    })

    beforeEach(() => {
        vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        mockUseFlag.mockReturnValue(false)
    })

    it('renders nothing when section is hidden by preferences', () => {
        mockUseOrderFieldPreferences.mockReturnValueOnce({
            preferences: {
                sections: { shippingAddress: { sectionVisible: false } },
            },
            savePreferences: vi.fn(),
            getVisibleFields: () => [],
        })

        render(<ShippingAddressSection shippingAddress={mockAddress} />)

        expect(screen.queryByText('Shipping address')).not.toBeInTheDocument()
    })

    it('renders nothing when no shipping address is provided', () => {
        render(<ShippingAddressSection shippingAddress={null} />)

        expect(screen.queryByText('Shipping address')).not.toBeInTheDocument()
    })

    it('renders the shipping address parts', () => {
        render(<ShippingAddressSection shippingAddress={mockAddress} />)

        expect(screen.getByText('Shipping address')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('123 Main St,')).toBeInTheDocument()
        expect(screen.getByText('New York, NY,')).toBeInTheDocument()
        expect(screen.getByText('United States 10001')).toBeInTheDocument()
    })

    it('copies the full address to clipboard when copy button is clicked', async () => {
        const { user } = render(
            <ShippingAddressSection shippingAddress={mockAddress} />,
        )

        await user.click(
            screen.getByRole('button', { name: /copy to clipboard/i }),
        )

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            'John Doe\n123 Main St,\nNew York, NY,\nUnited States 10001',
        )
    })

    it('calls onEdit when the edit button is clicked and no modal renderer is provided', async () => {
        const onEdit = vi.fn()
        const { user } = render(
            <ShippingAddressSection
                shippingAddress={mockAddress}
                onEdit={onEdit}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /edit shipping address/i }),
        )

        expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('opens the edit modal when a modal renderer is provided', async () => {
        const renderModal = vi.fn(({ isOpen }) =>
            isOpen ? <div>Edit modal</div> : null,
        )
        const { user } = render(
            <ShippingAddressSection
                shippingAddress={mockAddress}
                orderId="1"
                customerId="2"
                renderEditShippingAddressModal={renderModal}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /edit shipping address/i }),
        )

        expect(screen.getByText('Edit modal')).toBeInTheDocument()
    })

    it('updates the displayed address when the modal reports success', async () => {
        const newAddress = {
            first_name: 'Jane',
            last_name: 'Smith',
            address1: '456 Updated Ave',
            city: 'Boston',
            province: 'MA',
            country: 'United States',
            zip: '02101',
        }
        const renderModal = vi.fn(({ isOpen, onSuccess }) =>
            isOpen ? (
                <button onClick={() => onSuccess(newAddress)}>Confirm</button>
            ) : null,
        )
        const { user } = render(
            <ShippingAddressSection
                shippingAddress={mockAddress}
                orderId="1"
                customerId="2"
                renderEditShippingAddressModal={renderModal}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /edit shipping address/i }),
        )
        await user.click(screen.getByRole('button', { name: /confirm/i }))

        expect(screen.getByText('456 Updated Ave,')).toBeInTheDocument()
        expect(screen.queryByText('123 Main St,')).not.toBeInTheDocument()
    })

    describe('when NewOrdersSidebar FF is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation(
                (key) => key === 'linear-HELP-6616-new-orders-sidebar',
            )
        })

        it('renders address with zip on city line and country at the bottom', () => {
            render(<ShippingAddressSection shippingAddress={mockAddress} />)

            expect(screen.getByText('New York, NY, 10001')).toBeInTheDocument()
            expect(screen.getByText('United States')).toBeInTheDocument()
            expect(
                screen.queryByText('United States 10001'),
            ).not.toBeInTheDocument()
        })

        it('renders a copy button for each address line', () => {
            render(<ShippingAddressSection shippingAddress={mockAddress} />)

            const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
            expect(copyButtons).toHaveLength(4)
        })

        it('copies an individual address line when its copy button is clicked', async () => {
            mockCopyToClipboard.mockClear()
            const { user } = render(
                <ShippingAddressSection shippingAddress={mockAddress} />,
            )

            const [firstCopyButton] = screen.getAllByRole('button', {
                name: 'Copy',
            })
            await user.click(firstCopyButton)

            expect(mockCopyToClipboard).toHaveBeenCalledWith('John Doe')
        })

        it('copies the full address with the new format when the header copy button is clicked', async () => {
            const { user } = render(
                <ShippingAddressSection shippingAddress={mockAddress} />,
            )

            await user.click(
                screen.getByRole('button', { name: /copy to clipboard/i }),
            )

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                'John Doe\n123 Main St,\nNew York, NY, 10001\nUnited States',
            )
        })
    })
})
