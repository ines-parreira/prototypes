import {render, RenderResult} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import VerificationForm, {Props} from '../VerificationForm/VerificationForm'

const mockStore = configureMockStore<RootState, StoreDispatch>()
const store = mockStore({} as RootState)

const getFields = ({getByLabelText}: RenderResult) => ({
    emailAddress: getByLabelText(/email address/i),
    address: getByLabelText(/^address/i),
    city: getByLabelText(/city/i),
    country: getByLabelText(/country/i),
})

describe('VerificationForm', () => {
    const renderComponent = (props: Partial<Props> = {}) => {
        return render(
            <Provider store={store}>
                <VerificationForm
                    initialValues={{
                        email: 'email@email.com',
                    }}
                    {...props}
                />
            </Provider>
        )
    }

    describe('Enabled form - visible fields', () => {
        const container = renderComponent()

        const {emailAddress, address, city, country} = getFields(container)

        it('should display submit button', () => {
            expect(
                container.getByRole('button', {
                    name: /submit/i,
                })
            ).toBeTruthy()
        })

        it('displays email field as disabled', () => {
            expect(emailAddress.hasAttribute('disabled')).toBeTruthy()
        })

        it.each([address, city, country])(
            'displays other fields as enabled',
            (field) => {
                expect(field.hasAttribute('disabled')).toBeFalsy()
            }
        )
    })

    describe('Disabled form', () => {
        const props = {
            initialValues: {
                email: 'email@email.com',
                address: 'Alajuela',
                city: 'Uruca',
                country: 'Costa Rica',
            },
            isFormDisabled: true,
        }

        it('displays all fields as disabled', () => {
            const container = renderComponent(props)
            const {emailAddress, address, city, country} = getFields(container)

            expect(emailAddress.hasAttribute('disabled')).toBeTruthy()
            expect(address.hasAttribute('disabled')).toBeTruthy()
            expect(city.hasAttribute('disabled')).toBeTruthy()
            expect(country.hasAttribute('disabled')).toBeTruthy()

            expect(
                container.getByDisplayValue(props.initialValues.email)
            ).toBeTruthy()
            expect(
                container.getByDisplayValue(props.initialValues.address)
            ).toBeTruthy()
            expect(
                container.getByDisplayValue(props.initialValues.city)
            ).toBeTruthy()
            expect(
                container.getByText(props.initialValues.country)
            ).toBeTruthy()
        })

        it('does not display submit button', () => {
            const {queryByRole} = renderComponent(props)
            expect(
                queryByRole('button', {
                    name: /submit/i,
                })
            ).toBeFalsy()
        })
    })
})
