import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { phoneNumbers } from 'fixtures/newPhoneNumber'
import { IntegrationType } from 'models/integration/types'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import type { RootState, StoreDispatch } from 'state/types'

import PhoneNumberSelectField from '../PhoneNumberSelectField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

describe('<PhoneNumberSelectField/>', () => {
    const onCreate: jest.MockedFunction<(value: NewPhoneNumber) => void> =
        jest.fn()
    const onChange: jest.MockedFunction<(value: NewPhoneNumber) => void> =
        jest.fn()

    describe('render()', () => {
        it('should render', () => {
            render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                    />
                </Provider>,
            )
            expect(screen.getByText('Select number')).toBeInTheDocument()
        })

        it('should open a modal form when selecting the create option', () => {
            render(
                <Provider store={store}>
                    <PhoneNumberSelectField value="_new" onChange={onChange} />
                </Provider>,
            )

            const modal = screen.getByRole('dialog')
            expect(modal).toHaveTextContent('Create phone number')
        })

        it('should hide phone numbers that have attached integrations', () => {
            const existingIntegration = { type: IntegrationType.Sms }
            const store = mockStore({
                entities: {
                    newPhoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({
                            ...acc,
                            [number.id]: {
                                ...number,
                                integrations:
                                    number.phone_number_friendly ===
                                    '+1 213 373 4253'
                                        ? []
                                        : [existingIntegration],
                            },
                        }),
                        {},
                    ),
                },
            } as RootState)

            const { queryByText } = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                        integrationType={IntegrationType.Sms}
                    />
                </Provider>,
            )
            expect(queryByText(/\+1 213 373 4253/)).toBeTruthy()
            expect(queryByText(/\+1 415 111 2223/)).toBeFalsy()
        })

        it("should hide phone numbers that have don't have the matching capability", () => {
            const store = mockStore({
                entities: {
                    newPhoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({
                            ...acc,
                            [number.id]: number,
                        }),
                        {},
                    ),
                },
            } as RootState)

            const { queryByText } = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                        integrationType={IntegrationType.Sms}
                    />
                </Provider>,
            )
            expect(queryByText(/\+1 213 373 4253/)).toBeTruthy()
            expect(queryByText(/\+1 415 111 2223/)).toBeFalsy()
        })

        it('should include initialValue even if it has an attached integration', () => {
            const phoneNumberWithIntegration = phoneNumbers[0]
            const store = mockStore({
                entities: {
                    newPhoneNumbers: phoneNumbers
                        .filter(
                            (number) =>
                                number.id !== phoneNumberWithIntegration.id,
                        )
                        .reduce(
                            (acc, number) => ({
                                ...acc,
                                [number.id]: number,
                            }),
                            {},
                        ),
                },
            } as RootState)

            const { queryByText } = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumberWithIntegration}
                        onChange={onChange}
                        onCreate={onCreate}
                        integrationType={IntegrationType.Sms}
                        initialValue={phoneNumberWithIntegration}
                    />
                </Provider>,
            )
            expect(queryByText(/\+1 213 373 4253/)).toBeTruthy()
        })
    })
})
