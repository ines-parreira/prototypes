import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { BillingAddressSection } from './BillingAddressSection'

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
    beforeAll(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: vi.fn().mockResolvedValue(undefined) },
            writable: true,
            configurable: true,
        })
    })

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

    afterEach(() => {
        vi.restoreAllMocks()
        mockUseFlag.mockReturnValue(false)
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

    describe('when NewOrdersSidebar FF is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation(
                (key) => key === 'linear-HELP-6616-new-orders-sidebar',
            )
        })

        it('renders address with zip on city line and country at the bottom', () => {
            render(<BillingAddressSection billingAddress={mockAddress} />)

            expect(screen.getByText('Boston, MA, 02101')).toBeInTheDocument()
            expect(screen.getByText('US')).toBeInTheDocument()
            expect(screen.queryByText('US 02101')).not.toBeInTheDocument()
        })

        it('renders a copy button for each address line', () => {
            render(<BillingAddressSection billingAddress={mockAddress} />)

            const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
            expect(copyButtons).toHaveLength(5)
        })

        it('copies an individual address line when its copy button is clicked', async () => {
            mockCopyToClipboard.mockClear()
            const { user } = render(
                <BillingAddressSection billingAddress={mockAddress} />,
            )

            const [firstCopyButton] = screen.getAllByRole('button', {
                name: 'Copy',
            })
            await user.click(firstCopyButton)

            expect(mockCopyToClipboard).toHaveBeenCalledWith('Jane Doe')
        })

        it('copies the full address with the new format when the header copy button is clicked', async () => {
            vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(
                undefined,
            )
            const { user } = render(
                <BillingAddressSection billingAddress={mockAddress} />,
            )

            await user.click(
                screen.getByRole('button', {
                    name: /copy billing address to clipboard/i,
                }),
            )

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                'Jane Doe\n100 Main St,\nSuite 200,\nBoston, MA, 02101\nUS',
            )
        })
    })
})
