import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import createMockStore from 'redux-mock-store'
import {InitialRootState} from 'types'
import {EmailInputField} from './EmailInputField'

describe('EmailInputField', () => {
    it('should render the email input with the current billing contact email information, changes the current value on user input, and validates the value', async () => {
        const mockInitialEmail = 'an.email@goprgias.com'

        const mockStoreState: Partial<InitialRootState> = {
            billing: fromJS({
                contact: {
                    email: 'an.email@goprgias.com',
                },
            }),
        }

        const store = createMockStore()(mockStoreState)

        render(
            <Provider store={store}>
                <EmailInputField />
            </Provider>
        )

        expect(screen.getByText('Email')).toBeVisible()
        expect(
            screen.getByRole('textbox', {name: 'Email required'})
        ).toHaveValue(mockInitialEmail)
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
