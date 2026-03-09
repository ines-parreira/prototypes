import { TicketThreadItemTag } from '../../types'
import {
    isActionExecutedEvent,
    isAuditLogEvent,
    isNonRenderablePrivateReplyEvent,
    isPhoneEvent,
    isPrivateReplyEvent,
    isRuleExecutedType,
    isSystemRuleEvent,
    isViaRuleEvent,
} from '../predicates'
import { shouldRenderTicketThreadEvent, toTaggedEvent } from '../transforms'

describe('ticket thread event predicates', () => {
    const baseEvent = {
        object_type: 'ticket',
        created_datetime: '2024-03-21T11:00:00Z',
    }

    it('identifies deprecated private reply events as renderable', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 'facebookPrivateReply',
                payload: {
                    private_reply_event_type:
                        'MessagingTicketPrivateReplyEvent',
                },
                facebook_comment_ticket_id: '12',
            },
        }

        expect(isPrivateReplyEvent(event)).toBe(true)
        expect(isNonRenderablePrivateReplyEvent(event)).toBe(false)
    })

    it('identifies new-format private reply events as non-renderable', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 'facebookPrivateReply',
                payload: {
                    private_reply_event_type:
                        'MessagingTicketPrivateReplyEvent',
                },
            },
        }

        expect(isPrivateReplyEvent(event)).toBe(false)
        expect(isNonRenderablePrivateReplyEvent(event)).toBe(true)
    })

    it('tags satisfaction-survey-responded as a dedicated event', () => {
        const event = {
            ...baseEvent,
            type: 'satisfaction-survey-responded',
            data: { score: 5 },
        }

        expect(toTaggedEvent(event as any)).toMatchObject({
            _tag: TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
        })
    })

    it('keeps valid phone events renderable with structured phone payload', () => {
        const event = {
            ...baseEvent,
            type: 'phone-call-forwarded-to-external-number',
            data: {
                phone_ticket_id: 123,
                customer: {
                    name: 'Customer Name',
                    phone_number: '+14567654985',
                },
                call: {
                    selected_menu_option: {
                        forward_call: {
                            phone_number: '+14567654985',
                        },
                    },
                },
            },
            user: {
                name: 'Agent Name',
            },
        }

        expect(isPhoneEvent(event)).toBe(true)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(true)
        expect(toTaggedEvent(event as any)).toMatchObject({
            _tag: TicketThreadItemTag.Events.PhoneEvent,
        })
    })

    it('filters phone events with invalid structured phone payload', () => {
        const event = {
            ...baseEvent,
            type: 'phone-call-forwarded-to-external-number',
            data: {
                customer: {
                    name: 123,
                },
            },
        }

        expect(isPhoneEvent(event)).toBe(false)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    it('filters out unknown events without renderable metadata', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {},
        }

        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    it('keeps whitelisted action-executed events with valid payload shape', () => {
        const event = {
            ...baseEvent,
            type: 'action-executed',
            id: 24428826278,
            isEvent: true,
            data: {
                action_id:
                    'shopifyUpdateCustomerTags-360037000-33858-e4fd6c5d6f814f192458ff177d5d62b8101f1c90',
                action_label: null,
                action_name: 'shopifyUpdateCustomerTags',
                app_id: null,
                integration_id: 33858,
                payload: {
                    tags_list:
                        'a, ad, Canada, CupShe, ff, United States, action_t',
                },
                status: 'success',
            },
        }

        expect(isActionExecutedEvent(event)).toBe(true)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(true)
    })

    it('filters out action events when type is not action-executed', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 'shopifyUpdateCustomerTags',
                payload: {
                    tags_list: 'a,b',
                },
            },
        }

        expect(isActionExecutedEvent(event)).toBe(false)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    it('filters out action-executed events with unknown action_name', () => {
        const event = {
            ...baseEvent,
            type: 'action-executed',
            data: {
                action_name: 'setStatus',
                payload: {},
            },
        }

        expect(isActionExecutedEvent(event)).toBe(false)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    it('identifies typed audit log payloads as renderable audit log events', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-tags-added',
            data: {
                tags_added: [1, 2],
            },
        }

        expect(isAuditLogEvent(event)).toBe(true)
        expect(toTaggedEvent(event as any)).toMatchObject({
            _tag: TicketThreadItemTag.Events.AuditLogEvent,
        })
    })

    it('filters malformed audit log payloads with invalid data shape', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-tags-added',
            data: 'invalid',
        }

        expect(isAuditLogEvent(event)).toBe(false)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    it('filters out action events when action_name is not a string', () => {
        const event = {
            ...baseEvent,
            type: 'action-executed',
            data: {
                action_name: 123,
                payload: {},
            },
        }

        expect(isActionExecutedEvent(event)).toBe(false)
        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    describe('isSystemRuleEvent', () => {
        it('returns true when the event contains a system rule payload', () => {
            const event = {
                ...baseEvent,
                data: {
                    type: 'system',
                },
            }

            expect(isSystemRuleEvent(event)).toBe(true)
        })

        it('returns false when the event does not contain a system rule payload', () => {
            const event = {
                ...baseEvent,
                data: {
                    type: 'custom',
                },
            }

            expect(isSystemRuleEvent(event)).toBe(false)
        })
    })

    describe('isRuleExecutedType', () => {
        it('returns true for rule-executed events', () => {
            const event = {
                ...baseEvent,
                type: 'rule-executed',
            }

            expect(isRuleExecutedType(event)).toBe(true)
        })

        it('returns false for non rule-executed events', () => {
            const event = {
                ...baseEvent,
                type: 'ticket-assigned',
            }

            expect(isRuleExecutedType(event)).toBe(false)
        })
    })

    describe('isViaRuleEvent', () => {
        const getEvent = (type: string) => ({
            id: 1,
            account_id: 1,
            user_id: 1,
            object_type: 'ticket',
            object_id: 1,
            data: null,
            context: 'foo',
            type,
            created_datetime: '2019-11-15 19:00:00.000000',
        })

        const getValidEvent = () => ({
            ...getEvent('ticket-assigned'),
            id: 2,
            created_datetime: '2019-11-15 19:00:00.500000',
        })

        it('returns true when an older rule-executed event with the same context exists', () => {
            const ruleExecutedEvent = getEvent('rule-executed')
            const event = getValidEvent()
            const events = [ruleExecutedEvent, event]

            expect(isViaRuleEvent(event, events)).toBe(true)
        })

        it('returns false when context is empty', () => {
            const ruleExecutedEvent = getEvent('rule-executed')
            const event = {
                ...getValidEvent(),
                context: '',
            }
            const events = [ruleExecutedEvent, event]

            expect(isViaRuleEvent(event, events)).toBe(false)
        })

        it('returns false when context is null', () => {
            const ruleExecutedEvent = getEvent('rule-executed')
            const event = {
                ...getValidEvent(),
                context: null,
            }
            const events = [ruleExecutedEvent, event]

            expect(isViaRuleEvent(event, events)).toBe(false)
        })

        it('returns false when events are empty', () => {
            const event = getValidEvent()
            const events: unknown[] = []

            expect(isViaRuleEvent(event, events)).toBe(false)
        })

        it('returns false when only the current event is present', () => {
            const event = getValidEvent()
            const events = [event]

            expect(isViaRuleEvent(event, events)).toBe(false)
        })

        it('returns false when no rule-executed event exists in the list', () => {
            const otherEvent = getEvent('ticket-assigned')
            const event = getValidEvent()
            const events = [otherEvent, event]

            expect(isViaRuleEvent(event, events)).toBe(false)
        })

        it('returns false when only a rule-executed event is present', () => {
            const ruleExecutedEvent = getEvent('rule-executed')
            const events = [ruleExecutedEvent]

            expect(isViaRuleEvent(ruleExecutedEvent, events)).toBe(false)
        })

        it('returns false when contexts differ', () => {
            const ruleExecutedEvent = {
                ...getEvent('rule-executed'),
                context: 'bar',
            }
            const event = getValidEvent()
            const events = [ruleExecutedEvent, event]

            expect(isViaRuleEvent(event, events)).toBe(false)
        })

        it('returns false when the rule-executed event is not older', () => {
            const ruleExecutedEvent = {
                ...getEvent('rule-executed'),
                created_datetime: '2019-11-15 20:00:00.000000',
            }
            const event = getValidEvent()
            const events = [ruleExecutedEvent, event]

            expect(isViaRuleEvent(event, events)).toBe(false)
        })
    })
})
