import {cleanup, render, RenderResult} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import VerificationForm, {Props} from '../VerificationForm/VerificationForm'

const mockStore = configureMockStore<RootState, StoreDispatch>()
const store = mockStore({} as RootState)

const getFields = ({getByLabelText, queryByLabelText}: RenderResult) => ({
    emailAddress: getByLabelText(/email address/i),
    address: getByLabelText(/^address/i),
    city: getByLabelText(/city/i),
    country: getByLabelText(/country/i),
    state: queryByLabelText(/state/i),
    zip: getByLabelText(/zip code/i),
})

describe('VerificationForm', () => {
    const renderComponent = (props: Partial<Props> = {}) => {
        cleanup()

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

        const {emailAddress, address, city, country, zip} = getFields(container)

        it('should display submit button', () => {
            expect(
                container.getByRole('button', {
                    name: /submit/i,
                })
            ).toBeTruthy()
        })

        it('displays email field as disabled', () => {
            expect(emailAddress).toBeDisabled()
        })

        it.each([address, city, country, zip])(
            'displays other fields as enabled',
            (field) => {
                expect(field).toBeEnabled()
            }
        )
    })

    describe('Enabled form - additional fields', () => {
        const props = {
            initialValues: {
                email: 'email@email.com',
                address: 'Alajuela',
                city: 'San Francisco',
                country: 'United States',
                state: 'California',
                zip: '012345',
            },
        }

        it('displays state field when country is US', () => {
            const container = renderComponent(props)
            const {state} = getFields(container)

            expect(state).toBeVisible()
            expect(state).toBeEnabled()
        })

        it('does not display state field when country is not US', () => {
            const container = renderComponent({
                ...props,
                initialValues: {
                    ...props.initialValues,
                    country: 'Canada',
                    state: '',
                },
            })
            const {state} = getFields(container)

            expect(state).not.toBeInTheDocument()
        })
    })

    describe('Disabled form', () => {
        const props = {
            initialValues: {
                email: 'email@email.com',
                address: 'Alajuela',
                city: 'San Francisco',
                country: 'United States',
                state: 'California',
                zip: '012345',
            },
            isFormDisabled: true,
        }

        it('displays all fields as disabled and prefilled', () => {
            const container = renderComponent(props)
            const {emailAddress, address, city, country, state, zip} =
                getFields(container)

            expect(emailAddress).toBeDisabled()
            expect(address).toBeDisabled()
            expect(city).toBeDisabled()
            expect(country).toBeDisabled()
            expect(state).toBeDisabled()
            expect(zip).toBeDisabled()

            expect(
                container.getByDisplayValue(props.initialValues.email)
            ).toBeVisible()
            expect(
                container.getByDisplayValue(props.initialValues.address)
            ).toBeVisible()
            expect(
                container.getByDisplayValue(props.initialValues.city)
            ).toBeVisible()
            expect(
                container.getByText(props.initialValues.country)
            ).toBeVisible()
            expect(container.getByText(props.initialValues.state)).toBeVisible()
            expect(
                container.getByDisplayValue(props.initialValues.zip)
            ).toBeVisible()
        })

        it('does not display submit button', () => {
            const {queryByRole} = renderComponent(props)
            expect(
                queryByRole('button', {
                    name: /submit/i,
                })
            ).not.toBeInTheDocument()
        })
    })
})
