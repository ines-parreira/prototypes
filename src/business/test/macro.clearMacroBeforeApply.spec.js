// @flow
import { fromJS } from 'immutable'

import { IMacro, clearMacroBeforeApply } from '../macro'
import { TicketMessageSourceTypes } from '../ticket'

describe('Business', () => {
    describe('macro', () => {
        describe('clearMacroBeforeApply()', () => {
            let macro: IMacro

            beforeEach(() => {
                macro = {
                    id: 1,
                    name: 'Macro 1',
                    actions: [
                        {
                            arguments: {
                                attachments: [
                                    {
                                        url: 'https://dev.gorgias.io/img1.png',
                                    }
                                ],
                            },
                            name: 'addAttachments',
                            title: 'Add pictures',
                            type: 'user',
                        },
                        {
                            arguments: {
                                body_html: '<p>Hello</p>',
                                body_text: 'Hello',
                            },
                            name: 'setResponseText',
                            title: 'Say Hello',
                            type: 'user',
                        }
                    ]
                }
            })

            it('should clear attachments when applied on facebook-messenger', () => {
                // Given

                // When
                const result = clearMacroBeforeApply(TicketMessageSourceTypes.FACEBOOK_MESSENGER, fromJS(macro))

                // Then
                // $FlowFixMe
                expect(result.notification.message)
                    .toEqual('We have removed the attachment from this message, because you cannot send text and attachments at the same time on Messenger.')
                expect(result.macro.get('actions').size).toEqual(1)
                expect(result.macro.get('actions').get(0).get('name')).toEqual('setResponseText')
            })

            it('should clear attachments when applied on chat with more than one', () => {
                // Given
                // $FlowFixMe
                macro.actions[0].arguments.attachments.push(
                    {
                        url: 'https://dev.gorgias.io/img2.png',
                    }
                )

                // When
                const result = clearMacroBeforeApply(TicketMessageSourceTypes.CHAT, fromJS(macro))

                // Then
                // $FlowFixMe
                expect(result.notification.message)
                    .toEqual('We have removed the attachments from this message, because you cannot send multiple attachments at the same time on Chat.')
                expect(result.macro.get('actions').size).toEqual(1)
                expect(result.macro.get('actions').get(0).get('name')).toEqual('setResponseText')
            })

            it('should not clear attachments when applied on chat with only one', () => {
                // Given

                // When
                const result = clearMacroBeforeApply(TicketMessageSourceTypes.CHAT, fromJS(macro))

                // Then
                expect(result.notification).toBeFalsy()
                expect(result.macro.get('actions').size).toEqual(2)
            })
        })
    })
})
