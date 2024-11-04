import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {FeatureFlagKey} from 'config/featureFlags'
import {phoneNumbers} from 'fixtures/phoneNumber'
import {SmsIntegration, IntegrationType} from 'models/integration/types'
import SmsIntegrationPreferences from 'pages/integrations/integration/components/sms/SmsIntegrationPreferences'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

const integration = {
    id: 1,
    type: IntegrationType.Sms,
    name: 'My new SMS Integration',
    meta: {
        emoji: '',
        phone_number_id: 1,
    },
} as SmsIntegration

store.dispatch = jest.fn()
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))

describe('<SmsIntegrationPreferences/>', () => {
    describe('render()', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AnalyticsSavedFilters]: false,
            })
        })

        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <SmsIntegrationPreferences integration={integration} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should submit a valid payload with the selected phone_number_id', () => {
            const {container, getByText, getByLabelText} = render(
                <Provider store={store}>
                    <SmsIntegrationPreferences integration={integration} />
                </Provider>
            )

            const payload = fromJS({
                id: 1,
                name: 'My updated SMS integration',
                meta: {
                    emoji: '',
                    phone_number_id: 1,
                },
            })

            fireEvent.change(getByLabelText('Integration title'), {
                target: {value: 'My updated SMS integration'},
            })

            fireEvent.click(getByText('Save changes'))

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(payload)
            expect(store.dispatch).toHaveBeenCalledTimes(1)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display delete warning message and it should not contain text about "saved filters"', () => {
            const {getByRole, getByText, queryByText} = render(
                <Provider store={store}>
                    <SmsIntegrationPreferences integration={integration} />
                </Provider>
            )

            fireEvent.click(
                getByRole('button', {
                    name: /Delete integration/i,
                })
            )

            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
            expect(
                queryByText(INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT)
            ).not.toBeInTheDocument()
        })

        it('should display delete warning message and it should contain text about "saved filters"', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsSavedFilters]: true,
            })

            const {getByRole, getByText} = render(
                <Provider store={store}>
                    <SmsIntegrationPreferences integration={integration} />
                </Provider>
            )

            fireEvent.click(
                getByRole('button', {
                    name: /Delete integration/i,
                })
            )

            expect(
                getByText(
                    `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
                )
            ).toBeInTheDocument()
        })
    })
})
