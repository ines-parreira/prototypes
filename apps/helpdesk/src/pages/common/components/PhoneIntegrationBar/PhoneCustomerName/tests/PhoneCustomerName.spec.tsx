import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import parsePhoneNumber from 'libphonenumber-js'

import goToTicket from 'common/utils/goToTicket'

import PhoneCustomerName from '../PhoneCustomerName'

jest.mock('libphonenumber-js')
jest.mock('common/utils/goToTicket')

const parsePhoneNumberMock = parsePhoneNumber as jest.MockedFunction<
    typeof parsePhoneNumber
>
const goToTicketMock = goToTicket as jest.MockedFunction<typeof goToTicket>

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

            render(
                <PhoneCustomerName
                    name="Bob"
                    phoneNumber={phoneNumber}
                    ticketId={123}
                />,
            )

            expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
            expect(screen.getByText('Bob')).toBeInTheDocument()
            expect(
                screen.getByText(`(${formattedPhoneNumber})`, { exact: false }),
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
                <PhoneCustomerName
                    name={null}
                    phoneNumber={phoneNumber}
                    ticketId={123}
                />,
            )

            expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
            expect(getByText(formattedPhoneNumber)).toBeInTheDocument()
        },
    )

    it('should render raw phone number when name is not provided and phone number is not parseable', () => {
        const phoneNumber = 'invalid-phone'
        parsePhoneNumberMock.mockReturnValue(undefined as any)

        const { getByText } = render(
            <PhoneCustomerName
                name={null}
                phoneNumber={phoneNumber}
                ticketId={123}
            />,
        )

        expect(parsePhoneNumberMock).toHaveBeenCalledWith(phoneNumber)
        expect(getByText(phoneNumber)).toBeInTheDocument()
    })

    it('should navigate to ticket when button is clicked and ticketId exists', async () => {
        const user = userEvent.setup()
        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 888 0101',
        } as any)

        render(
            <PhoneCustomerName
                name="Bob"
                phoneNumber="+14158880101"
                ticketId={456}
            />,
        )

        const button = screen.getByRole('button')
        await user.click(button)

        expect(goToTicketMock).toHaveBeenCalledWith(456)
    })

    it('should render as plain text when ticketId is null', () => {
        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 888 0101',
        } as any)

        render(
            <PhoneCustomerName
                name="Bob"
                phoneNumber="+14158880101"
                ticketId={null}
            />,
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
        expect(
            screen.getByText('(+1 415 888 0101)', { exact: false }),
        ).toBeInTheDocument()
    })

    it('should render as plain text when ticketId is undefined', () => {
        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 888 0101',
        } as any)

        render(
            <PhoneCustomerName
                name="Bob"
                phoneNumber="+14158880101"
                ticketId={undefined}
            />,
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('should display chevron icon when ticketId exists', () => {
        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 888 0101',
        } as any)

        render(
            <PhoneCustomerName
                name="Bob"
                phoneNumber="+14158880101"
                ticketId={123}
            />,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(
            screen.getByRole('img', {
                name: 'arrow-chevron-right',
                hidden: true,
            }),
        ).toBeInTheDocument()
    })

    it('should not display chevron icon when ticketId is null', () => {
        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 888 0101',
        } as any)

        render(
            <PhoneCustomerName
                name="Bob"
                phoneNumber="+14158880101"
                ticketId={null}
            />,
        )

        expect(
            screen.queryByRole('img', {
                name: 'arrow-chevron-right',
                hidden: true,
            }),
        ).not.toBeInTheDocument()
    })

    it('should render button with leadingSlot when provided', () => {
        parsePhoneNumberMock.mockReturnValue({
            formatInternational: () => '+1 415 888 0101',
        } as any)

        render(
            <PhoneCustomerName
                name="Bob"
                phoneNumber="+14158880101"
                ticketId={123}
                leadingSlot="phone"
            />,
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })
})
