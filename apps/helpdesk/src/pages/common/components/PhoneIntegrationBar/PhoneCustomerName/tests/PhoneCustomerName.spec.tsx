import { render } from '@testing-library/react'
import parsePhoneNumber from 'libphonenumber-js'

import PhoneCustomerName from '../PhoneCustomerName'

jest.mock('libphonenumber-js')
const parsePhoneNumberMock = parsePhoneNumber as jest.MockedFunction<
    typeof parsePhoneNumber
>

describe('<PhoneCustomerName/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each([
        ['+14158880101', '+1 415 888 0101'],
        ['+33611223344', '+33 6 11 22 33 44'],
    ])(
        'should render with name and phone number',
        (phoneNumber, formattedPhoneNumber) => {
            parsePhoneNumberMock.mockReturnValue({
                formatInternational: () => formattedPhoneNumber,
            } as any)

            const { container } = render(
                <PhoneCustomerName name="Bob" phoneNumber={phoneNumber} />,
            )

            expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
            expect(container.firstChild).toMatchSnapshot()
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
})
