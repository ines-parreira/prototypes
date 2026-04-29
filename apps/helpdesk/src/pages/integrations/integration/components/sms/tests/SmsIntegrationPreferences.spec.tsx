import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { phoneNumbers } from 'fixtures/phoneNumber'
import type { SmsIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import SmsIntegrationPreferences from 'pages/integrations/integration/components/sms/SmsIntegrationPreferences'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import type { RootState } from 'state/types'

const storeState = {
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState
const integration = {
    id: 1,
    type: IntegrationType.Sms,
    name: 'My new SMS Integration',
    meta: {
        emoji: '',
        phone_number_id: 1,
    },
} as SmsIntegration

jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))
describe('<SmsIntegrationPreferences/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render', () => {
            render(<SmsIntegrationPreferences integration={integration} />, {
                storeState,
            })

            expect(screen.getByLabelText('Integration title')).toHaveValue(
                'My new SMS Integration',
            )
            expect(screen.getByText('Phone number')).toBeInTheDocument()
            expect(screen.getByText('A Phone Number')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'Manage Phone Number' }),
            ).toHaveAttribute('href', '/app/settings/phone-numbers/1')
            expect(
                screen.getByRole('button', { name: 'Save changes' }),
            ).toBeEnabled()
        })

        it('should submit a valid payload with the selected phone_number_id', async () => {
            const user = userEvent.setup()

            render(<SmsIntegrationPreferences integration={integration} />, {
                storeState,
            })

            const payload = fromJS({
                id: 1,
                name: 'My updated SMS integration',
                meta: {
                    emoji: '',
                    phone_number_id: 1,
                },
            })

            await user.clear(screen.getByLabelText('Integration title'))
            await user.type(
                screen.getByLabelText('Integration title'),
                'My updated SMS integration',
            )
            await user.click(
                screen.getByRole('button', { name: 'Save changes' }),
            )

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(payload)
        })

        it('should display delete warning message and it should contain text about "saved filters"', async () => {
            const user = userEvent.setup()

            render(<SmsIntegrationPreferences integration={integration} />, {
                storeState,
            })

            await user.click(
                screen.getByRole('button', {
                    name: /Delete integration/i,
                }),
            )

            expect(
                screen.getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
            ).toBeInTheDocument()
        })
    })
})
