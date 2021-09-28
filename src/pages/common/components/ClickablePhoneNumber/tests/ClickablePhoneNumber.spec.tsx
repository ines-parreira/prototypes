import React from 'react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'
import {Device} from 'twilio-client'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState} from '../../../../../state/twilio/reducers'
import {ClickablePhoneNumber} from '../ClickablePhoneNumber'
import {IntegrationType} from '../../../../../models/integration/types'
import {mockDevice} from '../../../../../tests/twilioMocks'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ClickablePhoneNumber/>', () => {
    let store: MockStoreEnhanced

    function getPhoneIntegration(id: number, phoneNumber: string) {
        return {
            id,
            type: IntegrationType.PhoneIntegrationType,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '😀',
                twilio: {
                    incoming_phone_number: {
                        phone_number: phoneNumber,
                    },
                },
            },
        }
    }

    it('should render href with prefix "tel:" because there is no phone integration', () => {
        store = mockStore({
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
        [
            [
                getPhoneIntegration(1, '+14151112222'),
                getPhoneIntegration(2, '+14153334444'),
            ],
        ],
        [[getPhoneIntegration(1, '+14151112222')]],
    ])(
        'should render a dropdown listing the phone integrations, with disabled buttons because there is no device',
        (integrations) => {
            store = mockStore({
                twilio: initialState,
                integrations: fromJS({
                    integrations,
                }),
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
        }
    )

    it.each([
        [
            [
                getPhoneIntegration(1, '+14151112222'),
                getPhoneIntegration(2, '+14153334444'),
            ],
        ],
        [[getPhoneIntegration(1, '+14151112222')]],
    ])(
        'should render a dropdown listing the phone integrations, with disabled buttons because the address is invalid',
        (integrations) => {
            store = mockStore({
                twilio: initialState,
                integrations: fromJS({
                    integrations,
                }),
            })

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
        [
            [
                getPhoneIntegration(1, '+14151112222'),
                getPhoneIntegration(2, '+14153334444'),
            ],
        ],
        [[getPhoneIntegration(1, '+14151112222')]],
    ])(
        'should render a dropdown listing the phone integrations',
        (integrations) => {
            store = mockStore({
                twilio: {
                    ...initialState,
                    device: mockDevice() as Device,
                },
                integrations: fromJS({
                    integrations,
                }),
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
        }
    )
})
