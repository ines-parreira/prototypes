import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { BillingAddressSection } from './BillingAddressSection'

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

const mockAddress = {
    name: 'Jane Doe',
    address1: '100 Main St',
    address2: 'Suite 200',
    city: 'Boston',
    province_code: 'MA',
    country_code: 'US',
    zip: '02101',
}

describe('BillingAddressSection (V2)', () => {
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
            <BillingAddressSection billingAddress={mockAddress} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the section heading and all address parts', () => {
        render(<BillingAddressSection billingAddress={mockAddress} />)

        expect(screen.getByText('Billing address')).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('100 Main St,')).toBeInTheDocument()
        expect(screen.getByText('Suite 200,')).toBeInTheDocument()
        expect(screen.getByText('Boston, MA,')).toBeInTheDocument()
        expect(screen.getByText('US 02101')).toBeInTheDocument()
    })

    it('copies the address to clipboard when copy button is clicked', async () => {
        const writeTextSpy = vi
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const { user } = render(
            <BillingAddressSection billingAddress={mockAddress} />,
        )

        await user.click(
            screen.getByRole('button', {
                name: /copy billing address to clipboard/i,
            }),
        )

        expect(writeTextSpy).toHaveBeenCalledWith(
            'Jane Doe\n100 Main St,\nSuite 200,\nBoston, MA,\nUS 02101',
        )
    })
})
