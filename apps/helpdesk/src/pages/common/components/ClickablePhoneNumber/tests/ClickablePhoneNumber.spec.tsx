import React from 'react'

import { history } from '@repo/routing'
import { assumeMock, userEvent } from '@repo/testing'
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { phoneNumbers as phoneNumberFixtures } from 'fixtures/newPhoneNumber'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import { IntegrationType } from 'models/integration/types'
import { VoiceDeviceContextState } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import { initialState } from 'state/twilio/voiceDevice'
import { RootState, StoreDispatch } from 'state/types'
import { mockDevice } from 'tests/twilioMocks'

import ClickablePhoneNumber from '../ClickablePhoneNumber'

jest.mock('hooks/integrations/phone/useVoiceDevice')

const useVoiceDeviceMock = assumeMock(useVoiceDevice)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const newPhoneNumbers = phoneNumberFixtures.reduce(
    (acc, number) => ({ ...acc, [number.id]: number }),
    {},
)

describe('<ClickablePhoneNumber/>', () => {
    function getIntegration(
        id: number,
        type:
            | IntegrationType.Phone
            | IntegrationType.Sms = IntegrationType.Phone,
    ) {
        return {
            id,
            type,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '',
                phone_number_id: id,
            },
        }
    }

    afterEach(cleanup)

    it('should render href with prefix "tel:" because there is no phone integration', () => {
        const store = mockStore({
            integrations: fromJS({ integrations: [] }),
        })
        useVoiceDeviceMock.mockReturnValue(
            initialState as VoiceDeviceContextState,
        )

        render(
            <Provider store={store}>
                <ClickablePhoneNumber
                    id="phone-number-1"
                    customerId="1"
                    customerName="Foo"
                    address="+33 6 11 22 33 44"
                />
            </Provider>,
        )

        expect(screen.getByText('+33 6 11 22 33 44')).toHaveAttribute(
            'href',
            'tel:+33611223344',
        )
    })

    it.each([[[getIntegration(1), getIntegration(2)]], [[getIntegration(1)]]])(
        'should render a dropdown listing the phone integrations, with disabled buttons because there is no device',
        (integrations) => {
            const store = mockStore({
                integrations: fromJS({
                    integrations,
                }),
                entities: {
                    newPhoneNumbers,
                },
            } as RootState)
            useVoiceDeviceMock.mockReturnValue(
                initialState as VoiceDeviceContextState,
            )

            const { container } = render(
                <Provider store={store}>
                    <ClickablePhoneNumber
                        id="phone-number-1"
                        customerId="1"
                        customerName="Foo"
                        address="+33 6 11 22 33 44"
                    />
                </Provider>,
            )

            const options = container.querySelectorAll('.dropdown-item')
            expect(options).toHaveLength(integrations.length)
            options.forEach((option) => {
                expect(option).toHaveClass('disabled')
            })
        },
    )

    it.each([[[getIntegration(1), getIntegration(2)]], [[getIntegration(1)]]])(
        'should render a dropdown listing the phone integrations, with disabled buttons because the address is invalid',
        (integrations) => {
            const store = mockStore({
                integrations: fromJS({
                    integrations,
                }),
                entities: {
                    newPhoneNumbers,
                },
            } as RootState)
            useVoiceDeviceMock.mockReturnValue(
                initialState as VoiceDeviceContextState,
            )

            const { container } = render(
                <Provider store={store}>
                    <ClickablePhoneNumber
                        id="phone-number-1"
                        customerId="1"
                        customerName="Foo"
                        address="+33 66666666666666666666666666"
                    />
                </Provider>,
            )

            const options = container.querySelectorAll('.dropdown-item')
            expect(options).toHaveLength(integrations.length)
            options.forEach((option) => {
                expect(option).toHaveClass('disabled')
            })
        },
    )

    it.each([[[getIntegration(1), getIntegration(2)]], [[getIntegration(1)]]])(
        'should render a dropdown listing the phone integrations',
        async (integrations) => {
            const store = mockStore({
                integrations: fromJS({
                    integrations,
                }),
                entities: {
                    newPhoneNumbers,
                },
            } as RootState)
            useVoiceDeviceMock.mockReturnValue({
                ...initialState,
                device: mockDevice as any,
            } as VoiceDeviceContextState)

            render(
                <Provider store={store}>
                    <ClickablePhoneNumber
                        id="phone-number-1"
                        customerId="1"
                        customerName="Foo"
                        address="+33 6 11 22 33 44"
                    />
                </Provider>,
            )

            userEvent.hover(screen.getByText('+33 6 11 22 33 44'))
            await waitFor(() => {
                expect(screen.queryByText('Make outbound call')).not.toBeNull()
            })

            integrations.forEach((integration) => {
                const option = screen.getByText(
                    new RegExp(`${integration.name}`, 'i'),
                )
                expect(option).not.toHaveAttribute('disabled')
            })
        },
    )

    it('should render a dropdown listing SMS integrations', async () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    getIntegration(1, IntegrationType.Sms),
                    getIntegration(2, IntegrationType.Sms),
                ],
            }),
            entities: {
                newPhoneNumbers,
            },
        } as RootState)
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            device: mockDevice as any,
        } as VoiceDeviceContextState)

        const { container } = render(
            <Provider store={store}>
                <ClickablePhoneNumber
                    id="phone-number-1"
                    customerId="1"
                    customerName="Foo"
                    address="+33 6 11 22 33 44"
                />
            </Provider>,
        )

        userEvent.hover(screen.getByText('+33 6 11 22 33 44'))
        await waitFor(() => {
            expect(screen.queryByText('Send SMS')).not.toBeNull()
        })

        const options = container.querySelectorAll('.dropdown-item')
        expect(options).toHaveLength(2)
    })

    it('should render a dropdown to choose between phone and SMS', async () => {
        const push = jest.spyOn(history, 'push')
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    getIntegration(1, IntegrationType.Sms),
                    getIntegration(2, IntegrationType.Phone),
                ],
            }),
            entities: {
                newPhoneNumbers,
            },
        } as RootState)
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            device: mockDevice as any,
        } as VoiceDeviceContextState)

        const { queryByText, getByText } = render(
            <Provider store={store}>
                <ClickablePhoneNumber
                    id="phone-number-1"
                    customerId="1"
                    customerName="Foo"
                    address="+33 6 11 22 33 44"
                />
            </Provider>,
        )

        expect(queryByText('Make outbound call')).not.toBeNull()
        expect(queryByText('Send SMS')).not.toBeNull()

        fireEvent.click(getByText('Send SMS'))

        expect(queryByText('SMS with')).not.toBeNull()
        expect(
            queryByText('My Phone Integration 1 (+1 213 373 4253)'),
        ).not.toBeNull()

        userEvent.hover(getByText('+33 6 11 22 33 44'))
        await waitFor(() => {
            expect(queryByText('Make outbound call or send SMS')).not.toBeNull()
        })

        fireEvent.click(getByText('My Phone Integration 1 (+1 213 373 4253)'))

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/app/ticket/new?customer=1', {
                receiver: { address: '+33611223344', name: 'Foo' },
                sender: '+12133734253',
                source: 'sms',
            })
        })
    })
})
