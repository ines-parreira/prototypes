import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import {OldPhoneNumber} from 'models/phoneNumber/types'
import {IntegrationType} from 'models/integration/types'
import {phoneNumbers} from 'fixtures/phoneNumber'

import PhoneNumberSelectField from '../PhoneNumberSelectField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneNumberSelectField/>', () => {
    const onCreate: jest.MockedFunction<(value: OldPhoneNumber) => void> =
        jest.fn()
    const onChange: jest.MockedFunction<(value: OldPhoneNumber) => void> =
        jest.fn()

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                    />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should open a modal form when selecting the create option', () => {
            const {baseElement} = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value="_new"
                        onChange={onChange}
                        onCreate={onCreate}
                    />
                </Provider>
            )
            expect(baseElement).toMatchSnapshot()
        })

        it('should hide phone numbers that have attached integrations', () => {
            const existingIntegration = {type: IntegrationType.Sms}
            const store = mockStore({
                entities: {
                    phoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({
                            ...acc,
                            [number.id]: {
                                ...number,
                                integrations:
                                    number.meta.friendly_name ===
                                    '+1 415 111 2222'
                                        ? []
                                        : [existingIntegration],
                            },
                        }),
                        {}
                    ),
                },
            } as RootState)

            const {container, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                        integrationType={IntegrationType.Sms}
                    />
                </Provider>
            )
            expect(queryByText(/\+1 415 111 2222/)).toBeTruthy()
            expect(queryByText(/\+1 415 111 2223/)).toBeFalsy()
            expect(container).toMatchSnapshot()
        })

        it("should hide phone numbers that have don't have the matching capability", () => {
            const store = mockStore({
                entities: {
                    phoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({
                            ...acc,
                            [number.id]: number,
                        }),
                        {}
                    ),
                },
            } as RootState)

            const {container, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                        integrationType={IntegrationType.Sms}
                    />
                </Provider>
            )
            expect(queryByText(/\+1 415 111 2222/)).toBeTruthy()
            expect(queryByText(/\+1 415 111 2223/)).toBeFalsy()
            expect(container).toMatchSnapshot()
        })
    })
})
