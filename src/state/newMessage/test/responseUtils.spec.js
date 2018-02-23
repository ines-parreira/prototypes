import {ContentState, EditorState, convertToRaw} from 'draft-js'
import addMention from '../../../pages/common/draftjs/plugins/mentions/modifiers/addMention'
import {fromJS} from 'immutable'
import * as responseUtils from '../responseUtils'
import {convertToHTML} from '../../../utils'

describe('convertToRawWithoutMentions', () => {
    it('should return a raw contentState without any mention entities', () => {
        const editorState = EditorState.push(EditorState.createEmpty(), ContentState.createFromText('@Bob'))
        const newEditorState = addMention(editorState, fromJS({name: 'Bob', id: 8}), '@', '@', 'SEGMENTED')

        expect(convertToRaw(newEditorState.getCurrentContent()).entityMap).toHaveProperty('0')

        const raw = responseUtils.convertToRawWithoutMentions(newEditorState.getCurrentContent())
        expect(raw.entityMap).not.toHaveProperty('0')
    })
})

describe('addSignature', () => {
    it('should add plain text signature', () => {
        const data = responseUtils.addSignature({
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
        const data = responseUtils.addSignature({
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

describe('removeSignature', () => {
    it('should remove signature', () => {
        const currentUser = fromJS({
            signature_text: 'Cruel World!',
            signature_html: '<a href="https://gorgias.io/">Cruel World!</a>',
        })
        const data = responseUtils.addSignature({
            action: {currentUser},
            state: fromJS({state: {}}),
            contentState: ContentState.createFromText('')
        })

        const newContentState = responseUtils.removeSignature(data.contentState, currentUser)
        expect(newContentState.getPlainText()).toBe('')
    })

    it('should not remove changed signature', () => {
        const currentUser = fromJS({
            signature_text: 'Cruel World!',
            signature_html: '<a href="https://gorgias.io/">Cruel World!</a>',
        })
        const data = responseUtils.addSignature({
            action: {currentUser},
            state: fromJS({state: {}}),
            contentState: ContentState.createFromText('')
        })

        // change text in the first signature block.
        // simulates typing text in the first empty line above the signature.
        // all blocks are part of the signature ({data: {signature: true}} contentBlocks),
        // because the original contentState is blank.
        // it will match the signature blocks because of custom {signature: true} data,
        // but the editor contentBlocks should not match the signature contentBlocks.
        const blocks = data.contentState.getBlocksAsArray().map((b, i) => {
            if (i === 0) {
                return b.set('text', 'Pizza Pepperoni')
            }
            return b
        })

        const newContentState = responseUtils.removeSignature(
            ContentState.createFromBlockArray(blocks),
            currentUser
        )
        expect(newContentState.getPlainText()).toBe('Pizza Pepperoni\n\nCruel World!')
    })

    it('should not remove any text', () => {
        const newContentState = responseUtils.removeSignature(
            ContentState.createFromText('Pizza Pepperoni!'),
            fromJS({
                signature_text: 'Cruel World!',
                signature_html: '<a href="https://gorgias.io/">Cruel World!</a>',
            })
        )

        expect(newContentState.getPlainText()).toBe('Pizza Pepperoni!')
    })
})
