import React from 'react'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'
import {Device} from '@twilio/voice-sdk'

import {IntegrationType} from 'models/integration/types'
import {RootState, StoreDispatch} from 'state/types'
import {initialState} from 'state/twilio/reducers'
import {mockDevice} from 'tests/twilioMocks'
import {phoneNumbers as phoneNumberFixtures} from 'fixtures/phoneNumber'
import {ClickablePhoneNumber} from '../ClickablePhoneNumber'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const phoneNumbers = phoneNumberFixtures.reduce(
    (acc, number) => ({...acc, [number.id]: number}),
    {}
)

describe('<ClickablePhoneNumber/>', () => {
    function getPhoneIntegration(id: number) {
        return {
            id,
            type: IntegrationType.Phone,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '😀',
                twilio_phone_number_id: id,
            },
        }
    }

    it('should render href with prefix "tel:" because there is no phone integration', () => {
        const store = mockStore({
            twilio: initialState,
        })

        const {container} = render(
            <Provider store={store}>
                <ClickablePhoneNumber
                    id="phone-number-1"
                    customerName="Foo"
                    address="+33 6 11 22 33 44"
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [[getPhoneIntegration(1), getPhoneIntegration(2)]],
        [[getPhoneIntegration(1)]],
    ])(
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
                        customerName="Foo"
                        address="+33 6 11 22 33 44"
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [[getPhoneIntegration(1), getPhoneIntegration(2)]],
        [[getPhoneIntegration(1)]],
    ])(
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
                        customerName="Foo"
                        address="+33 66666666666666666666666666"
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [[getPhoneIntegration(1), getPhoneIntegration(2)]],
        [[getPhoneIntegration(1)]],
    ])(
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
                        customerName="Foo"
                        address="+33 6 11 22 33 44"
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
