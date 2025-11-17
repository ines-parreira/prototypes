import { ContentState, EditorState } from 'draft-js'
import { fromJS } from 'immutable'

import { TicketMessageSourceType } from 'business/types/ticket'
import addMention from 'pages/common/draftjs/plugins/mentions/modifiers/addMention'

import type { NewMessage } from '../types'
import { getMentionIds, upsertNewMessageAction } from '../utils'

describe('Utils', () => {
    describe('getMentionIds', () => {
        it('should return array of ids for internal note source type', () => {
            //@ts-ignore
            const editorState = EditorState.push(
                EditorState.createEmpty(),
                ContentState.createFromText('@Bob'),
            )
            const newEditorState = addMention(
                editorState,
                fromJS({ name: 'Bob', id: 8 }),
                '@',
                '@',
                'SEGMENTED',
            )

            expect(
                getMentionIds(
                    newEditorState.getCurrentContent(),
                    TicketMessageSourceType.InternalNote,
                ),
            ).toMatchSnapshot()
        })

        it('should return empty array for source type other than internal note', () => {
            const contentState = ContentState.createFromText('Foo')

            expect(
                getMentionIds(contentState, TicketMessageSourceType.Email),
            ).toMatchSnapshot()
        })
    })

    describe('upsertNewMessageAction', () => {
        it('new actions should equal action argument when newMessage.actions is undefined', () => {
            const action = fromJS({
                name: 'AddInternalNote',
                arguments: {
                    body_text: 'Foo',
                    body_html: '<div>Foo</div>',
                },
            })
            const newMessage = {
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
            } as NewMessage

            expect(upsertNewMessageAction(newMessage, action)).toStrictEqual({
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: fromJS([
                    {
                        name: 'AddInternalNote',
                        arguments: {
                            body_text: 'Foo',
                            body_html: '<div>Foo</div>',
                        },
                    },
                ]),
            })
        })

        it('new actions should equal action argument when newMessage.actions already contains same action type', () => {
            const action = fromJS({
                name: 'AddInternalNote',
                arguments: {
                    body_text: 'Foo',
                    body_html: '<div>Foo</div>',
                },
            })
            const newMessage = {
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: fromJS([
                    {
                        name: 'AddInternalNote',
                        arguments: {
                            body_text: 'Bar',
                            body_html: '<div>Bar</div>',
                        },
                    },
                ]),
            } as NewMessage

            expect(upsertNewMessageAction(newMessage, action)).toStrictEqual({
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: fromJS([
                    {
                        name: 'AddInternalNote',
                        arguments: {
                            body_text: 'Foo',
                            body_html: '<div>Foo</div>',
                        },
                    },
                ]),
            })
        })

        it('new actions should equal action argument when newMessage.actions is empty array', () => {
            const action = fromJS({
                name: 'AddInternalNote',
                arguments: {
                    body_text: 'Foo',
                    body_html: '<div>Foo</div>',
                },
            })
            const newMessage = {
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: [],
            } as unknown as NewMessage

            expect(upsertNewMessageAction(newMessage, action)).toStrictEqual({
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: fromJS([
                    {
                        name: 'AddInternalNote',
                        arguments: {
                            body_text: 'Foo',
                            body_html: '<div>Foo</div>',
                        },
                    },
                ]),
            })
        })

        it('should merge action with newMessage.actions when newMessage.actions already contains action type', () => {
            const action = fromJS({
                name: 'AddInternalNote',
                arguments: {
                    body_text: 'Foo',
                    body_html: '<div>Foo</div>',
                },
            })
            const newMessage = {
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: fromJS([
                    {
                        name: 'AddInternalNote',
                        arguments: {
                            body_text: 'Bar',
                            body_html: '<div>Bar</div>',
                        },
                    },
                    {
                        name: 'ApplyExternalTemplate',
                        arguments: {
                            template_id: '1',
                            template_name: 'Foo',
                        },
                    },
                ]),
            } as NewMessage

            expect(upsertNewMessageAction(newMessage, action)).toStrictEqual({
                body_text: 'Bar',
                body_html: '<div>Bar</div>',
                actions: fromJS([
                    {
                        name: 'AddInternalNote',
                        arguments: {
                            body_text: 'Foo',
                            body_html: '<div>Foo</div>',
                        },
                    },
                    {
                        name: 'ApplyExternalTemplate',
                        arguments: {
                            template_id: '1',
                            template_name: 'Foo',
                        },
                    },
                ]),
            })
        })
    })
})
