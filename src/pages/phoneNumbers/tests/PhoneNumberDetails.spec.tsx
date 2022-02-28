import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {phoneNumbers} from 'fixtures/phoneNumber'
import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/types'
import {PhoneNumber} from 'models/phoneNumber/types'

import PhoneNumberDetails from '../PhoneNumberDetails'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneNumberDetails/>', () => {
    describe('render()', () => {
        it('should render with a local US number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should render with a toll-free CA number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should render with a mobile GB number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[2]} />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should render the link to an SMS integration for preview accounts', () => {
            const store = mockStore({
                currentAccount: fromJS({
                    domain: 'acme',
                }),
                entities: {
                    phoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({...acc, [number.id]: number}),
                        {}
                    ),
                },
            } as RootState)

            const {container, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>
            )
            expect(queryByText('SMS')).toBeTruthy()
            expect(container).toMatchSnapshot()
        })

        it('should not render the link to an SMS integration for non-preview accounts', () => {
            const store = mockStore({
                currentAccount: fromJS({
                    domain: 'some-helpdesk',
                }),
                entities: {
                    phoneNumbers: phoneNumbers.reduce(
                        (acc, number) => ({...acc, [number.id]: number}),
                        {}
                    ),
                },
            } as RootState)

            const {container, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>
            )
            expect(queryByText('SMS')).toBeFalsy()
            expect(container).toMatchSnapshot()
        })

        it('should render a "Manage Integration" link if existing attached integration', () => {
            const phoneNumber: PhoneNumber = {
                ...phoneNumbers[1],
                integrations: [
                    {
                        id: 1,
                        type: IntegrationType.Phone,
                        name: 'Some Phone Integration',
                    },
                ],
            }
            const store = mockStore({
                entities: {
                    phoneNumbers: {
                        1: phoneNumber,
                    },
                },
            } as unknown as RootState)

            const {container, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>
            )
            expect(queryByText('Manage Integration')).toBeTruthy()
            expect(queryByText('Add Integration')).toBeFalsy()
            expect(container).toMatchSnapshot()
        })

        it('should render a "Add Integration" link if no existing attached integration', () => {
            const phoneNumber: PhoneNumber = {
                ...phoneNumbers[1],
                integrations: [],
            }
            const store = mockStore({
                entities: {
                    phoneNumbers: {
                        1: phoneNumber,
                    },
                },
            } as unknown as RootState)

            const {container, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                </Provider>
            )
            expect(queryByText('Manage Integration')).toBeFalsy()
            expect(queryByText('Add Integration')).toBeTruthy()
            expect(container).toMatchSnapshot()
        })
    })
})
