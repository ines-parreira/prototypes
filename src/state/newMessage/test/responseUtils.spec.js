import {ContentState, EditorState, convertToRaw} from 'draft-js'
import addMention from '../../../pages/common/draftjs/plugins/mentions/modifiers/addMention'
import {fromJS} from 'immutable'
import {convertToRawWithoutMentions} from '../responseUtils'

describe('convertToRawWithoutMentions', () => {
    it('should return a raw contentState without any mention entities', () => {
        const editorState = EditorState.push(EditorState.createEmpty(), ContentState.createFromText('@Bob'))
        const newEditorState = addMention(editorState, fromJS({name: 'Bob', id: 8}), '@', '@', 'SEGMENTED')

        expect(convertToRaw(newEditorState.getCurrentContent()).entityMap).toHaveProperty('0')

        const raw = convertToRawWithoutMentions(newEditorState.getCurrentContent())
        expect(raw.entityMap).not.toHaveProperty('0')
    })
})
