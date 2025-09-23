import * as uuid from 'uuid'

import {
    EnqueueStep,
    IvrMenuStep,
    PlayMessageStep,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'

import {
    getDefaultIvrFlow,
    getDefaultStandardFlow,
    getRouteToQueueFlow,
    getSendToVoicemailFlow,
} from '../utils'

// Mock uuid module to provide predictable IDs for testing
jest.mock('uuid', () => {
    const originalUuid = jest.requireActual('uuid')
    return {
        ...originalUuid,
        v4: jest.fn(() => originalUuid.v4()),
    }
})

const mockedUuid = uuid.v4 as jest.Mock

describe('VoiceIntegrationOnboarding utils', () => {
    beforeEach(() => {
        mockedUuid.mockClear()
    })

    describe('getSendToVoicemailFlow', () => {
        beforeEach(() => {
            mockedUuid.mockReturnValue('voicemail-step-id')
        })

        it('should create a simple voicemail-only flow', () => {
            const flow = getSendToVoicemailFlow()

            expect(flow).toEqual({
                first_step_id: 'voicemail-step-id',
                steps: {
                    'voicemail-step-id': {
                        id: 'voicemail-step-id',
                        name: 'Voicemail',
                        step_type: 'send_to_voicemail',
                        voicemail: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content:
                                "Hello, unfortunately we aren't able to take your call right now. Please leave us a voicemail and we'll get back to you as soon as possible. Thank you!",
                        },
                        allow_to_leave_voicemail: true,
                        next_step_id: null,
                    },
                },
            })
        })
    })

    describe('getRouteToQueueFlow', () => {
        beforeEach(() => {
            mockedUuid
                .mockReturnValueOnce('voicemail-id')
                .mockReturnValueOnce('business-hours-id')
                .mockReturnValueOnce('enqueue-id')
        })

        it('should create a flow that routes to queue during business hours', () => {
            const queueId = 123
            const flow = getRouteToQueueFlow(queueId)

            expect(flow).toEqual({
                first_step_id: 'business-hours-id',
                steps: {
                    'business-hours-id': {
                        id: 'business-hours-id',
                        name: 'Business Hours',
                        step_type: 'time_split_conditional',
                        on_true_step_id: 'enqueue-id',
                        on_false_step_id: 'voicemail-id',
                    },
                    'enqueue-id': {
                        id: 'enqueue-id',
                        name: 'Enqueue',
                        step_type: 'enqueue',
                        queue_id: queueId,
                        conditional_routing: false,
                        callback_requests: {
                            enabled: false,
                            prompt_message: {
                                voice_message_type: 'text_to_speech',
                                text_to_speech_content: `You can request a callback at any time. Just press star and we'll return your call shortly.`,
                            },
                            confirmation_message: {
                                voice_message_type: 'text_to_speech',
                                text_to_speech_content:
                                    'Your callback has been requested. Please leave a message after the tone.',
                            },
                            allow_to_leave_voicemail: true,
                        },
                        next_step_id: 'voicemail-id',
                    },
                    'voicemail-id': {
                        id: 'voicemail-id',
                        name: 'Voicemail',
                        step_type: 'send_to_voicemail',
                        voicemail: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content:
                                "Hello, unfortunately we aren't able to take your call right now. Please leave us a voicemail and we'll get back to you as soon as possible. Thank you!",
                        },
                        allow_to_leave_voicemail: true,
                        next_step_id: null,
                    },
                },
            })
        })

        it('should use the provided queue_id in the enqueue step', () => {
            const queueId = 456
            const flow = getRouteToQueueFlow(queueId)

            expect((flow.steps['enqueue-id'] as EnqueueStep).queue_id).toBe(
                queueId,
            )
        })

        it('should have business hours as first step routing to enqueue or voicemail', () => {
            const flow = getRouteToQueueFlow(123)
            const businessHoursStep = flow.steps[
                flow.first_step_id
            ] as TimeSplitConditionalStep

            expect(businessHoursStep.step_type).toBe('time_split_conditional')
            expect(businessHoursStep.on_true_step_id).toBe('enqueue-id')
            expect(businessHoursStep.on_false_step_id).toBe('voicemail-id')
        })
    })

    describe('getDefaultStandardFlow', () => {
        describe('when queue_id is provided', () => {
            beforeEach(() => {
                mockedUuid
                    .mockReturnValueOnce('voicemail-id')
                    .mockReturnValueOnce('business-hours-id')
                    .mockReturnValueOnce('enqueue-id')
            })

            it('should return route to queue flow for valid queue_id', () => {
                const queueId = 789
                const flow = getDefaultStandardFlow(queueId)

                expect(flow.first_step_id).toBe('business-hours-id')
                expect(flow.steps).toHaveProperty('business-hours-id')
                expect(flow.steps).toHaveProperty('enqueue-id')
                expect(flow.steps).toHaveProperty('voicemail-id')
                expect((flow.steps['enqueue-id'] as EnqueueStep).queue_id).toBe(
                    queueId,
                )
            })
        })

        describe('when queue_id is not provided', () => {
            beforeEach(() => {
                mockedUuid.mockReturnValue('voicemail-only-id')
            })

            it('should return voicemail-only flow for null queue_id', () => {
                const flow = getDefaultStandardFlow(null)
                const expectedFlow = getSendToVoicemailFlow()

                expect(flow).toEqual(expectedFlow)
            })

            it('should return voicemail-only flow for undefined queue_id', () => {
                const flow = getDefaultStandardFlow(undefined)
                const expectedFlow = getSendToVoicemailFlow()

                expect(flow).toEqual(expectedFlow)
            })

            it('should return voicemail-only flow for 0 queue_id', () => {
                const flow = getDefaultStandardFlow(0)
                const expectedFlow = getSendToVoicemailFlow()

                expect(flow).toEqual(expectedFlow)
            })
        })
    })

    describe('getDefaultIvrFlow', () => {
        beforeEach(() => {
            mockedUuid
                .mockReturnValueOnce('business-hours-id')
                .mockReturnValueOnce('ivr-menu-id')
                .mockReturnValueOnce('ivr-instructions-1-id')
                .mockReturnValueOnce('ivr-instructions-2-id')
                .mockReturnValueOnce('voicemail-id')
        })

        it('should create a complete IVR flow with business hours, menu, instructions, and voicemail', () => {
            const flow = getDefaultIvrFlow()

            expect(flow).toEqual({
                first_step_id: 'business-hours-id',
                steps: {
                    'business-hours-id': {
                        id: 'business-hours-id',
                        name: 'Business Hours',
                        step_type: 'time_split_conditional',
                        on_true_step_id: 'ivr-menu-id',
                        on_false_step_id: 'voicemail-id',
                    },
                    'ivr-menu-id': {
                        id: 'ivr-menu-id',
                        name: 'IVR Menu',
                        step_type: 'ivr_menu',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content:
                                'Hello, thanks for calling. This IVR number was not fully configured. Press 1 for set up instructions. Press 2 for more.',
                        },
                        branch_options: [
                            {
                                input_digit: '1',
                                branch_name: 'IVR 1 instructions',
                                next_step_id: 'ivr-instructions-1-id',
                            },
                            {
                                input_digit: '2',
                                branch_name: 'IVR 2 instructions',
                                next_step_id: 'ivr-instructions-2-id',
                            },
                        ],
                    },
                    'ivr-instructions-1-id': {
                        id: 'ivr-instructions-1-id',
                        name: 'IVR instructions (1)',
                        step_type: 'play_message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content:
                                'You can update IVR menu options on the Call flow page.',
                        },
                        next_step_id: null,
                    },
                    'ivr-instructions-2-id': {
                        id: 'ivr-instructions-2-id',
                        name: 'IVR instructions (2)',
                        step_type: 'play_message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content:
                                'By default, the call will go to voicemail outside business hours.',
                        },
                        next_step_id: null,
                    },
                    'voicemail-id': {
                        id: 'voicemail-id',
                        name: 'Voicemail',
                        step_type: 'send_to_voicemail',
                        voicemail: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content:
                                "Hello, unfortunately we aren't able to take your call right now. Please leave us a voicemail and we'll get back to you as soon as possible. Thank you!",
                        },
                        allow_to_leave_voicemail: true,
                        next_step_id: null,
                    },
                },
            })
        })

        it('should have business hours as first step routing to IVR menu or voicemail', () => {
            const flow = getDefaultIvrFlow()
            const businessHoursStep = flow.steps[
                flow.first_step_id
            ] as TimeSplitConditionalStep

            expect(businessHoursStep.step_type).toBe('time_split_conditional')
            expect(businessHoursStep.on_true_step_id).toBe('ivr-menu-id')
            expect(businessHoursStep.on_false_step_id).toBe('voicemail-id')
        })

        it('should have IVR menu with two branch options', () => {
            const flow = getDefaultIvrFlow()
            const ivrMenuStep = flow.steps['ivr-menu-id'] as IvrMenuStep

            expect(ivrMenuStep.step_type).toBe('ivr_menu')
            expect(ivrMenuStep.branch_options).toHaveLength(2)
            expect(ivrMenuStep.branch_options[0].input_digit).toBe('1')
            expect(ivrMenuStep.branch_options[1].input_digit).toBe('2')
        })

        it('should have instruction steps that end the call', () => {
            const flow = getDefaultIvrFlow()
            const instruction1Step = flow.steps[
                'ivr-instructions-1-id'
            ] as PlayMessageStep
            const instruction2Step = flow.steps[
                'ivr-instructions-2-id'
            ] as PlayMessageStep

            expect(instruction1Step.step_type).toBe('play_message')
            expect(instruction1Step.next_step_id).toBeNull()
            expect(instruction2Step.step_type).toBe('play_message')
            expect(instruction2Step.next_step_id).toBeNull()
        })
    })
})
