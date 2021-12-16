import {fromJS} from 'immutable'

import {MacroActionName} from '../../../models/macroAction/types'
import {getDefaultMacro, generateDefaultAction, getErrorReason} from '../utils'
import {MacroApiError} from '../types'

describe('macro utils', () => {
    describe('generateDefaultAction', () => {
        it('should return default action for setResponseText', () => {
            expect(
                generateDefaultAction(MacroActionName.SetResponseText)
            ).toEqual(
                fromJS({
                    type: 'user',
                    execution: 'front',
                    name: MacroActionName.SetResponseText,
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
                            name: MacroActionName.SetResponseText,
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
                                    0: {
                                        arguments: [
                                            {
                                                tags: ['Tags cannot be empty.'],
                                            },
                                        ],
                                    },
                                    2: {
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
            } as unknown as MacroApiError
            expect(getErrorReason(error)).toMatchSnapshot()
        })
    })
})
