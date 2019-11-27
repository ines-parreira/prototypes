import {fromJS} from 'immutable'

import {
    getDefaultMacro,
    generateDefaultAction,
} from '../utils'

describe('macro utils', () => {
    describe('generateDefaultAction', () => {
        it('should return default action for setResponseText', () => {
            expect(generateDefaultAction('setResponseText'))
                .toEqual(fromJS({
                    type: 'user',
                    execution: 'front',
                    name: 'setResponseText',
                    title: 'Add response text',
                    arguments: {
                        body_text: '',
                        body_html: ''
                    }
                }))
        })
    })

    describe('getDefaultMacro', () => {
        it('should return default new macro', () => {
            expect(getDefaultMacro())
                .toEqual(fromJS({
                    name: 'New macro',
                    actions: [{
                        type: 'user',
                        execution: 'front',
                        name: 'setResponseText',
                        title: 'Add response text',
                        arguments: {
                            body_text: '',
                            body_html: '',
                        }
                    }]
                }))
        })
    })
})
