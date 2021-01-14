import {
    ContentState,
    ContentBlock,
    convertToRaw,
    SelectionState,
    EditorState,
} from 'draft-js'
import {fromJS} from 'immutable'

import {
    addSignature,
    removeSignature,
    applyMacro,
    MessageContext,
    addCache,
    updateCache,
} from '../responseUtils'
import {convertToHTML} from '../../../utils/editor'
import {TicketMessageSourceType} from '../../../business/types/ticket'
import {initialState as newMessageInitialState} from '../reducers'
import ticketReplyCache, {RawCachedTicket} from '../ticketReplyCache'
import {
    convertToRawWithoutPredictions,
    createPrediction,
    insertPrediction,
} from '../../../pages/common/draftjs/plugins/prediction/utils.js'

import {getMessageContextSnapshot} from './testUtils'

describe('responseUtils', () => {
    let defaultMessageContext: MessageContext

    beforeEach(() => {
        // Context is mutable, some util functions will modify it directly
        defaultMessageContext = {
            forceFocus: false,
            forceUpdate: false,
            contentState: ContentState.createFromText(''),
            state: newMessageInitialState,
            action: {
                ticketId: '0',
                fromMacro: false,
                signature: fromJS({}),
                ticket: fromJS({}),
                currentUser: fromJS({}),
                args: fromJS({
                    body_html: `<div><strong>Hello, check this out</strong></div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><br><div><em>should be good now</em></div>`,
                    body_text: `Hello, check this out\n\n \n\nshould be good now`,
                }),
            },
        }
    })

    describe('addSignature', () => {
        it('should add plain text signature', () => {
            const signature = fromJS({
                text: 'Cruel World!',
                html: '<a href="#">Cruel World!</a>',
            })
            const contentState = ContentState.createFromText('')
            const newContentState = addSignature(contentState, signature)

            expect(newContentState!.getPlainText()).toBe('\n\nCruel World!')
        })

        it('should add plain text signature (no html)', () => {
            const signature = fromJS({
                text: 'Cruel World!',
            })
            const contentState = ContentState.createFromText('')
            const newContentState = addSignature(contentState, signature)

            expect(newContentState!.getPlainText()).toBe('\n\nCruel World!')
        })

        it('should add html signature', () => {
            const signature = fromJS({
                text: 'Cruel World!',
                html: '<a href="https://gorgias.io/">Cruel World!</a>',
            })
            const contentState = ContentState.createFromText('')
            const newContentState = addSignature(contentState, signature)
            expect(convertToHTML(newContentState!)).toBe(
                '<div><br></div><div><br></div><div><a href="https://gorgias.io/" target="_blank">Cruel World!</a></div>'
            )
        })
    })

    describe('removeSignature', () => {
        it('should remove signature', () => {
            const signature = fromJS({
                text: 'Cruel World!',
                html: '<a href="https://gorgias.io/">Cruel World!</a>',
            })
            let newContentState = addSignature(
                ContentState.createFromText(''),
                signature
            )

            expect(newContentState!.getPlainText()).not.toBe('')

            newContentState = removeSignature(newContentState!, signature)
            expect(newContentState.getPlainText()).toBe('')
        })

        it('should not remove changed signature', () => {
            const signature = fromJS({
                text: 'Cruel World!',
                html: '<a href="https://gorgias.io/">Cruel World!</a>',
            })
            let newContentState = addSignature(
                ContentState.createFromText(''),
                signature
            )

            // change text in the first signature block.
            // simulates typing text in the first empty line above the signature.
            // all blocks are part of the signature ({data: {signature: true}} contentBlocks),
            // because the original contentState is blank.
            // it will match the signature blocks because of custom {signature: true} data,
            // but the editor contentBlocks should not match the signature contentBlocks.
            const blocks = newContentState!.getBlocksAsArray().map((b, i) => {
                if (i === 0) {
                    return b.set('text', 'Pizza Pepperoni')
                }
                return b
            })

            newContentState = removeSignature(
                ContentState.createFromBlockArray(blocks as ContentBlock[]),
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
            const newContentState = removeSignature(
                ContentState.createFromText('Pizza Pepperoni!'),
                signature
            )

            expect(newContentState.getPlainText()).toBe('Pizza Pepperoni!')
        })
    })

    describe('applyMacro', () => {
        let applyMacroContext: MessageContext

        beforeEach(() => {
            applyMacroContext = {
                ...defaultMessageContext,
                action: {
                    ...defaultMessageContext.action,
                    fromMacro: true,
                },
            }
        })

        it('should sanitize HTML for facebook messenger', () => {
            const context: MessageContext = {
                ...applyMacroContext,
                state: newMessageInitialState.setIn(
                    ['newMessage', 'source', 'type'],
                    TicketMessageSourceType.FacebookMessenger
                ),
            }
            const newContext = applyMacro(context)

            const expectedValue = `<div>Hello, check this out</div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><div><br></div><div>should be good now</div>`
            expect(convertToHTML(newContext.contentState)).toBe(expectedValue)
            expect(newContext.forceUpdate).toBe(true)
            expect(newContext.forceFocus).toBe(true)
        })

        it('should display all HTML for email', () => {
            const context: MessageContext = {
                ...applyMacroContext,
                state: newMessageInitialState.setIn(
                    ['newMessage', 'source', 'type'],
                    TicketMessageSourceType.Email
                ),
            }
            const newContext = applyMacro(context)

            const expectedValue = `<div><strong>Hello, check this out</strong></div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/image-e99e1a8a-990b-4df1-876d-cd1ced6df667.png" width="400px" style="max-width: 100%"></figure><div><br></div><div><em>should be good now</em></div>`
            expect(convertToHTML(newContext.contentState)).toBe(expectedValue)
            expect(newContext.forceUpdate).toBe(true)
            expect(newContext.forceFocus).toBe(true)
        })

        it('should display text only for aircall', () => {
            const context: MessageContext = {
                ...applyMacroContext,
                state: newMessageInitialState.setIn(
                    ['newMessage', 'source', 'type'],
                    TicketMessageSourceType.Aircall
                ),
            }
            const newContext = applyMacro(context)

            const expectedValue = `Hello, check this out\n\n \n\nshould be good now`
            expect(newContext.contentState.getPlainText()).toBe(expectedValue)
            expect(newContext.forceUpdate).toBe(true)
            expect(newContext.forceFocus).toBe(true)
        })

        it('should apply macro and extend existing state', () => {
            const existingState = ContentState.createFromText(
                'this is existing text'
            )
            const context: MessageContext = {
                ...applyMacroContext,
                contentState: existingState,
                state: newMessageInitialState.setIn(
                    ['newMessage', 'source', 'type'],
                    TicketMessageSourceType.Aircall
                ),
            }
            const newContext = applyMacro(context)

            const expectedValue = `this is existing text\nHello, check this out\n\n \n\nshould be good now`
            expect(newContext.contentState.getPlainText()).toBe(expectedValue)
            expect(newContext.forceUpdate).toBe(true)
            expect(newContext.forceFocus).toBe(true)
        })
    })

    describe('addCache', () => {
        let ticketReplyCacheGetSpy: jest.SpyInstance

        const cachedTicket: RawCachedTicket = {
            contentState: convertToRaw(
                ContentState.createFromText('Foo bar baz')
            ),
            selectionState: SelectionState.createEmpty('foo')
                .set('anchorOffset', '1')
                .set('focusKey', 'bar')
                .set('focusOffset', '2') as SelectionState,
            signatureAdded: true,
            macro: null,
            sourceType: TicketMessageSourceType.Email,
        }

        beforeEach(() => {
            ticketReplyCacheGetSpy = jest.spyOn(ticketReplyCache, 'get')
            ticketReplyCacheGetSpy.mockReturnValue(fromJS(cachedTicket))
        })

        afterEach(() => {
            ticketReplyCacheGetSpy.mockRestore()
        })

        it('should set cacheAdded in context to true and not restore the message from storage when cache is added', () => {
            const context: MessageContext = {
                ...defaultMessageContext,
                state: defaultMessageContext.state.setIn(
                    ['state', 'cacheAdded'],
                    true
                ),
            }
            addCache(context)
            expect(getMessageContextSnapshot(context)).toMatchSnapshot()
        })

        it('should not restore the message if action is from macro', () => {
            const context: MessageContext = {
                ...defaultMessageContext,
                action: {
                    ...defaultMessageContext.action,
                    fromMacro: true,
                },
            }
            addCache(context)
            expect(getMessageContextSnapshot(context)).toMatchSnapshot()
        })

        it('should restore message state from cache when cache is not added', () => {
            const context = {...defaultMessageContext}
            addCache(context)
            expect(getMessageContextSnapshot(context)).toMatchSnapshot()
        })
    })

    describe('updateCache', () => {
        let updateCacheContext: MessageContext
        let ticketReplyCacheDeleteSpy: jest.SpyInstance
        let ticketReplyCacheSetSpy: jest.SpyInstance

        beforeEach(() => {
            updateCacheContext = {
                ...defaultMessageContext,
                contentState: ContentState.createFromText('Foo bar baz'),
                selectionState: SelectionState.createEmpty('foo')
                    .set('anchorOffset', '1')
                    .set('focusKey', 'bar')
                    .set('focusOffset', '2') as SelectionState,
                sourceType: TicketMessageSourceType.Email,
                action: {
                    ...defaultMessageContext.action,
                    ticketId: 'foo-ticket',
                },
            }
            ticketReplyCacheDeleteSpy = jest.spyOn(ticketReplyCache, 'delete')
            ticketReplyCacheSetSpy = jest.spyOn(ticketReplyCache, 'set')
        })

        afterEach(() => {
            ticketReplyCacheDeleteSpy.mockRestore()
            ticketReplyCacheSetSpy.mockRestore()
        })

        it('should remove the cache item if message has no text', () => {
            const context: MessageContext = {
                ...updateCacheContext,
                contentState: ContentState.createFromText(''),
            }
            updateCache(context)
            expect(ticketReplyCacheDeleteSpy).toHaveBeenLastCalledWith(
                updateCacheContext.action.ticketId
            )
        })

        it('should remove the cache item if message contains only the signature', () => {
            const context: MessageContext = {
                ...updateCacheContext,
                contentState: ContentState.createFromText('\n\n--signature'),
                action: {
                    ...updateCacheContext.action,
                    signature: fromJS({text: '--signature'}),
                },
            }
            updateCache(context)
            expect(ticketReplyCacheDeleteSpy).toHaveBeenLastCalledWith(
                updateCacheContext.action.ticketId
            )
        })

        it('should update the cache with the message from context', () => {
            const {
                contentState,
                selectionState,
                sourceType,
                action: {ticketId},
            } = updateCacheContext
            updateCache(updateCacheContext)
            expect(ticketReplyCacheSetSpy).toHaveBeenLastCalledWith(ticketId, {
                contentState: convertToRaw(contentState),
                selectionState,
                sourceType,
            })
        })

        it('should remove predictions from the saved message', () => {
            const {
                contentState,
                selectionState,
                sourceType,
                action: {ticketId},
            } = updateCacheContext
            const editorState = EditorState.createWithContent(contentState)
            const predictionKey = createPrediction(
                'some prediction',
                editorState
            )
            const predictionEditorState = insertPrediction(
                predictionKey,
                editorState
            )
            const context = {
                ...updateCacheContext,
                contentState: predictionEditorState.getCurrentContent(),
            }
            updateCache(context)

            expect(ticketReplyCacheSetSpy).toHaveBeenLastCalledWith(ticketId, {
                contentState: convertToRawWithoutPredictions(
                    predictionEditorState.getCurrentContent()
                ),
                selectionState,
                sourceType,
            })
        })

        it('should update the cache if message is empty and has macro applied', () => {
            const context: MessageContext = {
                ...updateCacheContext,
                contentState: ContentState.createFromText(''),
                appliedMacro: fromJS({}),
            }
            const {
                contentState,
                selectionState,
                sourceType,
                action: {ticketId},
            } = context
            updateCache(context)
            expect(ticketReplyCacheSetSpy).toHaveBeenLastCalledWith(ticketId, {
                contentState: convertToRaw(contentState),
                selectionState,
                sourceType,
            })
        })

        it('should update the cache with signatureAdded value if signatureAdded is set in the context', () => {
            const context: MessageContext = {
                ...updateCacheContext,
                signatureAdded: true,
            }
            const {
                contentState,
                selectionState,
                sourceType,
                signatureAdded,
                action: {ticketId},
            } = context
            updateCache(context)
            expect(ticketReplyCacheSetSpy).toHaveBeenLastCalledWith(ticketId, {
                contentState: convertToRaw(contentState),
                selectionState,
                sourceType,
                signatureAdded,
            })
        })
    })
})
