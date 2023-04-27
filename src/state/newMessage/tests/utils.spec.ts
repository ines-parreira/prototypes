import {ContentState, EditorState} from 'draft-js'
import {fromJS} from 'immutable'

import {TicketMessageSourceType} from 'business/types/ticket'

import addMention from 'pages/common/draftjs/plugins/mentions/modifiers/addMention'

import {getMentionIds} from '../utils'

describe('Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getMentionIds', () => {
        it('should return array of ids for internal note source type', () => {
            //@ts-ignore
            const editorState = EditorState.push(
                EditorState.createEmpty(),
                ContentState.createFromText('@Bob')
            )
            const newEditorState = addMention(
                editorState,
                fromJS({name: 'Bob', id: 8}),
                '@',
                '@',
                'SEGMENTED'
            )

            expect(
                getMentionIds(
                    newEditorState.getCurrentContent(),
                    TicketMessageSourceType.InternalNote
                )
            ).toMatchSnapshot()
        })

        it('should return empty array for source type other than internal note', () => {
            const contentState = ContentState.createFromText('Foo')

            expect(
                getMentionIds(contentState, TicketMessageSourceType.Email)
            ).toMatchSnapshot()
        })
    })
})
