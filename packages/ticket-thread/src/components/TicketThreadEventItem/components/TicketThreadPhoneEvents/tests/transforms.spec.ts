import parsePhoneNumberFromString from 'libphonenumber-js'

import {
    getPhoneEventCustomerName,
    getPhoneEventDetailsEntries,
    getPhoneEventIconName,
    getPhoneEventLabel,
    getPhoneEventTicketId,
    hasPhoneEventDetails,
    resolvePhoneEventAgentName,
} from '../transforms'
import type { PhoneEventData, PhoneEventType } from '../transforms/types'

function createPhoneEvent(
    overrides: Partial<PhoneEventData> = {},
): PhoneEventData {
    const baseEvent: PhoneEventData = {
        object_type: 'Ticket',
        type: 'phone-call-conversation-started',
        data: {},
    }

    return {
        ...baseEvent,
        ...overrides,
        data: {
            ...baseEvent.data,
            ...(overrides.data ?? {}),
        },
    }
}

describe('phone event transforms', () => {
    describe('getPhoneEventLabel', () => {
        it.each<[PhoneEventType, string]>([
            ['phone-call-conversation-started', 'Phone conversation started'],
            [
                'phone-call-forwarded-to-external-number',
                'Call forwarded to an external number',
            ],
            [
                'phone-call-forwarded-to-gorgias-number',
                'Call forwarded to a Gorgias number',
            ],
            ['phone-call-forwarded', 'Call forwarded'],
            ['message-played', 'Message played'],
        ])('maps %s to its label', (type, expectedLabel) => {
            expect(
                getPhoneEventLabel({
                    type,
                    agentName: null,
                    customerName: null,
                }),
            ).toBe(expectedLabel)
        })

        it('appends "by {agent}" for conversation-started when customer and agent are available', () => {
            expect(
                getPhoneEventLabel({
                    type: 'phone-call-conversation-started',
                    agentName: 'Alex Agent',
                    customerName: 'Customer Name',
                }),
            ).toBe('Phone conversation started by Alex Agent')
        })

        it('does not append attribution when customer or agent is missing', () => {
            expect(
                getPhoneEventLabel({
                    type: 'phone-call-conversation-started',
                    agentName: 'Alex Agent',
                    customerName: null,
                }),
            ).toBe('Phone conversation started')
            expect(
                getPhoneEventLabel({
                    type: 'phone-call-conversation-started',
                    agentName: null,
                    customerName: 'Customer Name',
                }),
            ).toBe('Phone conversation started')
        })
    })

    describe('resolvePhoneEventAgentName', () => {
        it('prefers matched agent name from user id', () => {
            expect(
                resolvePhoneEventAgentName({
                    userId: 42,
                    payloadUserName: 'Payload Name',
                    agents: [{ id: 42, name: 'Alex Agent' }],
                }),
            ).toBe('Alex Agent')
        })

        it('falls back to payload user name when user id lookup misses', () => {
            expect(
                resolvePhoneEventAgentName({
                    userId: 99,
                    payloadUserName: 'Payload Name',
                    agents: [{ id: 42, name: 'Alex Agent' }],
                }),
            ).toBe('Payload Name')
        })

        it('returns null when neither lookup nor payload name is available', () => {
            expect(
                resolvePhoneEventAgentName({
                    userId: null,
                    payloadUserName: '',
                    agents: [],
                }),
            ).toBeNull()
        })
    })

    describe('getPhoneEventIconName', () => {
        it.each<[PhoneEventType, string]>([
            ['phone-call-conversation-started', 'comm-phone-incoming'],
            ['phone-call-forwarded-to-external-number', 'arrow-routing'],
            ['phone-call-forwarded-to-gorgias-number', 'arrow-routing'],
            ['phone-call-forwarded', 'arrow-routing'],
            ['message-played', 'comm-ivr'],
        ])('maps %s to %s', (type, expectedIconName) => {
            expect(getPhoneEventIconName(type)).toBe(expectedIconName)
        })
    })

    describe('event metadata helpers', () => {
        it('extracts phone ticket id and customer name when available', () => {
            const event = createPhoneEvent({
                data: {
                    phone_ticket_id: 1234,
                    customer: {
                        name: 'Customer Name',
                    },
                },
            })

            expect(getPhoneEventTicketId(event)).toBe('1234')
            expect(getPhoneEventCustomerName(event)).toBe('Customer Name')
        })

        it('returns null values when ticket id or customer name are missing', () => {
            const event = createPhoneEvent()

            expect(getPhoneEventTicketId(event)).toBeNull()
            expect(getPhoneEventCustomerName(event)).toBeNull()
        })

        it.each<[PhoneEventType, boolean]>([
            ['phone-call-conversation-started', false],
            ['phone-call-forwarded-to-external-number', true],
            ['phone-call-forwarded-to-gorgias-number', true],
            ['phone-call-forwarded', false],
            ['message-played', true],
        ])(
            'detects details availability for %s',
            (type, expectedHasDetails) => {
                expect(hasPhoneEventDetails(type)).toBe(expectedHasDetails)
            },
        )
    })

    describe('getPhoneEventDetailsEntries', () => {
        it('builds formatted forwarded-number details for external forwarding', () => {
            const event = createPhoneEvent({
                type: 'phone-call-forwarded-to-external-number',
                data: {
                    call: {
                        selected_menu_option: {
                            forward_call: {
                                phone_number: '+14567654985',
                            },
                        },
                    },
                },
            })
            const expectedFormattedPhone =
                parsePhoneNumberFromString(
                    '+14567654985',
                )?.formatInternational() ?? '+14567654985'

            expect(getPhoneEventDetailsEntries(event)).toEqual([
                { key: 'Forwarded to', value: expectedFormattedPhone },
            ])
        })

        it('falls back to raw forwarded number when parsing fails', () => {
            const event = createPhoneEvent({
                type: 'phone-call-forwarded-to-gorgias-number',
                data: {
                    call: {
                        selected_menu_option: {
                            forward_call: {
                                phone_number: 'not-a-phone',
                            },
                        },
                    },
                },
            })

            expect(getPhoneEventDetailsEntries(event)).toEqual([
                { key: 'Forwarded to', value: 'not-a-phone' },
            ])
        })

        it('builds audio recording details for message-played voice recordings', () => {
            const event = createPhoneEvent({
                type: 'message-played',
                data: {
                    call: {
                        selected_menu_option: {
                            voice_message: {
                                voice_message_type: 'voice_recording',
                                new_voice_recording_file_name: 'voice.mp3',
                            },
                        },
                    },
                },
            })

            expect(getPhoneEventDetailsEntries(event)).toEqual([
                { key: 'Audio recording', value: 'voice.mp3' },
            ])
        })

        it('builds text details for message-played text-to-speech', () => {
            const event = createPhoneEvent({
                type: 'message-played',
                data: {
                    call: {
                        selected_menu_option: {
                            voice_message: {
                                voice_message_type: 'text_to_speech',
                                text_to_speech_content: 'Hello there',
                            },
                        },
                    },
                },
            })

            expect(getPhoneEventDetailsEntries(event)).toEqual([
                { key: 'Text', value: 'Hello there' },
            ])
        })

        it('returns no details when expected payload fields are missing', () => {
            expect(
                getPhoneEventDetailsEntries(
                    createPhoneEvent({
                        type: 'phone-call-forwarded-to-external-number',
                    }),
                ),
            ).toEqual([])
            expect(
                getPhoneEventDetailsEntries(
                    createPhoneEvent({
                        type: 'message-played',
                    }),
                ),
            ).toEqual([])
        })

        it('returns no details for non-details phone events', () => {
            expect(
                getPhoneEventDetailsEntries(
                    createPhoneEvent({
                        type: 'phone-call-forwarded',
                    }),
                ),
            ).toEqual([])
        })
    })
})
