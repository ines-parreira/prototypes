import {ContentState, EditorState, convertToRaw} from 'draft-js'
import addMention from '../../../pages/common/draftjs/plugins/mentions/modifiers/addMention'
import {fromJS} from 'immutable'
import {convertToRawWithoutMentions, addSignature} from '../responseUtils'
import {convertToHTML} from '../../../utils'

describe('convertToRawWithoutMentions', () => {
    it('should return a raw contentState without any mention entities', () => {
        const editorState = EditorState.push(EditorState.createEmpty(), ContentState.createFromText('@Bob'))
        const newEditorState = addMention(editorState, fromJS({name: 'Bob', id: 8}), '@', '@', 'SEGMENTED')

        expect(convertToRaw(newEditorState.getCurrentContent()).entityMap).toHaveProperty('0')

        const raw = convertToRawWithoutMentions(newEditorState.getCurrentContent())
        expect(raw.entityMap).not.toHaveProperty('0')
    })

    it('should add plain text signature', () => {
        const data = addSignature({
            action: {
                currentUser: fromJS({
                    signature_text: 'Cruel World!',
                    signature_html: '<a href="#">Cruel World!</a>',
                })
            },
            state: fromJS({
                state: {}
            }),
            contentState: ContentState.createFromText('')
        })

        expect(data.contentState.getPlainText()).toBe('\n\nCruel World!')
    })

    it('should add html signature', () => {
        const data = addSignature({
            action: {
                currentUser: fromJS({
                    signature_text: 'Cruel World!',
                    signature_html: '<a href="https://gorgias.io/">Cruel World!</a>',
                })
            },
            state: fromJS({
                state: {}
            }),
            contentState: ContentState.createFromText('')
        })

        expect(convertToHTML(data.contentState)).toBe('<br><br><div><a href="https://gorgias.io/" target="_blank">Cruel World!</a></div>')
    })
})
