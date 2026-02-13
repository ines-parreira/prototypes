import type { KeyboardEvent } from 'react'

import { AtomicBlockUtils, EditorState, SelectionState } from 'draft-js'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import type { PluginMethods } from '../../types'
import createPlugin, { isDisplayedAction } from '../index'
import { ActionName } from '../types'

describe('toolbar plugin', () => {
    const mockedPluginMethods: PluginMethods = {
        getEditorState: jest.fn(),
        setEditorState: jest.fn(),
        getProps: jest.fn(),
    }

    describe('isDisplayedAction', () => {
        it('should return true for any action when displayedActions is null', () => {
            expect(isDisplayedAction(ActionName.Bold, null)).toBe(true)
            expect(isDisplayedAction(ActionName.Link, null)).toBe(true)
            expect(isDisplayedAction(ActionName.Image, null)).toBe(true)
        })

        it('should return true for any action when displayedActions is undefined', () => {
            expect(isDisplayedAction(ActionName.Bold, undefined)).toBe(true)
            expect(isDisplayedAction(ActionName.Italic, undefined)).toBe(true)
        })

        it('should return false for Translate when displayedActions is null', () => {
            expect(isDisplayedAction(ActionName.Translate, null)).toBe(false)
        })

        it('should return false for Translate when displayedActions is undefined', () => {
            expect(isDisplayedAction(ActionName.Translate, undefined)).toBe(
                false,
            )
        })

        it('should return true for Translate when explicitly included in displayedActions', () => {
            expect(
                isDisplayedAction(ActionName.Translate, [ActionName.Translate]),
            ).toBe(true)
        })

        it('should return true when action is in displayedActions array', () => {
            expect(
                isDisplayedAction(ActionName.Bold, [
                    ActionName.Bold,
                    ActionName.Italic,
                ]),
            ).toBe(true)
        })

        it('should return false when action is not in displayedActions array', () => {
            expect(
                isDisplayedAction(ActionName.Bold, [ActionName.Italic]),
            ).toBe(false)
        })
    })

    describe('Mod+K keybinding', () => {
        it('should emit insert-link command if link active', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => [ActionName.Link],
                onLinkCreate: () => undefined,
                onLinkEdit: () => undefined,
            })

            const ctrlA = plugin.keyBindingFn!(
                {
                    key: 'a',
                    ctrlKey: true,
                } as KeyboardEvent,
                mockedPluginMethods,
            )
            const ctrlK = plugin.keyBindingFn!(
                {
                    key: 'k',
                    ctrlKey: true,
                    stopPropagation: jest.fn(),
                } as unknown as KeyboardEvent,
                mockedPluginMethods,
            )
            expect(ctrlA).not.toBe('insert-link')
            expect(ctrlK).toBe('insert-link')
        })

        it('should not emit insert-link keybinding if link not active', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => [],
                onLinkCreate: () => undefined,
                onLinkEdit: () => undefined,
            })
            const ctrlK = plugin.keyBindingFn!(
                {
                    key: 'k',
                    ctrlKey: true,
                } as KeyboardEvent,
                mockedPluginMethods,
            )
            expect(ctrlK).not.toBe('insert-link')
        })
    })

    describe('handleKeyCommand insert-link', () => {
        it('should remove link when selection is on an existing link entity', () => {
            const onLinkCreate = jest.fn()
            const onLinkEdit = jest.fn()
            const plugin = createPlugin({
                getDisplayedActions: () => [ActionName.Link],
                onLinkCreate,
                onLinkEdit,
            })

            let editorState = typeText(EditorState.createEmpty(), 'click here')
            const contentState = editorState.getCurrentContent()

            const contentWithEntity = contentState.createEntity(
                'link',
                'MUTABLE',
                { url: 'https://example.com' },
            )
            const entityKey = contentWithEntity.getLastCreatedEntityKey()

            const block = contentWithEntity.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).merge({
                anchorOffset: 0,
                focusOffset: 10,
            }) as SelectionState

            const { Modifier } = require('draft-js')
            const withEntity = Modifier.applyEntity(
                contentWithEntity,
                selection,
                entityKey,
            )

            editorState = EditorState.push(
                editorState,
                withEntity,
                'apply-entity',
            )
            editorState = EditorState.forceSelection(editorState, selection)

            const pluginMethods = mockPluginMethods(editorState)

            const result = plugin.handleKeyCommand!(
                'insert-link',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')
            expect(onLinkCreate).not.toHaveBeenCalled()
        })

        it('should call onLinkCreate when no link entity exists at selection', () => {
            const onLinkCreate = jest.fn()
            const onLinkEdit = jest.fn()
            const plugin = createPlugin({
                getDisplayedActions: () => [ActionName.Link],
                onLinkCreate,
                onLinkEdit,
            })

            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)

            const result = plugin.handleKeyCommand!(
                'insert-link',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')
            expect(onLinkCreate).toHaveBeenCalled()
        })

        it('should return not-handled for unknown commands', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => [ActionName.Link],
                onLinkCreate: jest.fn(),
                onLinkEdit: jest.fn(),
            })

            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)

            const result = plugin.handleKeyCommand!(
                'some-unknown-command',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })

        it('should apply LINK_HIGHLIGHT style when selection is not collapsed', () => {
            const onLinkCreate = jest.fn()
            const plugin = createPlugin({
                getDisplayedActions: () => [ActionName.Link],
                onLinkCreate,
                onLinkEdit: jest.fn(),
            })

            let editorState = typeText(EditorState.createEmpty(), 'hello world')
            const block = editorState.getCurrentContent().getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).merge({
                anchorOffset: 0,
                focusOffset: 5,
            }) as SelectionState
            editorState = EditorState.forceSelection(editorState, selection)

            const pluginMethods = mockPluginMethods(editorState)

            plugin.handleKeyCommand!('insert-link', editorState, pluginMethods)

            const newState = pluginMethods.getEditorState()
            const newBlock = newState.getCurrentContent().getFirstBlock()
            const hasHighlight = newBlock
                .getInlineStyleAt(0)
                .has('LINK_HIGHLIGHT')
            expect(hasHighlight).toBe(true)
        })
    })

    describe('blockRendererFn', () => {
        function createAtomicBlock(entityType: string) {
            let editorState = EditorState.createEmpty()
            const contentState = editorState.getCurrentContent()
            const contentWithEntity = contentState.createEntity(
                entityType,
                'IMMUTABLE',
                { src: 'test.png' },
            )
            const entityKey = contentWithEntity.getLastCreatedEntityKey()
            editorState = AtomicBlockUtils.insertAtomicBlock(
                EditorState.push(
                    editorState,
                    contentWithEntity,
                    'apply-entity',
                ),
                entityKey,
                ' ',
            )
            const blocks = editorState.getCurrentContent().getBlocksAsArray()
            const atomicBlock = blocks.find((b) => b.getType() === 'atomic')!
            return { editorState, atomicBlock }
        }

        it('should render Image component for img entity', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => null,
                onLinkCreate: jest.fn(),
                onLinkEdit: jest.fn(),
            })

            const { editorState, atomicBlock } = createAtomicBlock(
                draftjsGorgiasCustomBlockRenderers.Img,
            )
            const pluginMethods = mockPluginMethods(editorState)

            const result = plugin.blockRendererFn!(atomicBlock, pluginMethods)

            expect(result).not.toBeNull()
            expect(result!.component).toBeDefined()
            expect(result!.editable).toBe(false)
        })

        it('should render Video component for video entity', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => null,
                onLinkCreate: jest.fn(),
                onLinkEdit: jest.fn(),
            })

            const { editorState, atomicBlock } = createAtomicBlock(
                draftjsGorgiasCustomBlockRenderers.Video,
            )
            const pluginMethods = mockPluginMethods(editorState)

            const result = plugin.blockRendererFn!(atomicBlock, pluginMethods)

            expect(result).not.toBeNull()
            expect(result!.component).toBeDefined()
            expect(result!.editable).toBe(false)
        })

        it('should return null for non-atomic blocks', () => {
            const plugin = createPlugin({
                getDisplayedActions: () => null,
                onLinkCreate: jest.fn(),
                onLinkEdit: jest.fn(),
            })

            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            const block = editorState.getCurrentContent().getFirstBlock()

            const result = plugin.blockRendererFn!(block, pluginMethods)

            expect(result).toBeNull()
        })
    })
})
