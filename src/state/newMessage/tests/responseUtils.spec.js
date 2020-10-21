import {ContentState} from 'draft-js'
import {fromJS} from 'immutable'

import * as responseUtils from '../responseUtils.ts'
import {convertToHTML} from '../../../utils/editor.ts'
import {TicketMessageSourceType} from '../../../business/types/ticket'

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

describe('applyMacro', () => {
    it('should sanitize HTML for facebook messenger', () => {
        const context = {
            state: fromJS({
                newMessage: {
                    source: {
                        type: TicketMessageSourceType.FacebookMessenger,
                    },
                },
            }),
            action: {
                fromMacro: true,
                ticket: fromJS({}),
                currentUser: fromJS({}),
                args: fromJS({
                    body_html: `<div><strong>Hello, check this out</strong></div><br><figure style="display: inline-block; margin: 0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div><em>should be good now</em></div>`,
                    body_text: `Hello, check this out\n\n \n\nshould be good now`,
                }),
            },
        }
        const newContext: responseUtils.MessageContext = responseUtils.applyMacro(
            context
        )

        const expectedValue = `<div>Hello, check this out</div><br><figure style="display: inline-block; margin: 0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div>should be good now</div>`
        expect(convertToHTML(newContext.contentState)).toBe(expectedValue)
        expect(newContext.forceUpdate).toBe(true)
        expect(newContext.forceFocus).toBe(true)
    })

    it('should display all HTML', () => {
        const context = {
            state: fromJS({
                newMessage: {
                    source: {
                        type: TicketMessageSourceType.Email,
                    },
                },
            }),
            action: {
                fromMacro: true,
                ticket: fromJS({}),
                currentUser: fromJS({}),
                args: fromJS({
                    body_html: `<div><strong>Hello, check this out</strong></div><br><figure style="display: inline-block; margin: 0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div><em>should be good now</em></div>`,
                    body_text: `Hello, check this out\n\n \n\nshould be good now`,
                }),
            },
        }
        const newContext: responseUtils.MessageContext = responseUtils.applyMacro(
            context
        )

        const expectedValue = `<div><strong>Hello, check this out</strong></div><br><figure style="display: inline-block; margin: 0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div><em>should be good now</em></div>`
        expect(convertToHTML(newContext.contentState)).toBe(expectedValue)
        expect(newContext.forceUpdate).toBe(true)
        expect(newContext.forceFocus).toBe(true)
    })

    it('should display text only', () => {
        const context = {
            state: fromJS({
                newMessage: {
                    source: {
                        type: TicketMessageSourceType.Aircall,
                    },
                },
            }),
            action: {
                fromMacro: true,
                ticket: fromJS({}),
                currentUser: fromJS({}),
                args: fromJS({
                    body_html: `<div><strong>Hello, check this out</strong></div><br><figure style="display: inline-block; margin: 0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div><em>should be good now</em></div>`,
                    body_text: `Hello, check this out\n\n \n\nshould be good now`,
                }),
            },
        }
        const newContext: responseUtils.MessageContext = responseUtils.applyMacro(
            context
        )

        const expectedValue = `Hello, check this out\n\n \n\nshould be good now`

        expect(newContext.contentState.getPlainText()).toBe(expectedValue)
        expect(newContext.forceUpdate).toBe(true)
        expect(newContext.forceFocus).toBe(true)
    })

    it('should apply macro and extend existing state', () => {
        const existingState = ContentState.createFromText(
            'this is existing text'
        )

        const context = {
            contentState: existingState,
            state: fromJS({
                newMessage: {
                    source: {
                        type: TicketMessageSourceType.Aircall,
                    },
                },
            }),
            action: {
                fromMacro: true,
                ticket: fromJS({}),
                currentUser: fromJS({}),
                args: fromJS({
                    body_html: `<div><strong>Hello, check this out</strong></div><br><figure style="display: inline-block; margin: 0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div><em>should be good now</em></div>`,
                    body_text: `Hello, check this out\n\n \n\nshould be good now`,
                }),
            },
        }
        const newContext: responseUtils.MessageContext = responseUtils.applyMacro(
            context
        )

        const expectedValue = `this is existing text\nHello, check this out\n\n \n\nshould be good now`

        expect(newContext.contentState.getPlainText()).toBe(expectedValue)
        expect(newContext.forceUpdate).toBe(true)
        expect(newContext.forceFocus).toBe(true)
    })
})
