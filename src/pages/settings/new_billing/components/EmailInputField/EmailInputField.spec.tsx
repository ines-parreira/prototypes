import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'
import client from 'models/api/resources'
import {EmailInputField} from './EmailInputField'

const mockedServer = new MockAdapter(client)

mockedServer.onGet('/api/billing/contact/').reply(200, {
    email: 'an.email@goprgias.com',
})

describe('EmailInputField', () => {
    it('should render the email input with the current billing contact email information, changes the current value on user input, and validates the value', async () => {
        render(<EmailInputField />, {wrapper: mockQueryClientProvider()})

        await waitFor(() => {
            expect(
                screen.getByRole('textbox', {name: 'Email required'})
            ).toHaveValue('an.email@goprgias.com')
        })

        expect(screen.getByText('Email')).toBeVisible()
        expect(
            screen.getByText('Invoices are sent to this email address.')
        ).toBeVisible()

        fireEvent.change(
            screen.getByRole('textbox', {name: 'Email required'}),
            {
                target: {value: 'invalid-email'},
            }
        )

        await waitFor(() => {
            expect(screen.getByText('Email is invalid')).toBeVisible()
            expect(
                screen.getByRole('textbox', {name: 'Email required'})
            ).toHaveValue('invalid-email')
        })

        fireEvent.change(
            screen.getByRole('textbox', {name: 'Email required'}),
            {
                target: {value: 'a.valid.email@gmail.com'},
            }
        )

        await waitFor(() => {
            expect(
                screen.getByText('Invoices are sent to this email address.')
            ).toBeVisible()
            expect(
                screen.getByRole('textbox', {name: 'Email required'})
            ).toHaveValue('a.valid.email@gmail.com')
        })
    })
})
