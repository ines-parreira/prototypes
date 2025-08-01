import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { PhoneCountry, PhoneFunction } from 'business/twilio'
import { phoneNumbers } from 'fixtures/phoneNumber'
import {
    IntegrationType,
    PhoneIntegration,
    PhoneRingingBehaviour,
    VoiceMessageType,
} from 'models/integration/types'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import PhoneIntegrationBreadcrumbs from '../PhoneIntegrationBreadcrumbs'
import VoiceQueueBreadcrumbs from '../VoiceQueueBreadcrumbs'

jest.mock('../VoiceQueueBreadcrumbs')
const VoiceQueueBreadcrumbsMock = assumeMock(VoiceQueueBreadcrumbs)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({ ...acc, [number.id]: number }),
            {},
        ),
    },
} as RootState)

describe('<PhoneIntegrationBreadcrumbs/>', () => {
    const integration: PhoneIntegration = {
        id: 1,
        name: 'My Phone Integration',
        decoration: null,
        description: '',
        mappings: null,
        uri: '',
        created_datetime: '1970-01-01T18:00:00',
        updated_datetime: '1970-01-01T18:00:00',
        deactivated_datetime: null,
        deleted_datetime: null,
        locked_datetime: null,
        user: {
            id: 1,
        },
        type: IntegrationType.Phone,
        meta: {
            type: '',
            emoji: '☎️',
            area_code: '880',
            function: PhoneFunction.Standard,
            country: PhoneCountry.US,
            phone_number_id: 1,
            preferences: {
                record_inbound_calls: false,
                record_outbound_calls: false,
                voicemail_outside_business_hours: false,
                ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
            },
            greeting_message: {
                voice_message_type: VoiceMessageType.None,
            },
            voicemail: {
                voice_message_type: VoiceMessageType.None,
                allow_to_leave_voicemail: true,
            },
        },
        managed: false,
    }

    beforeEach(() => {
        VoiceQueueBreadcrumbsMock.mockReturnValue(
            <div>VoiceQueueBreadcrumbsMock</div>,
        )
    })

    describe('render()', () => {
        it('should render for voice integrations', () => {
            renderWithRouter(
                <Provider store={store}>
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Phone}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(screen.getByText('Voice')).toBeInTheDocument()
        })

        it('should render for SMS integrations', () => {
            renderWithRouter(
                <Provider store={store}>
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Sms}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        it.each([
            {
                queueId: 'new',
            },
            {
                queueId: '123',
            },
        ])('should render for Voice Queues', ({ queueId }) => {
            renderWithRouter(
                <Provider store={store}>
                    <PhoneIntegrationBreadcrumbs type={IntegrationType.Phone} />
                </Provider>,
                {
                    route: `/app/settings/channels/phone/queues/${queueId}`,
                },
            )

            expect(
                screen.getByText('VoiceQueueBreadcrumbsMock'),
            ).toBeInTheDocument()
            expect(VoiceQueueBreadcrumbsMock).toHaveBeenCalledWith(
                {
                    queueId,
                },
                {},
            )
        })
    })
})
