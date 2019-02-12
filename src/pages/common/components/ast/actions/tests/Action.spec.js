import {fromJS} from 'immutable'

import schemasJSON from '../../../../../../fixtures/openapi.json'
import {validateEmailList, validateBody, validateSendEmail, validateTags} from '../Action'
const schemas = fromJS(schemasJSON)

describe('Action', () => {
    describe('validateEmailList', () => {
        it('should validate email list', () => {
            const valid = [
                'email@example.com',
                'email@example.com,',
                '{{ticket.sender.email}}',
                '{{ticket.receiver.email}},',
                'email@example.com, email2@example.com,',
                'email@example.com, {{ticket.receiver.email}}, email@example.com',
                '{{ticket.assignee_user.email}}, {{ticket.receiver.email}}, email2@example.com,'
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
                '{{message.from_agent}}, {{ticket.receiver.email}}, email2@example.com,'
            ]
            invalid.forEach((input) => {
                expect(validateEmailList(input, schemas)).toBeTruthy()
            })
        })
    })

    describe('validateBody', () => {
        it('should validate body', () => {
            expect(validateBody({body_text: 'hey'}, schemas))
                .toBeFalsy()
        })

        it('should return errors and not validate body', () => {
            expect(validateBody({}, schemas)).toBeTruthy()
        })
    })

    describe('validateSendEmail', () => {
        it('should validate email', () => {
            const emails = [{
                body_text: 'hey',
                to: 'email@example.com'
            }, {
                body_text: 'hey',
                to: 'email@example.com'
            }, {
                body_text: 'hey',
                cc: 'email@example.com'
            }, {
                body_text: 'hey',
                bcc: 'emai@example.com'
            }]

            emails.forEach((email) => {
                expect(validateSendEmail(email, schemas)).toEqual([])
            })
        })

        it('should return errors and not validate email', () => {
            const emails = [{}, {
                body_text: 'hey',
            }, {
                to: 'email@example.com'
            }, {
                cc: 'email@example.com'
            }, {
                bcc: 'email@example.com'
            }]

            emails.forEach((email) => {
                const result = validateSendEmail(email, schemas)
                expect(result).toBeInstanceOf(Array)
                expect(result.length > 0).toBe(true)
            })
        })
    })

    describe('validateTags', () => {
        it('should validate tags', () => {
            expect(validateTags({tags: 'hey'}, schemas)).toBeFalsy()
        })

        it('should return errors and not validate tags', () => {
            expect(validateTags({tags: ''}, schemas)).toBeTruthy()
        })
    })
})
