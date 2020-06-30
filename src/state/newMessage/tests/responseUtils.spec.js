import {ContentState} from 'draft-js'
import {fromJS} from 'immutable'

import * as responseUtils from '../responseUtils'
import {convertToHTML} from '../../../utils/editor'

describe('addSignature', () => {
    it('should add plain text signature', () => {
        const signature = fromJS({
            text: 'Cruel World!',
            html: '<a href="#">Cruel World!</a>',
        })
        const contentState = ContentState.createFromText('')
        const newContentState = responseUtils.addSignature(
            contentState,
            signature
        )

        expect(newContentState.getPlainText()).toBe('\n\nCruel World!')
    })

    it('should add plain text signature (no html)', () => {
        const signature = fromJS({
            text: 'Cruel World!',
        })
        const contentState = ContentState.createFromText('')
        const newContentState = responseUtils.addSignature(
            contentState,
            signature
        )

        expect(newContentState.getPlainText()).toBe('\n\nCruel World!')
    })

    it('should add html signature', () => {
        const signature = fromJS({
            text: 'Cruel World!',
            html: '<a href="https://gorgias.io/">Cruel World!</a>',
        })
        const contentState = ContentState.createFromText('')
        const newContentState = responseUtils.addSignature(
            contentState,
            signature
        )
        expect(convertToHTML(newContentState)).toBe(
            '<br><br><div><a href="https://gorgias.io/" target="_blank">Cruel World!</a></div>'
        )
    })
})

describe('removeSignature', () => {
    it('should remove signature', () => {
        const signature = fromJS({
            text: 'Cruel World!',
            html: '<a href="https://gorgias.io/">Cruel World!</a>',
        })
        let newContentState = responseUtils.addSignature(
            ContentState.createFromText(''),
            signature
        )

        expect(newContentState.getPlainText()).not.toBe('')

        newContentState = responseUtils.removeSignature(
            newContentState,
            signature
        )
        expect(newContentState.getPlainText()).toBe('')
    })

    it('should not remove changed signature', () => {
        const signature = fromJS({
            text: 'Cruel World!',
            html: '<a href="https://gorgias.io/">Cruel World!</a>',
        })
        let newContentState = responseUtils.addSignature(
            ContentState.createFromText(''),
            signature
        )

        // change text in the first signature block.
        // simulates typing text in the first empty line above the signature.
        // all blocks are part of the signature ({data: {signature: true}} contentBlocks),
        // because the original contentState is blank.
        // it will match the signature blocks because of custom {signature: true} data,
        // but the editor contentBlocks should not match the signature contentBlocks.
        const blocks = newContentState.getBlocksAsArray().map((b, i) => {
            if (i === 0) {
                return b.set('text', 'Pizza Pepperoni')
            }
            return b
        })

        newContentState = responseUtils.removeSignature(
            ContentState.createFromBlockArray(blocks),
            signature
        )
        expect(newContentState.getPlainText()).toBe(
            'Pizza Pepperoni\n\nCruel World!'
        )
    })

    it('should not remove any text', () => {
        const signature = fromJS({
            text: 'Cruel World!',
            html: '<a href="https://gorgias.io/">Cruel World!</a>',
        })
        const newContentState = responseUtils.removeSignature(
            ContentState.createFromText('Pizza Pepperoni!'),
            signature
        )

        expect(newContentState.getPlainText()).toBe('Pizza Pepperoni!')
    })
})
