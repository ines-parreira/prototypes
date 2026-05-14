import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PhoneOption } from 'AIJourney/types/RcsTestSend'

import { RcsRequestCard } from './RcsRequestCard'

jest.mock('AIJourney/components/CountryCodeSelect/CountryCodeSelect', () => ({
    CountryCodeSelect: ({
        onCountryChange,
    }: {
        onCountryChange: (code: string) => void
    }) => <button onClick={() => onCountryChange('CA')}>Country code</button>,
}))

const phoneOptions: PhoneOption[] = [
    { id: 1, label: '[MKT] US Store', countryCode: 'US' },
    { id: 2, label: '[MKT] CA Store', countryCode: 'CA' },
]

const defaultProps = {
    phoneOptions,
    selectedOption: undefined,
    onOptionChange: jest.fn(),
    phoneInput: '',
    onPhoneChange: jest.fn(),
    selectedCountryCode: undefined,
    onCountryChange: jest.fn(),
    dryRun: false,
    onDryRunChange: jest.fn(),
}

describe('<RequestCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Request card header', () => {
        render(<RcsRequestCard {...defaultProps} />)

        expect(screen.getByText('Request')).toBeInTheDocument()
    })

    it('renders the phone integration select label', () => {
        render(<RcsRequestCard {...defaultProps} />)

        expect(screen.getByText('Phone integration')).toBeInTheDocument()
    })

    it('renders the recipient phone label and caption', () => {
        render(<RcsRequestCard {...defaultProps} />)

        expect(screen.getByText('Recipient phone')).toBeInTheDocument()
        expect(
            screen.getByText("You'll receive the test message on this number"),
        ).toBeInTheDocument()
    })

    it('renders the dry run toggle label', () => {
        render(<RcsRequestCard {...defaultProps} />)

        expect(screen.getByText('Dry run')).toBeInTheDocument()
    })

    it('calls onPhoneChange when recipient phone input changes', async () => {
        const onPhoneChange = jest.fn()
        const user = userEvent.setup()

        render(
            <RcsRequestCard {...defaultProps} onPhoneChange={onPhoneChange} />,
        )

        await user.type(
            screen.getByRole('textbox', { name: /recipient phone/i }),
            '555',
        )

        expect(onPhoneChange).toHaveBeenCalled()
    })

    it('reflects the current phoneInput value', () => {
        render(<RcsRequestCard {...defaultProps} phoneInput="555-1234" />)

        expect(
            screen.getByRole('textbox', { name: /recipient phone/i }),
        ).toHaveValue('555-1234')
    })

    it('reflects the current dryRun toggle state', () => {
        render(<RcsRequestCard {...defaultProps} dryRun={true} />)

        expect(screen.getByRole('switch', { name: /dry run/i })).toBeChecked()
    })

    it('calls onCountryChange with the selected country code', async () => {
        const onCountryChange = jest.fn()
        const user = userEvent.setup()

        render(
            <RcsRequestCard
                {...defaultProps}
                onCountryChange={onCountryChange}
            />,
        )

        await user.click(screen.getByText('Country code'))

        expect(onCountryChange).toHaveBeenCalledWith('CA')
        expect(onCountryChange).toHaveBeenCalledTimes(1)
    })
})
