import type { ComponentProps } from 'react'
import React from 'react'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { capabilities as capabilitiesFixtures } from 'fixtures/phoneNumber'
import * as apiCalls from 'models/phoneNumber/resources'
import type { PhoneNumber } from 'models/phoneNumber/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

import PhoneNumberCreateModalForm from '../PhoneNumberCreateModalForm'
import * as phoneNumberUtils from '../utils'

const QueryClientProvider = mockQueryClientProvider().QueryClientProvider
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({})

jest.spyOn(apiCalls, 'fetchPhoneCapabilities').mockReturnValue(
    new Promise((resolve) => resolve(capabilitiesFixtures)),
)

const getAddressValidationAlertMessageSpy = jest.spyOn(
    phoneNumberUtils,
    'getAddressValidationAlertMessage',
)

describe('<PhoneNumberCreateModalForm/>', () => {
    const onCreate: jest.MockedFunction<(value: PhoneNumber) => void> =
        jest.fn()
    const onClose: jest.MockedFunction<() => void> = jest.fn()

    const renderComponent = (
        props: Partial<ComponentProps<typeof PhoneNumberCreateModalForm>> = {},
    ) =>
        render(
            <Provider store={store}>
                <QueryClientProvider>
                    <PhoneNumberCreateModalForm
                        onCreate={onCreate}
                        onClose={onClose}
                        isOpen={true}
                        {...props}
                    />
                </QueryClientProvider>
            </Provider>,
        )

    afterEach(cleanup)

    it('should render Alert message when there is one', () => {
        getAddressValidationAlertMessageSpy.mockReturnValue(
            'test message' as any,
        )

        renderComponent()
        expect(screen.getByText('test message')).toBeVisible()
        expect(
            screen.getByRole('button', { name: /Create phone number/ }),
        ).toBeAriaDisabled()
    })

    it('should not render Alert message when there is none', () => {
        getAddressValidationAlertMessageSpy.mockReturnValue(null as any)

        renderComponent()
        expect(screen.queryByText('test message')).toBeNull()
        expect(
            screen.getByRole('button', { name: /Create phone number/ }),
        ).not.toBeAriaDisabled()
    })

    describe('render()', () => {
        it('should not render when isOpen is false', () => {
            renderComponent({ isOpen: false })

            expect(screen.queryByText('Create Phone Number')).toBeNull()
        })

        it('should render when isOpen is true', () => {
            renderComponent()

            expect(screen.getByText('Create Phone Number')).toBeVisible()
        })

        it('should render no steps when no address validation is required', () => {
            const { getByText, queryByText } = renderComponent()

            fireEvent.click(getByText('United States'))
            expect(queryByText('Create Phone Number')).not.toBe(null)
            expect(queryByText('Next')).toBe(null)
        })

        it('should render a second with for address validation for certain countries', () => {
            const { getByText, queryByText } = renderComponent()

            fireEvent.click(getByText('Australia'))

            expect(queryByText('Step 1 of 2 - Phone Information')).not.toBe(
                null,
            )
            expect(queryByText('Step 2 of 2 - Address Verification')).toBe(null)

            expect(queryByText('Phone number name')).not.toBe(null)
            expect(queryByText('Country')).not.toBe(null)
            expect(queryByText('Area code')).not.toBe(null)

            fireEvent.click(getByText('Next'))

            expect(queryByText('Step 1 of 2 - Phone Information')).toBe(null)
            expect(queryByText('Step 2 of 2 - Address Verification')).not.toBe(
                null,
            )

            expect(queryByText('Business name')).not.toBe(null)
            expect(queryByText('Address')).not.toBe(null)
            expect(queryByText('City')).not.toBe(null)
            expect(queryByText('State/Province/Region')).not.toBe(null)
            expect(queryByText('Postal Code')).not.toBe(null)
            expect(queryByText('Country')).not.toBe(null)

            fireEvent.click(getByText('Back'))

            expect(queryByText('Step 1 of 2 - Phone Information')).not.toBe(
                null,
            )
            expect(queryByText('Step 2 of 2 - Address Verification')).toBe(null)

            expect(queryByText('Phone number name')).not.toBe(null)
            expect(queryByText('Country')).not.toBe(null)
            expect(queryByText('Area code')).not.toBe(null)
        })
    })
})
