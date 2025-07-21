import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { phoneNumbers } from 'fixtures/newPhoneNumber'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { RootState, StoreDispatch } from 'state/types'

import SmsIntegrationCreate from '../SmsIntegrationCreate'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

store.dispatch = jest.fn()
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))

describe('<SmsIntegrationCreate/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <Provider store={store}>
                    <SmsIntegrationCreate selectedPhoneNumberId={1} />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should submit a valid payload with the selected phone_number_id', () => {
            const { container, getByText, getByLabelText } = render(
                <Provider store={store}>
                    <SmsIntegrationCreate selectedPhoneNumberId={1} />
                </Provider>,
            )

            const payload = fromJS({
                type: 'sms',
                name: 'My SMS integration',
                meta: {
                    emoji: null,
                    phone_number_id: 1,
                },
            })

            fireEvent.change(getByLabelText('Integration title'), {
                target: { value: 'My SMS integration' },
            })

            fireEvent.click(getByText('Add SMS'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(payload)
            expect(store.dispatch).toHaveBeenCalledTimes(1)
            expect(container.firstChild).toMatchSnapshot()
        })

        it("should prefill the title field using the phone number's name", () => {
            const { container, getByText } = render(
                <Provider store={store}>
                    <SmsIntegrationCreate selectedPhoneNumberId={1} />
                </Provider>,
            )

            const payload = fromJS({
                type: 'sms',
                name: 'A Phone Number - SMS',
                meta: {
                    emoji: null,
                    phone_number_id: 1,
                },
            })

            fireEvent.click(getByText('Add SMS'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(payload)
            expect(store.dispatch).toHaveBeenCalledTimes(1)
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
