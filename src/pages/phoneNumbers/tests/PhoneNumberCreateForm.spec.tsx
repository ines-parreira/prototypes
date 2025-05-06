import React from 'react'

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { resetLDMocks } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { capabilities, phoneNumbers } from 'fixtures/phoneNumber'
import { fetchPhoneCapabilities } from 'models/phoneNumber/resources'
import * as apiCalls from 'models/phoneNumber/resources'
import * as notificationActions from 'state/notifications/actions'
import { AlertNotification } from 'state/notifications/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import PhoneNumberCreateForm from '../PhoneNumberCreateForm'
import * as phoneNumberUtils from '../utils'

const QueryClientProvider = mockQueryClientProvider().QueryClientProvider
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

jest.mock('models/phoneNumber/resources')
const createPhoneNumberSpy = jest.spyOn(apiCalls, 'createPhoneNumber')

const notify = jest.spyOn(notificationActions, 'notify')

const getAddressValidationAlertMessageSpy = jest.spyOn(
    phoneNumberUtils,
    'getAddressValidationAlertMessage',
)

describe('<PhoneNumberCreateForm/>', () => {
    const renderComponent = () =>
        render(
            <Provider store={store}>
                <QueryClientProvider>
                    <PhoneNumberCreateForm />
                </QueryClientProvider>
            </Provider>,
        )

    beforeEach(() => {
        jest.resetAllMocks()
        assumeMock(fetchPhoneCapabilities).mockResolvedValue(capabilities)
        resetLDMocks()
    })

    afterEach(cleanup)

    it('should render Alert message when there is one', () => {
        getAddressValidationAlertMessageSpy.mockReturnValue(
            'test message' as any,
        )

        renderComponent()
        expect(screen.getByText('test message')).toBeVisible()
        expect(
            screen.getByRole('button', { name: /Add phone number/ }),
        ).toBeAriaDisabled()
    })

    it('should not render Alert message when there is none', () => {
        getAddressValidationAlertMessageSpy.mockReturnValue(null as any)

        renderComponent()
        expect(screen.queryByText('test message')).toBeNull()
        expect(
            screen.getByRole('button', { name: /Add phone number/ }),
        ).not.toBeAriaDisabled()
    })

    describe('render()', () => {
        it('should render when a country and a state are selected', () => {
            const { container, getByText } = renderComponent()

            fireEvent.click(getByText('United States'))
            fireEvent.click(getByText('Local'))
            fireEvent.click(getByText('Alabama'))

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when type "Toll-free" is selected', () => {
            const { container, getByText } = renderComponent()

            fireEvent.click(getByText('Canada'))
            fireEvent.click(getByText('Toll-free'))

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render address validation form for Australia', () => {
            const { getByText, queryByText } = renderComponent()

            fireEvent.click(getByText('United States'))
            expect(queryByText('Address verification')).toBe(null)

            fireEvent.click(getByText('Canada'))
            expect(queryByText('Address verification')).toBe(null)

            fireEvent.click(getByText('United Kingdom'))
            expect(queryByText('Address verification')).toBe(null)

            fireEvent.click(getByText('Australia'))
            expect(queryByText('Address verification')).not.toBe(null)
        })

        it('should pass the address if a phone of a country with address verification is created', async () => {
            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                fireEvent.change(
                    getByRole('textbox', {
                        name: /title required/i,
                    }),
                    { target: { value: 'test title' } },
                )

                fireEvent.click(getByText('Australia'))

                await findByText('Address verification')

                fireEvent.click(getByText('Adelaide (87)'))

                fireEvent.click(getByText('Business information'))
                fireEvent.change(
                    getByRole('textbox', { name: /business name required/i }),
                    {
                        target: { value: 'test business name' },
                    },
                )
                fireEvent.change(
                    getByRole('textbox', { name: /address required/i }),
                    {
                        target: { value: 'test address' },
                    },
                )
                fireEvent.change(
                    getByRole('textbox', { name: /city required/i }),
                    {
                        target: { value: 'test city' },
                    },
                )
                fireEvent.change(
                    getByRole('textbox', {
                        name: /state\/province\/region required/i,
                    }),
                    {
                        target: { value: 'test region' },
                    },
                )
                fireEvent.change(
                    getByRole('textbox', { name: /postal code required/i }),
                    {
                        target: { value: 'test postal code' },
                    },
                )

                fireEvent.click(getByText('Add phone number'))
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]

            expect(latestCallArguments?.address).toStrictEqual({
                country: 'AU',
                type: 'company',
                business_name: 'test business name',
                address: 'test address',
                city: 'test city',
                region: 'test region',
                postal_code: 'test postal code',
            })
        })

        it('should call createPhoneNumber with the correct payload after switching from country with address verification', async () => {
            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                fireEvent.change(
                    getByRole('textbox', {
                        name: /title required/i,
                    }),
                    { target: { value: 'test title' } },
                )

                // change to AU, a country with address verification, and fill one of the address fields
                fireEvent.click(getByText('Australia'))

                await findByText('Address verification')

                fireEvent.change(
                    getByRole('textbox', { name: /business name required/i }),
                    {
                        target: { value: 'test business name' },
                    },
                )

                // switch back to US, a country with no address verification, and create a phone number
                fireEvent.click(getByText('United States'))
                fireEvent.click(getByText('Alabama'))
                fireEvent.click(getByText('Mobile (251)'))

                fireEvent.click(getByText('Add phone number'))
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]

            expect(latestCallArguments?.address).toStrictEqual({
                country: 'US',
                type: 'company',
            })
        })

        it('should render custom error', async () => {
            createPhoneNumberSpy.mockImplementation(() =>
                Promise.reject({
                    response: {
                        data: {
                            error: {
                                msg: 'Failed',
                                data: { use_custom: 'UPGRADE_MESSAGE' },
                            },
                        },
                    },
                }),
            )

            const { getByText, getByRole, findByText } = renderComponent()

            await act(async () => {
                fireEvent.change(
                    getByRole('textbox', {
                        name: /title required/i,
                    }),
                    { target: { value: 'test title' } },
                )

                fireEvent.click(getByText('United States'))
                await findByText('Alabama')
                fireEvent.click(getByText('Alabama'))
                fireEvent.click(getByText('Birmingham (205)'))
                fireEvent.click(getByText('Add phone number'))
            })
            expect(createPhoneNumberSpy).toHaveBeenCalled()

            const notificationSent = notify.mock
                .lastCall?.[0] as AlertNotification
            expect(notificationSent?.title).toEqual('Cannot add phone number.')
            expect(notificationSent?.allowHTML).toBe(true)
        })
    })
})
