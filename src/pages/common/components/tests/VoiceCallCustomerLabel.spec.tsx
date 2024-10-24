import {cleanup, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {CustomerLabel} from 'pages/common/utils/labels'
import * as voiceCallHooks from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import VoiceCallCustomerLabel from '../VoiceCallCustomerLabel/VoiceCallCustomerLabel'

jest.mock('pages/common/utils/labels', () => ({
    CustomerLabel: (props: ComponentProps<typeof CustomerLabel>) => (
        <p>CustomerLabel {props.customer}</p>
    ),
}))

const useCustomerDetailsSpy = jest.spyOn(voiceCallHooks, 'useCustomerDetails')

describe('VoiceCallCustomerLabel', () => {
    const renderComponent = (
        props: ComponentProps<typeof VoiceCallCustomerLabel>
    ) => render(<VoiceCallCustomerLabel {...props} />)

    afterEach(() => {
        cleanup()
    })

    it('should render customer name when customer name exists', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)
        renderComponent({customerId: 1, phoneNumber: '1234567890'})

        expect(
            screen.getByText('CustomerLabel Customer Name')
        ).toBeInTheDocument()
    })

    it('should render phone number when customer does not exist', () => {
        useCustomerDetailsSpy.mockReturnValue({
            error: {response: {status: 404}},
        } as any)
        renderComponent({customerId: 1, phoneNumber: '1234567890'})

        expect(screen.getByText('CustomerLabel 1234567890')).toBeInTheDocument()
    })

    it('should display name prop and call useCustomerDetails with enabled=false when customer name is provided', () => {
        useCustomerDetailsSpy.mockReturnValue({
            customer: 'Customer Name',
        } as any)

        renderComponent({
            customerId: 1,
            customerName: 'NameProp',
            phoneNumber: '1234567890',
        })

        expect(useCustomerDetailsSpy.mock.calls?.[0]?.[0]?.isEnabled).toBe(
            false
        )
        expect(screen.getByText('CustomerLabel NameProp')).toBeInTheDocument()
    })
})
