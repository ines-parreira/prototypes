import { EditorState, Modifier, SelectionState } from 'draft-js'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import createHorizontalRulePlugin, { HORIZONTAL_RULE_ENTITY } from '../index'

describe('horizontalRule plugin', () => {
    describe('onChange', () => {
        it('should insert horizontal rule when "---" is typed', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), '---')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState, pluginMethods)

            expect(result).not.toBe(editorState)

            const content = result.getCurrentContent()
            const blocks = content.getBlocksAsArray()
            const atomicBlock = blocks.find((b) => b.getType() === 'atomic')
            expect(atomicBlock).toBeDefined()

            if (atomicBlock) {
                const entityKey = atomicBlock.getEntityAt(0)
                expect(entityKey).toBeTruthy()
                const entity = content.getEntity(entityKey)
                expect(entity.getType()).toBe(HORIZONTAL_RULE_ENTITY)
            }
        })

        it('should not trigger for "----" (more than three dashes)', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), '----')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState, pluginMethods)

            expect(result).toBe(editorState)
        })

        it('should not trigger for "-- -" (dash space dash)', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), '-- -')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState, pluginMethods)

            expect(result).toBe(editorState)
        })

        it('should not trigger when block is not unstyled', () => {
            const plugin = createHorizontalRulePlugin()
            let editorState = typeText(EditorState.createEmpty(), '---')
            const content = editorState.getCurrentContent()
            const block = content.getFirstBlock()

            const blockSelection = SelectionState.createEmpty(block.getKey())
            const newContent = Modifier.setBlockType(
                content,
                blockSelection,
                'header-one',
            )
            editorState = EditorState.push(
                editorState,
                newContent,
                'change-block-type',
            )

            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState, pluginMethods)

            expect(result).toBe(editorState)
        })

        it('should not trigger when text is empty', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState, pluginMethods)

            expect(result).toBe(editorState)
        })

        it('should not trigger on selection-only change (same ContentState ref)', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            // First call processes the content (no match, but caches ContentState)
            plugin.onChange!(editorState, pluginMethods)

            // Second call with same ContentState ref should be a no-op
            const selectionOnlyState = EditorState.forceSelection(
                editorState,
                editorState.getSelection(),
            )
            const result = plugin.onChange!(selectionOnlyState, pluginMethods)

            expect(result).toBe(selectionOnlyState)
        })
    })

    describe('blockRendererFn', () => {
        it('should render horizontal rule component for atomic blocks with HR entity', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), '---')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const newState = plugin.onChange!(editorState, pluginMethods)
            pluginMethods.setEditorState(newState)

            const content = newState.getCurrentContent()
            const blocks = content.getBlocksAsArray()
            const atomicBlock = blocks.find((b) => b.getType() === 'atomic')

            if (atomicBlock) {
                const result = plugin.blockRendererFn!(
                    atomicBlock,
                    pluginMethods,
                )
                expect(result).toEqual({
                    component: expect.any(Function),
                    editable: false,
                })
            }
        })

        it('should return null for non-atomic blocks', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const content = editorState.getCurrentContent()
            const block = content.getFirstBlock()

            const result = plugin.blockRendererFn!(block, pluginMethods)
            expect(result).toBeNull()
        })

        it('should return null for atomic block without entity key', () => {
            const plugin = createHorizontalRulePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const content = editorState.getCurrentContent()
            const block = content.getFirstBlock()
            // Manually override type check so we can test the entity key branch
            const atomicBlock = block.set('type', 'atomic') as typeof block

            const result = plugin.blockRendererFn!(atomicBlock, pluginMethods)
            expect(result).toBeNull()
        })
    })

    describe('onChange - selection not collapsed', () => {
        it('should not trigger when selection is not collapsed', () => {
            const plugin = createHorizontalRulePlugin()
            let editorState = typeText(EditorState.createEmpty(), '---')
            const content = editorState.getCurrentContent()
            const block = content.getFirstBlock()

            const selection = SelectionState.createEmpty(block.getKey()).merge({
                anchorOffset: 0,
                focusOffset: 3,
            }) as SelectionState
            editorState = EditorState.forceSelection(editorState, selection)

            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState, pluginMethods)

            expect(result).toBe(editorState)
        })
    })
})
