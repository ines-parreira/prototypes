import React from 'react'
import configureMockStore from 'redux-mock-store'
import {render, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {Device} from '@twilio/voice-sdk'

import {IntegrationType} from 'models/integration/types'
import {RootState, StoreDispatch} from 'state/types'
import {initialState} from 'state/twilio/reducers'
import {mockDevice} from 'tests/twilioMocks'
import {phoneNumbers as phoneNumberFixtures} from 'fixtures/phoneNumber'
import history from 'pages/history'

import ClickablePhoneNumber from '../ClickablePhoneNumber'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const phoneNumbers = phoneNumberFixtures.reduce(
    (acc, number) => ({...acc, [number.id]: number}),
    {}
)

describe('<ClickablePhoneNumber/>', () => {
    function getIntegration(
        id: number,
        type:
            | IntegrationType.Phone
            | IntegrationType.Sms = IntegrationType.Phone
    ) {
        return {
            id,
            type,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '',
                twilio_phone_number_id: id,
            },
        }
    }

    it('should render href with prefix "tel:" because there is no phone integration', () => {
        const store = mockStore({
            twilio: initialState,
            integrations: fromJS({integrations: []}),
        })

        const {container} = render(
            <Provider store={store}>
                <ClickablePhoneNumber
                    id="phone-number-1"
                    customerId="1"
                    customerName="Foo"
                    address="+33 6 11 22 33 44"
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([[[getIntegration(1), getIntegration(2)]], [[getIntegration(1)]]])(
        'should render a dropdown listing the phone integrations, with disabled buttons because there is no device',
        (integrations) => {
            const store = mockStore({
                twilio: initialState,
                integrations: fromJS({
                    integrations,
                }),
                entities: {
                    phoneNumbers,
                },
            } as RootState)

            const {container} = render(
                <Provider store={store}>
                    <ClickablePhoneNumber
                        id="phone-number-1"
                        customerId="1"
                        customerName="Foo"
                        address="+33 6 11 22 33 44"
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([[[getIntegration(1), getIntegration(2)]], [[getIntegration(1)]]])(
        'should render a dropdown listing the phone integrations, with disabled buttons because the address is invalid',
        (integrations) => {
            const store = mockStore({
                twilio: initialState,
                integrations: fromJS({
                    integrations,
                }),
                entities: {
                    phoneNumbers,
                },
            } as RootState)

            const {container} = render(
                <Provider store={store}>
                    <ClickablePhoneNumber
                        id="phone-number-1"
                        customerId="1"
                        customerName="Foo"
                        address="+33 66666666666666666666666666"
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([[[getIntegration(1), getIntegration(2)]], [[getIntegration(1)]]])(
        'should render a dropdown listing the phone integrations',
        (integrations) => {
            const store = mockStore({
                twilio: {
                    ...initialState,
                    device: mockDevice() as Device,
                },
                integrations: fromJS({
                    integrations,
                }),
                entities: {
                    phoneNumbers,
                },
            } as RootState)

            const {container} = render(
                <Provider store={store}>
                    <ClickablePhoneNumber
                        id="phone-number-1"
                        customerId="1"
                        customerName="Foo"
                        address="+33 6 11 22 33 44"
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render a dropdown to choose between phone and SMS', () => {
        const push = jest.spyOn(history, 'push')
        const store = mockStore({
            twilio: {...initialState, device: mockDevice() as Device},
            integrations: fromJS({
                integrations: [
                    getIntegration(1, IntegrationType.Sms),
                    getIntegration(2, IntegrationType.Phone),
                ],
            }),
            entities: {
                phoneNumbers,
            },
        } as RootState)

        const {container, queryByText, getByText} = render(
            <Provider store={store}>
                <ClickablePhoneNumber
                    id="phone-number-1"
                    customerId="1"
                    customerName="Foo"
                    address="+33 6 11 22 33 44"
                />
            </Provider>
        )

        expect(queryByText('Make outbound call')).not.toBeNull()
        expect(queryByText('Send an SMS message')).not.toBeNull()

        fireEvent.click(getByText('Send an SMS message'))

        expect(queryByText('SMS with')).not.toBeNull()
        expect(
            queryByText('My Phone Integration 1 (+1 415 111 2222)')
        ).not.toBeNull()

        expect(container.firstChild).toMatchSnapshot()

        fireEvent.click(getByText('My Phone Integration 1 (+1 415 111 2222)'))

        expect(push).toHaveBeenCalledWith('/app/ticket/new?customer=1', {
            receiver: {address: '+33611223344', name: 'Foo'},
            sender: '+14151112222',
            source: 'sms',
        })
    })
})
