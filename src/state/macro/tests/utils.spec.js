import {fromJS} from 'immutable'

import {
    getDefaultMacro,
    generateDefaultAction,
    getErrorReason,
} from '../utils.ts'

describe('macro utils', () => {
    describe('generateDefaultAction', () => {
        it('should return default action for setResponseText', () => {
            expect(generateDefaultAction('setResponseText')).toEqual(
                fromJS({
                    type: 'user',
                    execution: 'front',
                    name: 'setResponseText',
                    title: 'Add response text',
                    arguments: {
                        body_text: '',
                        body_html: '',
                    },
                })
            )
        })
    })

    describe('getDefaultMacro', () => {
        it('should return default new macro', () => {
            expect(getDefaultMacro()).toEqual(
                fromJS({
                    name: 'New macro',
                    actions: [
                        {
                            type: 'user',
                            execution: 'front',
                            name: 'setResponseText',
                            title: 'Add response text',
                            arguments: {
                                body_text: '',
                                body_html: '',
                            },
                        },
                    ],
                })
            )
        })
    })

    describe('getErrorReason', () => {
        it('should return concatenated error messages', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'Failed to update macros.',
                            data: {
                                actions: {
                                    '0': {
                                        arguments: [
                                            {
                                                tags: ['Tags cannot be empty.'],
                                            },
                                        ],
                                    },
                                    '2': {
                                        arguments: [
                                            {
                                                url: ['Invalid URL protocol'],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            }
            expect(getErrorReason(error)).toMatchSnapshot()
        })
    })
})
