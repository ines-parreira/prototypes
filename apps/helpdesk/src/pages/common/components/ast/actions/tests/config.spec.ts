import { fromJS } from 'immutable'

import schemasJSON from 'fixtures/openapi.json'
import { ACTION_TYPES } from 'models/rule/types'

import {
    isValidActionKey,
    validateApplyMacro,
    validateAssignAgent,
    validateAssignTeam,
    validateBody,
    validateEmailList,
    validateSendEmail,
    validateSetCustomFieldValue,
    validateSubject,
    validateTags,
} from '../config'

const schemas = fromJS(schemasJSON)

describe('validateEmailList', () => {
    it('should validate email list', () => {
        const valid = [
            'email@example.com',
            'email@example.com,',
            '{{ticket.customer.email}}',
            'email@example.com, email2@example.com,',
            'email@example.com, {{ticket.customer.email}}, email@example.com',
            '{{ticket.assignee_user.email}}, {{ticket.customer.email}}, email2@example.com,',
        ]
        valid.forEach((input) => {
            expect(validateEmailList(input, schemas)).toBeFalsy()
        })
    })

    it('should return errors and not validate email list', () => {
        const invalid = [
            'emailexample.com',
            '{{ticket.sender.name}}',
            '{{ticket.tags.name}},',
            'email@example.com, {{ticket.created_datetime}}, email2@example.com',
            '{{message.from_agent}}, {{ticket.receiver.email}}, email2@example.com,',
        ]
        invalid.forEach((input) => {
            expect(validateEmailList(input, schemas)).toBeTruthy()
        })
    })
})

describe('validateSubject', () => {
    it('should validate subject', () => {
        expect(validateSubject({ subject: 'a' })).toBeFalsy()
    })

    it('should return error and not validate subject', () => {
        expect(validateSubject({})).toBeTruthy()
        expect(validateSubject({ subject: '' })).toBeTruthy()
    })
})

describe('validateBody', () => {
    it('should validate body', () => {
        expect(validateBody({ body_text: 'hey' })).toBeFalsy()
    })

    it('should return errors and not validate body', () => {
        expect(validateBody({})).toBeTruthy()
    })
})

describe('validateApplyMacro', () => {
    it('should validate macro', () => {
        expect(validateApplyMacro({ macro: 'a' })).toBeFalsy()
    })

    it('should return error and not validate macro', () => {
        expect(validateApplyMacro({})).toBeTruthy()
        expect(validateApplyMacro({ macro: '' })).toBeTruthy()
    })
})

describe('validateSetCustomFieldValue', () => {
    it('should validate custom field value', () => {
        const valid = [
            { value: 'hoy', custom_field_id: 1 },
            { value: 10, custom_field_id: 1 },
            { value: true, custom_field_id: 1 },
        ]
        valid.forEach((input) => {
            expect(validateSetCustomFieldValue(input)).toBeFalsy()
        })
    })

    it('should return errors and not validate custom field value', () => {
        const invalid = [
            {},
            { value: 'hoy' },
            { value: 'hoy', custom_field_id: 0 },
            { custom_field_id: 1 },
            { custom_field_id: 1, value: '' },
        ]
        invalid.forEach((input) => {
            expect(validateSetCustomFieldValue(input)).toBeTruthy()
        })
    })
})

describe('validateAssignAgent', () => {
    it('should validate assigned agent', () => {
        expect(validateAssignAgent({ assignee_user: 'Leela' })).toBeFalsy()
        expect(validateAssignAgent({ assignee_user: null })).toBeFalsy()
    })

    it('should return error and not assigned agent', () => {
        expect(validateAssignAgent({})).toBeTruthy()
        expect(validateAssignAgent({ assignee_user: '' })).toBeTruthy()
    })
})

describe('validateAssignTeam', () => {
    it('should validate assigned team', () => {
        expect(
            validateAssignTeam({ assignee_team: 'Planet Express' }),
        ).toBeFalsy()
        expect(validateAssignTeam({ assignee_team: null })).toBeFalsy()
    })

    it('should return error and not assigned team', () => {
        expect(validateAssignTeam({})).toBeTruthy()
        expect(validateAssignTeam({ assignee_team: '' })).toBeTruthy()
    })
})

describe('validateSendEmail', () => {
    it('should validate email', () => {
        const emails = [
            {
                body_text: 'hey',
                to: 'email@example.com',
            },
            {
                body_text: 'hey',
                to: 'email@example.com',
            },
            {
                body_text: 'hey',
                cc: 'email@example.com',
            },
            {
                body_text: 'hey',
                bcc: 'emai@example.com',
            },
        ]

        emails.forEach((email) => {
            expect(validateSendEmail(email)).toEqual([])
        })
    })

    it('should return errors and not validate email', () => {
        const emails = [
            {},
            {
                body_text: 'hey',
            },
            {
                to: 'email@example.com',
            },
            {
                cc: 'email@example.com',
            },
            {
                bcc: 'email@example.com',
            },
        ]

        emails.forEach((email) => {
            const result = validateSendEmail(email)
            expect(result).toBeInstanceOf(Array)
            expect(result.length > 0).toBe(true)
        })
    })

    it.each([
        {
            body_text: 'body',
            to: 'email@example.com, '.repeat(16),
        },
        {
            body_text: 'body',
            to: 'email@example.com, '.repeat(8),
            cc: 'email@example.com, '.repeat(8),
        },
        {
            body_text: 'body',
            to: 'email@example.com, '.repeat(5),
            cc: 'email@example.com, '.repeat(5),
            bcc: 'email@example.com, '.repeat(6),
        },
    ])('should return errors if too many recipients', (email) => {
        const errors = validateSendEmail(email)
        expect(errors.length).toBe(1)
    })
})

describe('validateTags', () => {
    it('should validate tags', () => {
        expect(validateTags({ tags: 'hey' })).toBeFalsy()
    })

    it('should return errors and not validate tags', () => {
        expect(validateTags({ tags: '' })).toBeTruthy()
        expect(validateTags({})).toBeTruthy()
        expect(validateTags({ tags: null })).toBeTruthy()
    })
})

describe('isValidActionKey', () => {
    it('should false', () => {
        expect(isValidActionKey('')).toBeFalsy()
        expect(isValidActionKey('hey')).toBeFalsy()
    })

    it('should return true', () => {
        ACTION_TYPES.forEach((action) => {
            expect(isValidActionKey(action)).toBeTruthy()
        })
        expect(isValidActionKey('notify')).toBeTruthy()
    })
})
