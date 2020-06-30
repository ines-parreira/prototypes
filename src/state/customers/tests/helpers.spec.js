import {fromJS} from 'immutable'

import * as helpers from '../helpers'
import {EMAIL_CHANNEL} from '../../../config/ticket'

describe('customers helpers', () => {
    it('getDisplayName', () => {
        const name = 'Cedric'
        const email = 'cedric@gmail.com'
        const id = 1234

        expect(helpers.getDisplayName()).toBe('Unknown customer')
        expect(helpers.getDisplayName('')).toBe('Unknown customer')
        expect(helpers.getDisplayName(name)).toBe(name)
        expect(helpers.getDisplayName({name})).toBe(name)
        expect(helpers.getDisplayName(fromJS({name}))).toBe(name)
        expect(helpers.getDisplayName({name, email})).toBe(name)
        expect(helpers.getDisplayName({email})).toBe(email)
        expect(helpers.getDisplayName({name: `  ${name}   `})).toBe(name)
        expect(helpers.getDisplayName({id})).toBe(`Customer #${id}`)
        expect(helpers.getDisplayName({name, email, id})).toBe(name)
        expect(helpers.getDisplayName({hello: 'world'})).toBe(
            'Unknown customer'
        )
    })

    describe('mergeChannels()', () => {
        const channel1 = {
            address: 'address1@foo.bar',
            preferred: false,
            type: EMAIL_CHANNEL,
        }
        const channel2 = {
            address: 'address2@foo.bar',
            preferred: false,
            type: EMAIL_CHANNEL,
        }
        const sameChannel1 = {
            address: 'ADDRESS1@foo.bar',
            preferred: false,
            type: EMAIL_CHANNEL,
        }

        it('should return all channels because emails are different', () => {
            expect(helpers.mergeChannels([channel1, channel2])).toEqual([
                channel1,
                channel2,
            ])
        })

        it('should return lowercase channel because emails are the same', () => {
            expect(helpers.mergeChannels([sameChannel1, channel1])).toEqual([
                channel1,
            ])
        })

        it('should return lowercase channel because emails are the same, lowercase channel received first', () => {
            expect(helpers.mergeChannels([channel1, sameChannel1])).toEqual([
                channel1,
            ])
        })
    })
})
