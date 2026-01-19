import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import parsePhoneNumber from 'libphonenumber-js'

import PhoneCustomerName from '../PhoneCustomerName'

jest.mock('@repo/feature-flags')
jest.mock('libphonenumber-js')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const parsePhoneNumberMock = parsePhoneNumber as jest.MockedFunction<
    typeof parsePhoneNumber
>

describe('<PhoneCustomerName/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
    })

    it.each([
        ['+14158880101', '+1 415 888 0101'],
        ['+33611223344', '+33 6 11 22 33 44'],
    ])(
        'should render with name and phone number and arrow icon',
        (phoneNumber, formattedPhoneNumber) => {
            parsePhoneNumberMock.mockReturnValue({
                formatInternational: () => formattedPhoneNumber,
            } as any)

            render(<PhoneCustomerName name="Bob" phoneNumber={phoneNumber} />)

            expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
            expect(
                screen.getByRole('img', { hidden: true }),
            ).toBeInTheDocument()
        },
    )

    it.each([
        ['+14158880101', '+1 415 888 0101'],
        ['+33611223344', '+33 6 11 22 33 44'],
    ])(
        'should render only phone number when name is not provided',
        (phoneNumber, formattedPhoneNumber) => {
            parsePhoneNumberMock.mockReturnValue({
                formatInternational: () => formattedPhoneNumber,
            } as any)

            const { getByText } = render(
                <PhoneCustomerName name={null} phoneNumber={phoneNumber} />,
            )

            expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
            expect(getByText(formattedPhoneNumber)).toBeInTheDocument()
        },
    )

    it('should render raw phone number when name is not provided and phone number is not parseable', () => {
        const phoneNumber = 'invalid-phone'
        parsePhoneNumberMock.mockReturnValue(undefined as any)

        const { getByText } = render(
            <PhoneCustomerName name={null} phoneNumber={phoneNumber} />,
        )

        expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
        expect(getByText(phoneNumber)).toBeInTheDocument()
    })

    it('should not display arrow icon with restyling FF OFF', () => {
        mockUseFlag.mockImplementation((flagKey) => {
            if (flagKey === FeatureFlagKey.CallBarRestyling) {
                return false
            }
        })

        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 555 1234',
        } as any)

        render(<PhoneCustomerName name={null} phoneNumber="+14155551234" />)

        expect(
            screen.queryByRole('img', { hidden: true }),
        ).not.toBeInTheDocument()
    })
})
