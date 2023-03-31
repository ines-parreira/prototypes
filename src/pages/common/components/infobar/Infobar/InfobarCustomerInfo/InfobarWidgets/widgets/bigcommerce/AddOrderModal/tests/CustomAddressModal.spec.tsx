import {render, screen} from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import {CustomAddressModal} from '../CustomAddressModal'

describe('CustomAddressModal', () => {
    const onAddCustomAddressMock = jest.fn()
    const onCloseMock = jest.fn()
    const onOpenMock = jest.fn()

    it('should add custom address when clicking the `Create Address` button', async () => {
        const {getByRole} = render(
            <CustomAddressModal
                onAddCustomAddress={onAddCustomAddressMock}
                addressType="billing"
                currencyCode="EUR"
                isOpen={true}
                integrationId={1}
                customerId={1}
                onOpen={onOpenMock}
                onClose={onCloseMock}
            />
        )

        await userEvent.type(
            getByRole('textbox', {name: 'First Name required'}),
            'test'
        )

        await userEvent.type(
            getByRole('textbox', {name: 'Last Name required'}),
            'test'
        )

        await userEvent.type(
            getByRole('textbox', {name: 'Address 1 required'}),
            'test'
        )

        await userEvent.type(
            getByRole('textbox', {name: 'City required'}),
            'test'
        )

        await userEvent.type(
            getByRole('textbox', {name: 'State or province required'}),
            'test'
        )

        await userEvent.type(
            getByRole('textbox', {name: 'ZIP/Postal code required'}),
            'test'
        )

        userEvent.click(
            getByRole('checkbox', {name: "Save to customer's address book"})
        )

        userEvent.click(screen.getByText('Create Address'))

        expect(onAddCustomAddressMock).toBeCalled()
        expect(onCloseMock).toBeCalled()
    })

    it('should fail the form validation', () => {
        const {getByRole} = render(
            <CustomAddressModal
                onAddCustomAddress={onAddCustomAddressMock}
                addressType="billing"
                currencyCode="EUR"
                isOpen={true}
                integrationId={1}
                customerId={1}
                onOpen={onOpenMock}
                onClose={onCloseMock}
            />
        )

        userEvent.click(screen.getByText('Create Address'))

        expect(
            getByRole('textbox', {name: 'First Name required'}).parentElement
                ?.className
        ).toBe('wrapper hasError')
    })
})
