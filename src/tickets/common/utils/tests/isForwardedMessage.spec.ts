import {fromJS} from 'immutable'

import isForwardedMessage from '../isForwardedMessage'

describe('isForwardedMessage()', () => {
    it('should detect forwarded message', () => {
        expect(
            isForwardedMessage(fromJS({source: {extra: {forward: true}}}))
        ).toEqual(true)
    })

    it('should not detect forwarded message', () => {
        expect(
            isForwardedMessage(fromJS({source: {extra: {forward: false}}}))
        ).toEqual(false)
        expect(isForwardedMessage(fromJS({}))).toEqual(false)
    })
})
