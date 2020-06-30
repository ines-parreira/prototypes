// @flow
import {EditorState, SelectionState} from 'draft-js'

import {
    createEntityAndApplyToFirstBlockRange,
    debugBlockMap,
    debugEditorState,
    debugLastAppliedEntity,
    debugSelection,
    getLastCreatedEntity,
    getLastCreatedEntityRange,
    mockPluginMethods,
    pressBackspace,
    splitFirstBlock,
    typeText,
} from './draftTestUtils'

describe('draftTestUtils', () => {
    describe('mockPluginMethods()', () => {
        it('should persist the state on save', () => {
            const plugin = mockPluginMethods()
            const newState = typeText(plugin.getEditorState(), 'foo')
            plugin.setEditorState(newState)
            expect(
                plugin.getEditorState().getCurrentContent().getPlainText()
            ).toBe('foo')
        })
    })

    describe('typeText()', () => {
        it('should update editor text', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foo')
            expect(state.getCurrentContent().getPlainText()).toBe('foo')
        })

        it('should update selection', () => {
            let state = EditorState.createEmpty()

            state = typeText(state, 'foo')
            expect(state.getSelection().getStartOffset()).toBe(3)
            expect(state.getSelection().getEndOffset()).toBe(3)

            state = typeText(state, ' bar')
            expect(state.getSelection().getStartOffset()).toBe(7)
            expect(state.getSelection().getEndOffset()).toBe(7)
        })
    })

    describe('pressBackspace()', () => {
        it('should not change the empty state', () => {
            const state = EditorState.createEmpty()
            expect(pressBackspace(state)).toBe(state)
        })

        it('should delete the preceding char and update selection if selection is collapsed', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foo')
            state = pressBackspace(state)
            expect(state.getCurrentContent().getPlainText()).toBe('fo')
            expect(state.getSelection().getStartOffset()).toBe(2)
            expect(state.getSelection().getEndOffset()).toBe(2)
        })

        it('should delete the char in the preceding block if cursor is at the beginning of the block', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foobar')
            state = splitFirstBlock(state, 3)

            state = EditorState.forceSelection(
                state,
                state
                    .getSelection()
                    .set('anchorOffset', 0)
                    .set('focusOffset', 0)
            )

            state = pressBackspace(state)
            expect(state.getCurrentContent().getPlainText()).toBe('fo\nbar')

            const selection = state.getSelection()
            const firstBlockKey = state
                .getCurrentContent()
                .getFirstBlock()
                .getKey()
            expect(selection.getAnchorKey()).toBe(firstBlockKey)
            expect(selection.getFocusKey()).toBe(firstBlockKey)
            expect(selection.getStartOffset()).toBe(2)
            expect(selection.getEndOffset()).toBe(2)
        })

        it('should not change the state if cursor is at the beginning of the text', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foobar')
            const firstBlockKey = state
                .getCurrentContent()
                .getFirstBlock()
                .getKey()
            state = EditorState.forceSelection(
                state,
                state
                    .getSelection()
                    .set('anchorOffset', 0)
                    .set('anchorKey', firstBlockKey)
                    .set('focusOffset', 0)
                    .set('focusKey', firstBlockKey)
            )
            expect(pressBackspace(state)).toBe(state)
        })

        it('should delete the selection and update selection if selection not collapsed', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foo bar')

            state = EditorState.forceSelection(
                state,
                state
                    .getSelection()
                    .set('anchorOffset', 1)
                    .set('focusOffset', 5)
            )

            state = pressBackspace(state)
            expect(state.getCurrentContent().getPlainText()).toBe('far')
            expect(state.getSelection().getStartOffset()).toBe(1)
            expect(state.getSelection().getEndOffset()).toBe(1)
        })

        it('should delete selection spanning on multiple blocks', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foobar')
            state = splitFirstBlock(state, 3)

            state = EditorState.forceSelection(
                state,
                state
                    .getSelection()
                    .set('anchorOffset', 1)
                    .set(
                        'anchorKey',
                        state.getCurrentContent().getFirstBlock().getKey()
                    )
                    .set('focusOffset', 1)
                    .set(
                        'focusKey',
                        state.getCurrentContent().getLastBlock().getKey()
                    )
            )

            state = pressBackspace(state)
            expect(state.getCurrentContent().getPlainText()).toBe('far')
            expect(state.getSelection().getStartOffset()).toBe(1)
            expect(state.getSelection().getEndOffset()).toBe(1)
        })
    })

    describe('getLastCreatedEntity()', () => {
        it('should return null for empty state', () => {
            const state = EditorState.createEmpty()
            expect(getLastCreatedEntity(state.getCurrentContent())).toBeNull()
        })

        it('should return the last entity', () => {
            const state = EditorState.createEmpty()

            const fooEntity = {
                type: 'foo',
                mutability: 'IMMUTABLE',
                data: {
                    foo: 'bar',
                },
            }
            state
                .getCurrentContent()
                .createEntity(
                    fooEntity.type,
                    fooEntity.mutability,
                    fooEntity.data
                )
            let lastEntity = getLastCreatedEntity(state.getCurrentContent())
            expect((lastEntity: any).toJS()).toEqual(fooEntity)

            const barEntity = {
                type: 'bar',
                mutability: 'IMMUTABLE',
                data: {
                    bar: 'baz',
                },
            }
            state
                .getCurrentContent()
                .createEntity(
                    barEntity.type,
                    barEntity.mutability,
                    barEntity.data
                )
            lastEntity = getLastCreatedEntity(state.getCurrentContent())
            expect((lastEntity: any).toJS()).toEqual(barEntity)
        })
    })

    describe('getLastCreatedEntityRange()', () => {
        it('should return null for empty state', () => {
            const state = EditorState.createEmpty()
            expect(
                getLastCreatedEntityRange(state.getCurrentContent())
            ).toBeNull()
        })

        it('should return null for state with unapplied entity', () => {
            const state = EditorState.createEmpty()
            state
                .getCurrentContent()
                .createEntity('foo', 'IMMUTABLE', {foo: 'bar'})
            expect(
                getLastCreatedEntityRange(state.getCurrentContent())
            ).toBeNull()
        })

        it('should return range for applied entity', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foo')

            const range = [1, 2]
            state = createEntityAndApplyToFirstBlockRange(
                state,
                {
                    type: 'foo',
                    mutability: 'IMMUTABLE',
                    data: {},
                },
                range
            )

            expect(
                getLastCreatedEntityRange(state.getCurrentContent())
            ).toEqual(range)
        })
    })

    describe('debugSelection()', () => {
        it('should return formatted selection', () => {
            const selection = SelectionState.createEmpty('foo')
                .set('anchorOffset', 4)
                .set('focusOffset', 10)
                .set('focusKey', 'bar')
            expect(debugSelection(selection)).toBe('[foo] 4 - 10 [bar]')
        })

        it('should return only one value and key if selection is collapsed', () => {
            const selection = SelectionState.createEmpty('foo')
                .set('anchorOffset', 4)
                .set('focusOffset', 4)
            expect(debugSelection(selection)).toBe('[foo] 4')
        })

        it('should return only one key if selection is in the same block', () => {
            const selection = SelectionState.createEmpty('foo')
                .set('anchorOffset', 4)
                .set('focusOffset', 10)
            expect(debugSelection(selection)).toBe('[foo] 4 - 10')
        })

        it('should return two values if selection keys differ and offset not', () => {
            const selection = SelectionState.createEmpty('foo')
                .set('anchorOffset', 4)
                .set('focusOffset', 4)
                .set('focusKey', 'bar')
            expect(debugSelection(selection)).toBe('[foo] 4 - 4 [bar]')
        })
    })

    describe('debugBlockMap()', () => {
        it('should return simple block map representation', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foobar')
            state = splitFirstBlock(state, 3)
            expect(
                debugBlockMap(state.getCurrentContent().getBlockMap())
            ).toEqual({
                [state.getCurrentContent().getFirstBlock().getKey()]: 'foo',
                [state.getCurrentContent().getLastBlock().getKey()]: 'bar',
            })
        })
    })

    describe('debugLastAppliedEntity()', () => {
        it('should null for empty state', () => {
            const state = EditorState.createEmpty()
            expect(debugLastAppliedEntity(state.getCurrentContent())).toBeNull()
        })

        it('should null the unapplied entity', () => {
            const state = EditorState.createEmpty()
            const fooEntity = {
                type: 'foo',
                mutability: 'IMMUTABLE',
                data: {
                    foo: 'bar',
                },
            }
            state
                .getCurrentContent()
                .createEntity(
                    fooEntity.type,
                    fooEntity.mutability,
                    fooEntity.data
                )
            expect(debugLastAppliedEntity(state.getCurrentContent())).toBeNull()
        })

        it('should return range for applied entity', () => {
            let state = EditorState.createEmpty()
            state = typeText(state, 'foo')

            const entity = {
                type: 'foo',
                mutability: 'IMMUTABLE',
                data: {
                    foo: 'bar',
                },
            }
            const range = [1, 2]
            state = createEntityAndApplyToFirstBlockRange(state, entity, range)

            expect(debugLastAppliedEntity(state.getCurrentContent())).toEqual({
                ...entity,
                range,
            })
        })
    })

    describe('debugEditorState()', () => {
        it('should return debug information about the empty state', () => {
            const state = EditorState.createEmpty()
            const debug = debugEditorState(state)
            expect(debug).toHaveProperty('text', '')
            expect(debug).toHaveProperty(
                'selection',
                debugSelection(state.getSelection())
            )
            expect(debug).toHaveProperty('lastAppliedEntity', null)
            expect(debug).toHaveProperty('blocks')
        })
    })
})
