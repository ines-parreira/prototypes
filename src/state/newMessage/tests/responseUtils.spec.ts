import {ContentState, convertToRaw, SelectionState, EditorState} from 'draft-js'
import {fromJS, Map} from 'immutable'

import {
    applyMacro,
    MessageContext,
    addCache,
    updateCache,
    toReplyAreaState,
    updateNewMessageWithContentState,
} from '../responseUtils'
import {convertToHTML} from '../../../utils/editor'
import {TicketMessageSourceType} from '../../../business/types/ticket'
import {initialState, initialState as newMessageInitialState} from '../reducers'
import ticketReplyCache, {RawCachedTicket} from '../ticketReplyCache'
import {
    convertToRawWithoutPredictions,
    createPrediction,
    insertPrediction,
} from '../../../pages/common/draftjs/plugins/prediction/utils'
import {addEmailExtraContent} from '../emailExtraUtils'
import {ticket} from '../../../fixtures/ticket'

import {getMessageContextSnapshot, getReplyAreaStateSnapshot} from './testUtils'

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

            expect(convertToHTML(newContext.contentState)).toMatchSnapshot()
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

            expect(convertToHTML(newContext.contentState)).toMatchSnapshot()
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
        const defaultCachedContentState =
            ContentState.createFromText('Foo bar baz')
        const defaultCachedTicket: RawCachedTicket = {
            contentState: convertToRaw(defaultCachedContentState),
            selectionState: SelectionState.createEmpty(
                defaultCachedContentState.getFirstBlock().getKey()
            )
                .set('anchorOffset', '1')
                .set('focusOffset', '2') as SelectionState,
            emailExtraAdded: false,
            macro: null,
            sourceType: TicketMessageSourceType.Email,
        }

        beforeEach(() => {
            ticketReplyCacheGetSpy = jest.spyOn(ticketReplyCache, 'get')
            ticketReplyCacheGetSpy.mockReturnValue(fromJS(defaultCachedTicket))
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

        it('should remove the email extras from the restored message', () => {
            const contentState = addEmailExtraContent(
                defaultCachedContentState,
                {
                    ticket,
                    replyThreadMessages: [],
                    isForwarded: false,
                    signature: fromJS({text: 'Signature'}),
                }
            )
            const context = {...defaultMessageContext}
            const cachedTicket: RawCachedTicket = {
                ...defaultCachedTicket,
                contentState: convertToRaw(contentState),
                emailExtraAdded: true,
            }
            ticketReplyCacheGetSpy.mockReturnValue(fromJS(cachedTicket))

            addCache(context)

            expect(getMessageContextSnapshot(context)).toMatchSnapshot()
        })

        it('it should set the selection to end of user content if the removed email extras were selected', () => {
            const contentState = addEmailExtraContent(
                defaultCachedContentState,
                {
                    ticket,
                    replyThreadMessages: [],
                    isForwarded: false,
                    signature: fromJS({text: 'Signature'}),
                }
            )
            const context = {...defaultMessageContext}
            const cachedTicket: RawCachedTicket = {
                ...defaultCachedTicket,
                contentState: convertToRaw(contentState),
                emailExtraAdded: true,
                selectionState: SelectionState.createEmpty(
                    contentState.getLastBlock().getKey()
                ),
            }
            ticketReplyCacheGetSpy.mockReturnValue(fromJS(cachedTicket))

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

        it('should update the cache with emailExtraAdded value if emailExtraAdded is set in the context', () => {
            const context: MessageContext = {
                ...updateCacheContext,
                emailExtraAdded: true,
            }
            const {
                contentState,
                selectionState,
                sourceType,
                emailExtraAdded,
                action: {ticketId},
            } = context
            updateCache(context)
            expect(ticketReplyCacheSetSpy).toHaveBeenLastCalledWith(ticketId, {
                contentState: convertToRaw(contentState),
                selectionState,
                sourceType,
                emailExtraAdded,
            })
        })

        it('should keep top rank macro state in the cache if not empty', () => {
            const topRankMacroState = {macroId: 10, state: 'pending' as const}
            const context: MessageContext = {
                ...updateCacheContext,
                contentState: ContentState.createFromText(''),
                topRankMacroState,
            }
            const {
                action: {ticketId},
            } = context
            updateCache(context)
            expect(ticketReplyCacheSetSpy).toHaveBeenLastCalledWith(ticketId, {
                topRankMacroState,
            })
        })
    })

    describe('toReplyAreaStateJS', () => {
        it('should convert immutable state to object', () => {
            const contentState = ContentState.createFromText('')
            const selectionState = SelectionState.createEmpty(
                contentState.getFirstBlock().getKey()
            )
            const replyAreaState = (
                fromJS({
                    emailExtraAdded: false,
                    appliedMacro: null,
                    cacheAdded: true,
                    dirty: false,
                    firstNewMessage: true,
                    forceFocus: true,
                    forceUpdate: true,
                }) as Map<any, any>
            )
                .set('contentState', contentState)
                .set('selectionState', selectionState)
            const replyAreaStateJS = toReplyAreaState(replyAreaState)
            expect(
                getReplyAreaStateSnapshot(replyAreaStateJS)
            ).toMatchSnapshot()
            expect(replyAreaStateJS.selectionState).toBe(selectionState)
        })
    })

    describe('updateNewMessageWithContentState', () => {
        it('should update body_html and body_text', () => {
            const newMessage = updateNewMessageWithContentState(
                (initialState.get('newMessage') as Map<any, any>).toJS(),
                ContentState.createFromText('Foo bar baz')
            )
            expect(newMessage).toMatchSnapshot()
        })

        it('should set stripped_text and stripped_body when contentState contains email extras', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo bar'),
                {
                    ticket,
                    replyThreadMessages: [],
                    isForwarded: false,
                    signature: fromJS({text: 'Signature'}),
                }
            )
            const newMessage = updateNewMessageWithContentState(
                (initialState.get('newMessage') as Map<any, any>).toJS(),
                contentState
            )
            expect(newMessage).toMatchSnapshot()
        })

        it('should unset emailExtraAdded, stripped_text and stripped_body when contentState does not contain email extras', () => {
            const contentStateWithExtras = addEmailExtraContent(
                ContentState.createFromText('Foo bar'),
                {
                    ticket,
                    replyThreadMessages: [],
                    isForwarded: false,
                    signature: fromJS({text: 'Signature'}),
                }
            )
            const prevNewMessage = updateNewMessageWithContentState(
                (initialState.get('newMessage') as Map<any, any>).toJS(),
                contentStateWithExtras
            )
            const newMessage = updateNewMessageWithContentState(
                prevNewMessage,
                ContentState.createFromText('No extras')
            )
            expect(newMessage).toMatchSnapshot()
        })

        it('should not mutate the arguments', () => {
            const prevNewMessage = (
                initialState.get('newMessage') as Map<any, any>
            ).toJS()

            updateNewMessageWithContentState(
                prevNewMessage,
                ContentState.createFromText('Foo bar baz')
            )

            expect(prevNewMessage).toMatchSnapshot()
        })
    })
})
