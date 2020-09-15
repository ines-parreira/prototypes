import {fromJS, List, Map} from 'immutable'

import {Macro} from '../../models/macro/types'
import {MacroActionName, MacroActionType} from '../../models/macroAction/types'
import {clearMacroBeforeApply} from '../macro'
import {TicketMessageSourceType} from '../types/ticket'

describe('Business', () => {
    describe('macro', () => {
        describe('clearMacroBeforeApply()', () => {
            let macro: Macro

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
                                    },
                                ],
                            },
                            name: MacroActionName.AddAttachments,
                            title: 'Add pictures',
                            type: MacroActionType.User,
                        },
                        {
                            arguments: {
                                body_html: '<p>Hello</p>',
                                body_text: 'Hello',
                            },
                            name: MacroActionName.SetResponseText,
                            title: 'Say Hello',
                            type: MacroActionType.User,
                        },
                    ],
                } as Macro
            })

            it('should clear attachments when applied on facebook-messenger', () => {
                // Given

                // When
                const result = clearMacroBeforeApply(
                    TicketMessageSourceType.FacebookMessenger,
                    fromJS(macro)
                )

                // Then
                expect(result.notification?.message).toEqual(
                    'We have removed the attachment from this message, because you cannot send text and ' +
                        'attachments at the same time on Messenger.'
                )
                expect((result.macro.get('actions') as List<any>).size).toEqual(
                    1
                )
                expect(
                    ((result.macro.get('actions') as List<any>).get(0) as Map<
                        any,
                        any
                    >).get('name')
                ).toEqual('setResponseText')
            })

            it('should clear attachments when applied on chat with more than one', () => {
                // Given
                macro.actions[0].arguments.attachments?.push({
                    url: 'https://dev.gorgias.io/img2.png',
                })

                // When
                const result = clearMacroBeforeApply(
                    TicketMessageSourceType.Chat,
                    fromJS(macro)
                )

                // Then
                expect(result.notification?.message).toEqual(
                    'We have removed the attachments from this message, because you cannot send multiple ' +
                        'attachments at the same time on Chat.'
                )
                expect((result.macro.get('actions') as List<any>).size).toEqual(
                    1
                )
                expect(
                    ((result.macro.get('actions') as List<any>).get(0) as Map<
                        any,
                        any
                    >).get('name')
                ).toEqual('setResponseText')
            })

            it('should not clear attachments when applied on chat with only one', () => {
                // Given

                // When
                const result = clearMacroBeforeApply(
                    TicketMessageSourceType.Chat,
                    fromJS(macro)
                )

                // Then
                expect(result.notification).toBeFalsy()
                expect((result.macro.get('actions') as List<any>).size).toEqual(
                    2
                )
            })
        })
    })
})
