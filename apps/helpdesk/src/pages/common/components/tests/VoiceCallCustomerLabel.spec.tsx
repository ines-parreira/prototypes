import type { ComponentProps, ReactNode } from 'react'

import { cleanup, render, screen } from '@testing-library/react'

import type { CustomerLabel } from 'pages/common/utils/labels'
import * as voiceCallHooks from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import VoiceCallCustomerLabel from '../VoiceCallCustomerLabel/VoiceCallCustomerLabel'

jest.mock('pages/common/utils/labels', () => ({
    CustomerLabel: (props: ComponentProps<typeof CustomerLabel>) => (
        // TODO(React18): Find a solution to casting once we upgrade to React 18 types
        <p>CustomerLabel {props.customer as ReactNode}</p>
    ),
}))

jest.mock('pages/phoneNumbers/utils', () => ({
    formatPhoneNumberInternational: jest.fn((phone: string) => `+1 ${phone}`),
}))

jest.mock('@gorgias/axiom', () => ({
    LegacyTooltip: ({ children }: { children: ReactNode }) => (
        <div data-testid="tooltip">{children}</div>
    ),
}))

const useCustomerDetailsSpy = jest.spyOn(voiceCallHooks, 'useCustomerDetails')

describe('VoiceCallCustomerLabel', () => {
    const renderComponent = (
        props: ComponentProps<typeof VoiceCallCustomerLabel>,
    ) => render(<VoiceCallCustomerLabel {...props} />)

    afterEach(() => {
        cleanup()
    })

    it('should render customer name when customer name exists', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: { name: 'Customer Name' },
        } as any)
        renderComponent({ customerId: 1, phoneNumber: '1234567890' })

        expect(
            screen.getByText('CustomerLabel Customer Name'),
        ).toBeInTheDocument()
    })

    it('should render phone number when customer does not exist', () => {
        useCustomerDetailsSpy.mockReturnValue({
            error: { response: { status: 404 } },
        } as any)
        renderComponent({ customerId: 1, phoneNumber: '1234567890' })

        expect(
            screen.getByText('CustomerLabel +1 1234567890'),
        ).toBeInTheDocument()
    })

    it('should display name prop and call useCustomerDetails with enabled=false when customer name is provided', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: { name: 'Customer Name' },
        } as any)

        renderComponent({
            customerId: 1,
            customerName: 'NameProp',
            phoneNumber: '1234567890',
        })

        expect(useCustomerDetailsSpy.mock.calls?.[0]?.[0]?.isEnabled).toBe(
            false,
        )
        expect(screen.getByText('CustomerLabel NameProp')).toBeInTheDocument()
    })

    it('should correctly display non-interactable label', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: { name: 'Customer Name' },
        } as any)

        const { container } = renderComponent({
            customerId: 1,
            phoneNumber: '1234567890',
            interactable: false,
        })

        const customerLabel = container.querySelector('.interactable')
        expect(customerLabel).not.toBeInTheDocument()
    })

    it('should correctly display interactable label', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: { name: 'Customer Name' },
        } as any)

        const { container } = renderComponent({
            customerId: 1,
            phoneNumber: '1234567890',
            interactable: true,
        })

        const customerLabel = container.querySelector('.interactable')
        expect(customerLabel).toBeInTheDocument()
        expect(customerLabel).toHaveTextContent('CustomerLabel Customer Name')
    })

    describe('show both name and phone', () => {
        it('should display both name and phone number when showBothNameAndPhone is true and customer has name', () => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: { name: 'Guybrush Threepwood' },
            } as any)

            const { container } = renderComponent({
                customerId: 1,
                phoneNumber: '1234567890',
                showBothNameAndPhone: true,
            })

            expect(container).toHaveTextContent(
                'Guybrush Threepwood (+1 1234567890)',
            )
        })

        it('should display both provided name and phone number when showBothNameAndPhone is true', () => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: null,
            } as any)

            const { container } = renderComponent({
                customerId: 1,
                customerName: 'Elaine Marley',
                phoneNumber: '1234567890',
                showBothNameAndPhone: true,
            })

            expect(container).toHaveTextContent('Elaine Marley (+1 1234567890)')
        })

        it('should only display phone number when showBothNameAndPhone is true but no customer name exists', () => {
            useCustomerDetailsSpy.mockReturnValue({
                error: { response: { status: 404 } },
            } as any)

            renderComponent({
                customerId: 1,
                phoneNumber: '1234567890',
                showBothNameAndPhone: true,
            })

            expect(
                screen.getByText('CustomerLabel +1 1234567890'),
            ).toBeInTheDocument()
        })

        it('should not display phone number separately when showBothNameAndPhone is false', () => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: { name: 'Customer Name' },
            } as any)

            const { container } = renderComponent({
                customerId: 1,
                phoneNumber: '1234567890',
                showBothNameAndPhone: false,
            })

            expect(
                screen.getByText('CustomerLabel Customer Name'),
            ).toBeInTheDocument()
            expect(container).not.toHaveTextContent('(+1 1234567890)')
        })

        it('should display phone number in tooltip when withTooltip and showBothNameAndPhone are true', () => {
            useCustomerDetailsSpy.mockReturnValue({
                customer: { name: 'Guybrush Threepwood' },
            } as any)

            renderComponent({
                customerId: 1,
                phoneNumber: '1234567890',
                showBothNameAndPhone: true,
                withTooltip: true,
            })

            const tooltip = screen.getByTestId('tooltip')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent(
                'CustomerLabel Guybrush Threepwood (+1 1234567890)',
            )
        })
    })
})
