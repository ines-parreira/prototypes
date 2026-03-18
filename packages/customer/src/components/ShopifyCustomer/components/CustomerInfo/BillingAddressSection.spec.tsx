import { screen } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../ShopifyCustomerContext'
import { BillingAddressSection } from './BillingAddressSection'
import { useOrderFieldPreferences } from './useOrderFieldPreferences'

vi.mock('./useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

const mockFullAddress = {
    name: 'Jane Doe',
    address1: '100 Main St',
    address2: 'Suite 200',
    city: 'Boston',
    province_code: 'MA',
    country_code: 'US',
    zip: '02101',
}

describe('BillingAddressSection', () => {
    beforeEach(() => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    billingAddress: { fields: [], sectionVisible: true },
                },
            },
            savePreferences: vi.fn(),
            getVisibleFields: vi.fn().mockReturnValue([]),
            isLoading: false,
        } as ReturnType<typeof useOrderFieldPreferences>)
    })

    it('renders nothing when billingAddress is null', () => {
        const { container } = render(
            <BillingAddressSection billingAddress={null} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders address parts correctly', () => {
        render(<BillingAddressSection billingAddress={mockFullAddress} />)

        expect(screen.getByText('Billing address')).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('100 Main St,')).toBeInTheDocument()
        expect(screen.getByText('Suite 200,')).toBeInTheDocument()
        expect(screen.getByText('Boston, MA,')).toBeInTheDocument()
        expect(screen.getByText('US 02101')).toBeInTheDocument()
    })

    it('copies address to clipboard on click', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)
        const dispatchNotification = vi.fn()

        const { user } = render(
            <ShopifyCustomerContext.Provider value={{ dispatchNotification }}>
                <BillingAddressSection billingAddress={mockFullAddress} />
            </ShopifyCustomerContext.Provider>,
        )

        await user.click(
            screen.getByRole('button', {
                name: /copy billing address to clipboard/i,
            }),
        )

        expect(writeTextSpy).toHaveBeenCalledWith(
            'Jane Doe\n100 Main St,\nSuite 200,\nBoston, MA,\nUS 02101',
        )
        expect(dispatchNotification).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Address copied to clipboard',
        })
    })

    it('renders nothing when sectionVisible is false', () => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    billingAddress: { fields: [], sectionVisible: false },
                },
            },
            savePreferences: vi.fn(),
            getVisibleFields: vi.fn().mockReturnValue([]),
            isLoading: false,
        } as ReturnType<typeof useOrderFieldPreferences>)

        const { container } = render(
            <BillingAddressSection billingAddress={mockFullAddress} />,
        )
        expect(container).toBeEmptyDOMElement()
    })
})
