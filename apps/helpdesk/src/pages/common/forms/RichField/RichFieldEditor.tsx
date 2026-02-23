import type {
    ComponentProps,
    ComponentType,
    DragEvent,
    KeyboardEvent,
    MouseEvent,
    ReactNode,
} from 'react'
import type React from 'react'
import { Component } from 'react'

import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import type { ContentBlock, ContentState } from 'draft-js'
import {
    EditorState,
    getDefaultKeyBinding,
    KeyBindingUtil,
    Modifier,
    RichUtils,
    SelectionState,
} from 'draft-js'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import Editor, { composeDecorators } from 'draft-js-plugins-editor'
import createResizeablePlugin from 'draft-js-resizeable-plugin'
import type { List, Map } from 'immutable'
import _isEqual from 'lodash/isEqual'
import _noop from 'lodash/noop'
import _uniq from 'lodash/uniq'
import { marked } from 'marked'
import ReactPlayer from 'react-player'

import type { UploadType } from 'common/types'
import type { GuidanceVariableList } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import createAutoBlockPlugin from 'pages/common/draftjs/plugins/autoBlock'
import createClearFormattingPlugin from 'pages/common/draftjs/plugins/clearFormatting'
import createFindReplacePlugin from 'pages/common/draftjs/plugins/findReplace'
import createGuidanceVariablesPlugin from 'pages/common/draftjs/plugins/guidance-variables'
import createGuidanceActionsPlugin from 'pages/common/draftjs/plugins/guidanceActions'
import createHorizontalRulePlugin from 'pages/common/draftjs/plugins/horizontalRule'
import { handleListReturn } from 'pages/common/draftjs/plugins/listReturn'
import createSlashCommandPlugin from 'pages/common/draftjs/plugins/slashCommand'
import {
    addVideo,
    linkifyWithTemplate,
} from 'pages/common/draftjs/plugins/utils'
import { extractUrlsFromString } from 'utils'
import { linkify } from 'utils/linkify'

import type { notify } from '../../../../state/notifications/actions'
import type { ConnectedAction } from '../../../../state/types'
import {
    containsMarkdownSyntax,
    contentStateFromTextOrHTML,
    EditorHandledNotHandled,
    focusToTheEndOfContent,
    isValidSelectionKey,
    refreshEditor,
    removeMentions,
} from '../../../../utils/editor'
import { scrollToReactNode } from '../../../common/utils/keyboard'
import createConnectedLinksPlugin from '../../draftjs/plugins/connectedLinks'
import createDndUploadPlugin from '../../draftjs/plugins/dndUpload'
import createMentionPlugin from '../../draftjs/plugins/mentions'
import createPasteImagePlugin from '../../draftjs/plugins/pasteImage'
import createPredictionPlugin from '../../draftjs/plugins/prediction'
import { predictionKey } from '../../draftjs/plugins/prediction/state'
import { createQuotesPlugin } from '../../draftjs/plugins/quotes/quotesPlugin'
import Toolbar from '../../draftjs/plugins/toolbar/Toolbar'
import { ActionName } from '../../draftjs/plugins/toolbar/types'
import type { ImagePluginConfig, Plugin } from '../../draftjs/plugins/types'
import createVariablesPlugin from '../../draftjs/plugins/variables/index'
import { DraftJsErrorBoundary } from './DraftJsErrorBoundary'
import EmailExtraButton from './EmailExtraButton'
import type { InjectedProps as MentionFilteredSuggestionsProps } from './provideMentionSearchResults'
import provideMentionFilteredSuggestions from './provideMentionSearchResults'
import type { InjectedProps as ToolbarPluginProps } from './provideToolbarPlugin'
import provideToolbarPlugin from './provideToolbarPlugin'
import type { InjectedProps as GrammarlyUsageTrackingProps } from './withGrammarlyUsageTracking'
import withGrammarlyUsageTracking from './withGrammarlyUsageTracking'

import css from './RichFieldEditor.less'

import 'draft-js/dist/Draft.css'

function getEffectiveListStyle(block: ContentBlock): 'ordered' | 'unordered' {
    const visualListStyle = block.getData().get('visualListStyle') as
        | string
        | undefined
    if (visualListStyle === 'ordered') return 'ordered'
    if (visualListStyle === 'unordered') return 'unordered'
    return block.getType() === 'ordered-list-item' ? 'ordered' : 'unordered'
}

function isListBlock(block: ContentBlock): boolean {
    const type = block.getType()
    return type === 'ordered-list-item' || type === 'unordered-list-item'
}

function findChainContext(
    contentState: ContentState,
    block: ContentBlock,
    depth: number,
    effectiveStyle: 'ordered' | 'unordered',
): { chainStart: ContentBlock; hasStyleBreak: boolean } {
    let chainStart = block
    let prev: ContentBlock | undefined = contentState.getBlockBefore(
        block.getKey(),
    )
    while (prev) {
        if (prev.getDepth() > depth) {
            prev = contentState.getBlockBefore(prev.getKey())
            continue
        }
        if (prev.getDepth() < depth) break
        if (
            !isListBlock(prev) ||
            getEffectiveListStyle(prev) !== effectiveStyle
        )
            break
        chainStart = prev
        prev = contentState.getBlockBefore(prev.getKey())
    }

    let chainPrev: ContentBlock | undefined = contentState.getBlockBefore(
        chainStart.getKey(),
    )
    while (chainPrev && chainPrev.getDepth() > depth) {
        chainPrev = contentState.getBlockBefore(chainPrev.getKey())
    }
    const hasStyleBreak =
        !!chainPrev &&
        chainPrev.getDepth() === depth &&
        isListBlock(chainPrev) &&
        getEffectiveListStyle(chainPrev) !== effectiveStyle

    return { chainStart, hasStyleBreak }
}

function getStyleNestingLevel(
    contentState: ContentState,
    block: ContentBlock,
    effectiveStyle: 'ordered' | 'unordered',
): number {
    const depth = block.getDepth()
    if (depth === 0) return 0

    const { chainStart, hasStyleBreak } = findChainContext(
        contentState,
        block,
        depth,
        effectiveStyle,
    )
    if (hasStyleBreak) return 0

    let nestingLevel = 0
    let targetDepth = depth - 1
    let walkFrom: ContentBlock | undefined = contentState.getBlockBefore(
        chainStart.getKey(),
    )

    while (walkFrom && targetDepth >= 0) {
        if (walkFrom.getDepth() > targetDepth) {
            walkFrom = contentState.getBlockBefore(walkFrom.getKey())
            continue
        }
        if (walkFrom.getDepth() < targetDepth) break
        if (!isListBlock(walkFrom)) break
        if (getEffectiveListStyle(walkFrom) !== effectiveStyle) break

        const ancestorContext = findChainContext(
            contentState,
            walkFrom,
            targetDepth,
            effectiveStyle,
        )

        nestingLevel++
        if (ancestorContext.hasStyleBreak) break

        targetDepth--
        walkFrom = contentState.getBlockBefore(
            ancestorContext.chainStart.getKey(),
        )
    }

    return nestingLevel
}

const CUSTOM_STYLE_MAP = {
    LINK_HIGHLIGHT: {
        backgroundColor:
            'var(--surface-accent-secondary, rgba(0, 120, 255, 0.15))',
    },
}

type suggestionsType = List<any>
type canAddMentionType = boolean

type Props = {
    className?: string
    header?: ReactNode
    quickReply?: ReactNode
    editorState: EditorState
    onChange: (editorState: EditorState) => void
    displayOnly?: boolean
    emailExtraEnabled?: boolean
    onFocus: (event: MouseEvent<HTMLDivElement>) => void
    onBlur: () => void
    notify?: ConnectedAction<typeof notify>
    attachFiles?: (T: File[]) => void
    canDropFiles?: boolean
    canInsertInlineImages?: boolean
    mentionSuggestions?: suggestionsType
    canAddMention?: canAddMentionType
    buttons?: ReactNode[]
    displayedActions?: ActionName[]
    attachments?: List<any>
    editorKey?: string
    tabIndex?: number
    readOnly?: boolean
    spellCheck?: boolean
    predictionContext?: Map<any, any>
    predictionDebounce?: number
    ticket?: any
    isFocused: boolean
    isRequired?: boolean
    placeholder?: string
    placeholderBehavior?: 'gmail' | 'persistent'
    canAddVideoPlayer?: boolean
    onInsertVideoAddedFromPastedLink?: () => void
    maxLength?: number
    pattern?: string
    countCharacters?: boolean
    minHeight?: string | number
    noAutoScroll?: boolean
    uploadType?: UploadType
    getWorkflowVariables?: () => WorkflowVariableList
    getGuidanceVariables?: () => GuidanceVariableList
    onKeyDown?: (event: KeyboardEvent) => void
    isToolbarDisabled?: boolean
} & ToolbarPluginProps &
    MentionFilteredSuggestionsProps &
    GrammarlyUsageTrackingProps

type State = {
    isDragging: boolean
    wasEverFocused: boolean
    id: string
}

export class RichFieldEditor extends Component<Props, State> {
    static defaultProps: Pick<
        Props,
        | 'emailExtraEnabled'
        | 'notify'
        | 'attachFiles'
        | 'canDropFiles'
        | 'canInsertInlineImages'
        | 'isFocused'
        | 'canAddVideoPlayer'
        | 'onInsertVideoAddedFromPastedLink'
        | 'isToolbarDisabled'
    > = {
        emailExtraEnabled: false,
        notify: () => Promise.resolve(),
        attachFiles: _noop,
        canDropFiles: false,
        canInsertInlineImages: true,
        isFocused: false,
        canAddVideoPlayer: false,
        onInsertVideoAddedFromPastedLink: _noop,
        isToolbarDisabled: false,
    }

    plugins: Plugin[]

    editor: Editor | null = null
    editorWrapperRef: HTMLDivElement | null = null

    dndPlugin?: ReturnType<typeof createDndUploadPlugin>
    pasteImage?: ReturnType<typeof createPasteImagePlugin>
    blockBreakoutPlugin?: Plugin
    resizeablePlugin?: Plugin
    toolbarPlugin?: ReturnType<Props['createToolbarPlugin']>
    mentionPlugin?: ReturnType<typeof createMentionPlugin>
    connectedLinksPlugin?: ReturnType<typeof createConnectedLinksPlugin>
    variablesPlugin?: ReturnType<typeof createVariablesPlugin>
    quotesPlugin?: ReturnType<typeof createQuotesPlugin>
    predictionPlugin?: ReturnType<typeof createPredictionPlugin>
    workflowVariablesPlugin?: ReturnType<typeof createWorkflowVariablesPlugin>
    guidanceVariablesPlugin?: ReturnType<typeof createGuidanceVariablesPlugin>
    guidanceActionsPlugin?: ReturnType<typeof createGuidanceActionsPlugin>
    findReplacePlugin?: ReturnType<typeof createFindReplacePlugin>
    slashCommandPlugin?: ReturnType<typeof createSlashCommandPlugin>

    state: State = {
        isDragging: false,
        wasEverFocused: false,
        id: '',
    }

    constructor(props: Props) {
        super(props)
        this.plugins = this._createPlugins(props)
    }

    _createPlugins = (props: Props) => {
        const imagePluginProps = {
            notify: props.notify,
            getAttachFiles: this._getAttachFiles,
            getCanDropFiles: this._getCanDropFiles,
            getCanInsertInlineImages: this._getCanInsertInlineImages,
            uploadType: props.uploadType,
        }

        this.dndPlugin = createDndUploadPlugin(
            imagePluginProps as ImagePluginConfig,
        )
        this.pasteImage = createPasteImagePlugin(
            imagePluginProps as ImagePluginConfig,
        )
        this.blockBreakoutPlugin = createBlockBreakoutPlugin()
        this.resizeablePlugin = createResizeablePlugin({
            horizontal: 'absolute',
        })

        const imageDecorator = composeDecorators(
            // TODO(React18): Find a solution to casting to ReactNode once we upgrade to React 18 types
            this.resizeablePlugin.decorator as ReactNode,
        )

        this.toolbarPlugin = props.createToolbarPlugin(imageDecorator)

        this.mentionPlugin = createMentionPlugin()
        this.connectedLinksPlugin = createConnectedLinksPlugin()
        this.variablesPlugin = createVariablesPlugin()
        this.quotesPlugin = createQuotesPlugin()

        const plugins = [
            this.dndPlugin,
            this.blockBreakoutPlugin,
            this.resizeablePlugin,
            this.toolbarPlugin,
            this.mentionPlugin,
            this.connectedLinksPlugin,
            this.variablesPlugin,
            this.pasteImage,
            this.quotesPlugin,
        ]
        if (props.displayedActions?.includes(ActionName.WorkflowVariable)) {
            this.workflowVariablesPlugin = createWorkflowVariablesPlugin({
                getVariables: this.props.getWorkflowVariables,
            })
            plugins.push(this.workflowVariablesPlugin)
        }

        if (props.displayedActions?.includes(ActionName.GuidanceAction)) {
            this.guidanceActionsPlugin = createGuidanceActionsPlugin()

            plugins.push(this.guidanceActionsPlugin)
        }

        if (props.displayedActions?.includes(ActionName.GuidanceVariable)) {
            this.guidanceVariablesPlugin = createGuidanceVariablesPlugin({
                getVariables: this.props.getGuidanceVariables,
            })

            plugins.push(this.guidanceVariablesPlugin)
        }

        if (
            props.displayedActions?.includes(ActionName.GuidanceVariable) ||
            props.displayedActions?.includes(ActionName.GuidanceAction)
        ) {
            this.slashCommandPlugin = createSlashCommandPlugin({
                getVariables: this.props.getGuidanceVariables,
            })
            plugins.push(this.slashCommandPlugin)
        }

        if (
            props.displayedActions?.includes(ActionName.BulletedList) ||
            props.displayedActions?.includes(ActionName.OrderedList)
        ) {
            plugins.push(createAutoBlockPlugin())
            plugins.push(createHorizontalRulePlugin())
        }

        plugins.push(createClearFormattingPlugin())

        if (props.displayedActions?.includes(ActionName.FindReplace)) {
            this.findReplacePlugin = createFindReplacePlugin()
            plugins.push(this.findReplacePlugin)
        }

        if (this.props.predictionContext) {
            this.predictionPlugin = createPredictionPlugin({
                context: this.props.predictionContext,
                debounce: this.props.predictionDebounce,
            })

            plugins.push(this.predictionPlugin)
        }

        return plugins as Plugin[]
    }

    componentDidUpdate(prevProps: Props) {
        let { editorState } = this.props

        if (!this.props.canAddMention && prevProps.canAddMention) {
            editorState = removeMentions(editorState)
        }

        // Force re-render since decorators depend on displayed actions
        if (
            !_isEqual(prevProps.displayedActions, this.props.displayedActions)
        ) {
            editorState = refreshEditor(editorState)
        }

        if (editorState !== this.props.editorState) {
            this.handleChildChange(editorState)
        }

        if (!prevProps.isFocused && this.props.isFocused) {
            this._focusEditor()
        }

        // Force focus if content state was modified externally
        // Related bug: https://github.com/gorgias/gorgias/issues/4042
        // Underlying draft.js issue: https://github.com/facebook/draft-js/issues/1971
        if (
            this.props.isFocused &&
            !isValidSelectionKey(
                editorState,
                prevProps.editorState.getSelection(),
            )
        ) {
            this._focusEditor()
        }

        if (this.props.getGuidanceVariables) {
            this._handleSelectionChange()
        }
    }

    componentWillUnmount() {
        cancelAnimationFrame(this._selectionChangeRAF)
        shortcutManager.clear(['SpotlightModal', 'Dialpad', 'PhoneCall'])
        this.editorWrapperRef?.removeEventListener(
            'keydown',
            this._nativeTabHandler,
            true,
        )
        this.editorWrapperRef?.removeEventListener(
            'keydown',
            this._nativeFindHandler,
            true,
        )
        if (this.props.getGuidanceVariables) {
            this.editorWrapperRef?.removeEventListener(
                'copy',
                this._nativeCopyHandler,
                true,
            )
            this.editorWrapperRef?.removeEventListener(
                'cut',
                this._nativeCutHandler,
                true,
            )
            document.removeEventListener(
                'selectionchange',
                this._handleSelectionChange,
            )
        }
    }

    _getAttachFiles = () => this.props.attachFiles

    _getCanDropFiles = () => this.props.canDropFiles

    _getCanInsertInlineImages = () => this.props.canInsertInlineImages

    _focusEditor = () => {
        const { editorState, noAutoScroll } = this.props
        const { wasEverFocused } = this.state

        if (this.findReplacePlugin?.store.isOpen) return
        if (this.props.linkIsOpen) return

        if (!wasEverFocused) {
            this.setState({ wasEverFocused: true })
            if (!noAutoScroll) {
                this.handleChildChange(EditorState.moveFocusToEnd(editorState))
            }
        }
        setTimeout(() => {
            const editorAlreadyFocused = this.editorWrapperRef?.contains(
                document.activeElement,
            )
            if (this.editor) {
                if (this.findReplacePlugin?.store.isOpen) return
                if (this.props.linkIsOpen) return

                if (!editorAlreadyFocused) {
                    this.editor.focus()
                    if (!noAutoScroll) {
                        scrollToReactNode(this.editor as any)
                    }
                }

                shortcutManager.denylist([
                    'SpotlightModal',
                    'Dialpad',
                    'PhoneCall',
                ])
            }
        }, 0)
    }

    _handleReturn = () => {
        const { editorState } = this.props
        const listReturnState = handleListReturn(editorState)
        if (listReturnState) {
            const selection = listReturnState
                .getSelection()
                .merge({ hasFocus: true })
            this.handleChildChange(
                EditorState.forceSelection(listReturnState, selection),
            )
            return EditorHandledNotHandled.Handled
        }

        const selection = editorState.getSelection()
        const contentState = editorState.getCurrentContent()
        const block = contentState.getBlockForKey(selection.getStartKey())
        const blockType = block.getType()
        const visualListStyle = block.getData().get('visualListStyle')

        if (
            visualListStyle &&
            (blockType === 'ordered-list-item' ||
                blockType === 'unordered-list-item')
        ) {
            const splitContent = Modifier.splitBlock(contentState, selection)
            const afterSplit = EditorState.push(
                editorState,
                splitContent,
                'split-block',
            )

            const newContent = afterSplit.getCurrentContent()
            const newBlockKey = afterSplit.getSelection().getStartKey()
            const newBlock = newContent.getBlockForKey(newBlockKey)
            const fixedBlock = newBlock.merge({
                data: newBlock
                    .getData()
                    .set('visualListStyle', visualListStyle),
            }) as typeof newBlock

            const fixedContent = newContent.merge({
                blockMap: newContent.getBlockMap().set(newBlockKey, fixedBlock),
            }) as typeof newContent

            const focusedSelection = afterSplit
                .getSelection()
                .merge({ hasFocus: true })
            this.handleChildChange(
                EditorState.forceSelection(
                    EditorState.push(
                        afterSplit,
                        fixedContent,
                        'change-block-data',
                    ),
                    focusedSelection,
                ),
            )
            return EditorHandledNotHandled.Handled
        }

        return EditorHandledNotHandled.NotHandled
    }

    _handleKeyCommand = (command: string, latestEditorState?: EditorState) => {
        const editorState = latestEditorState || this.props.editorState

        if (command === 'select-all') {
            const content = editorState.getCurrentContent()
            const firstBlock = content.getFirstBlock()
            const lastBlock = content.getLastBlock()
            const selectAllSelection = new SelectionState({
                anchorKey: firstBlock.getKey(),
                anchorOffset: 0,
                focusKey: lastBlock.getKey(),
                focusOffset: lastBlock.getLength(),
                hasFocus: true,
            })
            this.handleChildChange(
                EditorState.forceSelection(editorState, selectAllSelection),
            )
            return EditorHandledNotHandled.Handled
        }

        if (command === 'unindent-block') {
            const content = editorState.getCurrentContent()
            const selection = editorState.getSelection()
            const block = content.getBlockForKey(selection.getStartKey())
            const blockKey = block.getKey()
            const newBlock = block.set(
                'depth',
                block.getDepth() - 1,
            ) as typeof block
            const newBlockMap = content.getBlockMap().set(blockKey, newBlock)
            const updatedContent = content.merge({
                blockMap: newBlockMap,
            }) as typeof content
            this.handleChildChange(
                EditorState.forceSelection(
                    EditorState.push(
                        editorState,
                        updatedContent,
                        'adjust-depth',
                    ),
                    selection,
                ),
            )
            return EditorHandledNotHandled.Handled
        }

        const selection = editorState.getSelection()
        if (
            (command === 'backspace' || command === 'delete') &&
            !selection.isCollapsed()
        ) {
            const content = editorState.getCurrentContent()
            const newContent = Modifier.removeRange(
                content,
                selection,
                command === 'backspace' ? 'backward' : 'forward',
            )
            this.handleChildChange(
                EditorState.push(editorState, newContent, 'remove-range'),
            )
            return EditorHandledNotHandled.Handled
        }

        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            this.handleChildChange(newState)
            return EditorHandledNotHandled.Handled
        }

        return EditorHandledNotHandled.NotHandled
    }

    _handleOnTab = (event: React.KeyboardEvent) => {
        event.preventDefault()
        const { editorState } = this.props
        const newState = RichUtils.onTab(event, editorState, 4)
        if (!newState || newState === editorState) return

        const oldContent = editorState.getCurrentContent()
        const newContent = newState.getCurrentContent()
        if (oldContent.getBlockMap().equals(newContent.getBlockMap())) return

        this.handleChildChange(newState)
    }

    _nativeFindHandler: EventListener = (event) => {
        const keyEvent = event as globalThis.KeyboardEvent
        if (
            (keyEvent.metaKey || keyEvent.ctrlKey) &&
            keyEvent.key === 'f' &&
            this.findReplacePlugin
        ) {
            event.preventDefault()
            event.stopPropagation()
            this.findReplacePlugin.open(true)
        }
    }

    _getSelectedText = (): string | null => {
        const { editorState } = this.props
        const selection = editorState.getSelection()
        if (selection.isCollapsed()) return null

        const contentState = editorState.getCurrentContent()
        const startKey = selection.getStartKey()
        const endKey = selection.getEndKey()
        const startOffset = selection.getStartOffset()
        const endOffset = selection.getEndOffset()

        const blocks = contentState.getBlockMap()
        const selectedBlocks = blocks
            .skipUntil((_, key) => key === startKey)
            .takeUntil((_, key) => key === endKey)
            .concat(blocks.filter((_, key) => key === endKey))

        const textParts: string[] = []
        selectedBlocks.forEach((block, key) => {
            if (!block) return
            const text = block.getText()
            if (key === startKey && key === endKey) {
                textParts.push(text.slice(startOffset, endOffset))
            } else if (key === startKey) {
                textParts.push(text.slice(startOffset))
            } else if (key === endKey) {
                textParts.push(text.slice(0, endOffset))
            } else {
                textParts.push(text)
            }
        })

        return textParts.join('\n')
    }

    _nativeCopyHandler: EventListener = (event) => {
        const text = this._getSelectedText()
        if (!text) return

        const clipboardEvent = event as ClipboardEvent
        clipboardEvent.clipboardData?.setData('text/plain', text)
        clipboardEvent.preventDefault()
    }

    _nativeCutHandler: EventListener = (event) => {
        const text = this._getSelectedText()
        if (!text) return

        const clipboardEvent = event as ClipboardEvent
        clipboardEvent.clipboardData?.setData('text/plain', text)
        clipboardEvent.preventDefault()

        const { editorState } = this.props
        const contentState = editorState.getCurrentContent()
        const selection = editorState.getSelection()
        const newContentState = Modifier.removeRange(
            contentState,
            selection,
            'backward',
        )
        const newEditorState = EditorState.push(
            editorState,
            newContentState,
            'remove-range',
        )
        this.handleChildChange(newEditorState)
    }

    _selectionChangeRAF = 0

    _handleSelectionChange = () => {
        cancelAnimationFrame(this._selectionChangeRAF)
        this._selectionChangeRAF = requestAnimationFrame(() => {
            if (!this.editorWrapperRef) return
            const sel = window.getSelection()
            const hasRange = sel && sel.rangeCount > 0 && !sel.isCollapsed
            const range = hasRange ? sel.getRangeAt(0) : null
            const entities = this.editorWrapperRef.querySelectorAll(
                '[data-guidance-entity]',
            )
            entities.forEach((node) => {
                if (range && range.intersectsNode(node)) {
                    node.setAttribute('data-selected', '')
                } else {
                    node.removeAttribute('data-selected')
                }
            })
        })
    }

    _nativeTabHandler: EventListener = (event) => {
        const keyEvent = event as globalThis.KeyboardEvent
        if (keyEvent.key !== 'Tab') return

        const target = event.target as HTMLElement
        if (target.closest('[data-find-replace-dialog]')) return
        if (predictionKey.get()) return

        event.preventDefault()
        event.stopPropagation()

        const { editorState } = this.props
        const newState = RichUtils.onTab(
            keyEvent as unknown as React.KeyboardEvent,
            editorState,
            4,
        )

        const oldContent = editorState.getCurrentContent()
        const newContent = newState?.getCurrentContent()

        const listTabWorked =
            newState &&
            newState !== editorState &&
            newContent &&
            !oldContent.getBlockMap().equals(newContent.getBlockMap())

        if (listTabWorked) {
            this.handleChildChange(newState)
        } else {
            const selection = editorState.getSelection()
            const block = oldContent.getBlockForKey(selection.getStartKey())
            const blockType = block.getType()

            if (
                blockType === 'unordered-list-item' ||
                blockType === 'ordered-list-item'
            ) {
                // RichUtils.onTab already handled list items (or correctly no-oped)
            } else if (
                keyEvent.shiftKey ||
                (selection.getStartOffset() === 0 && selection.isCollapsed())
            ) {
                const depth = block.getDepth()
                const newDepth = keyEvent.shiftKey
                    ? Math.max(0, depth - 1)
                    : Math.min(4, depth + 1)

                if (newDepth !== depth) {
                    const blockKey = block.getKey()
                    const newBlock = block.set(
                        'depth',
                        newDepth,
                    ) as typeof block
                    const newBlockMap = oldContent
                        .getBlockMap()
                        .set(blockKey, newBlock)
                    const updatedContent = oldContent.merge({
                        blockMap: newBlockMap,
                    }) as typeof oldContent

                    this.handleChildChange(
                        EditorState.forceSelection(
                            EditorState.push(
                                editorState,
                                updatedContent,
                                'adjust-depth',
                            ),
                            editorState.getSelection(),
                        ),
                    )
                }
            }
        }

        setTimeout(() => {
            if (
                this.editor &&
                !this.editorWrapperRef?.contains(document.activeElement)
            ) {
                this.editor.focus()
            }
        }, 0)
    }

    _blockStyleFn = (block: ContentBlock): string => {
        const type = block.getType()
        const classes: string[] = []

        const isOrderedList = type === 'ordered-list-item'
        const isUnorderedList = type === 'unordered-list-item'

        if (isOrderedList || isUnorderedList) {
            const depth = block.getDepth()
            const effectiveStyle = getEffectiveListStyle(block)

            classes.push(css.listItem)
            classes.push(
                effectiveStyle === 'ordered'
                    ? css.listOrdered
                    : css.listUnordered,
            )

            const depthClass = css[`listDepth${depth}` as keyof typeof css]
            if (depthClass) classes.push(depthClass)

            const contentState = this.props.editorState.getCurrentContent()

            const nestingLevel = getStyleNestingLevel(
                contentState,
                block,
                effectiveStyle,
            )
            const markerClass =
                css[`markerStyle${nestingLevel % 3}` as keyof typeof css]
            if (markerClass) classes.push(markerClass)

            const blockBefore = contentState.getBlockBefore(block.getKey())

            const shouldReset = (() => {
                if (!blockBefore) return true

                const prevType = blockBefore.getType()
                const isPrevList =
                    prevType === 'ordered-list-item' ||
                    prevType === 'unordered-list-item'
                if (!isPrevList) return true

                const prevDepth = blockBefore.getDepth()
                if (prevDepth < depth) return true
                if (prevDepth > depth) return false

                return getEffectiveListStyle(blockBefore) !== effectiveStyle
            })()

            if (shouldReset) {
                const resetClass =
                    css[`listResetDepth${depth}` as keyof typeof css]
                if (resetClass) classes.push(resetClass)
            }
        } else {
            const depth = block.getDepth()
            if (depth > 0) {
                const depthClass = css[`blockDepth${depth}` as keyof typeof css]
                if (depthClass) classes.push(depthClass)
            }
        }

        return classes.filter(Boolean).join(' ')
    }

    _setEditorWrapperRef = (ref: HTMLDivElement | null) => {
        if (this.editorWrapperRef) {
            this.editorWrapperRef.removeEventListener(
                'keydown',
                this._nativeTabHandler,
                true,
            )
            this.editorWrapperRef.removeEventListener(
                'keydown',
                this._nativeFindHandler,
                true,
            )
            if (this.props.getGuidanceVariables) {
                this.editorWrapperRef.removeEventListener(
                    'copy',
                    this._nativeCopyHandler,
                    true,
                )
                this.editorWrapperRef.removeEventListener(
                    'cut',
                    this._nativeCutHandler,
                    true,
                )
                document.removeEventListener(
                    'selectionchange',
                    this._handleSelectionChange,
                )
            }
        }
        this.editorWrapperRef = ref
        if (ref) {
            ref.addEventListener('keydown', this._nativeTabHandler, true)
            ref.addEventListener('keydown', this._nativeFindHandler, true)
            if (this.props.getGuidanceVariables) {
                ref.addEventListener('copy', this._nativeCopyHandler, true)
                ref.addEventListener('cut', this._nativeCutHandler, true)
                document.addEventListener(
                    'selectionchange',
                    this._handleSelectionChange,
                )
            }
        }
    }

    _handlePastedText = (
        text: string,
        html: string | undefined,
        editorState: EditorState,
    ) => {
        if (!this.editor) {
            return
        }

        // detect content copied from draft-js itself, and don't convert it.
        // fixes issues with doubling newlines
        // https://github.com/gorgias/gorgias/pull/3373#issuecomment-392855428
        // use the same method as draft-js to detect draft-js-content
        // https://github.com/facebook/draft-js/blob/0ce20bcc6ac18b24b06945d54f1a4a692eee8cc9/src/component/handlers/edit/editOnPaste.js#L123
        if (html && html.indexOf(this.editor.getEditorKey()) !== -1) {
            return EditorHandledNotHandled.NotHandled
        }

        const selection = editorState.getSelection()
        if (!selection.isCollapsed() && text && !html) {
            const trimmedText = text.trim()
            if (linkify.test(trimmedText)) {
                const url = linkifyWithTemplate(trimmedText)
                let contentState = editorState
                    .getCurrentContent()
                    .createEntity('link', 'MUTABLE', {
                        url,
                        target: '_blank',
                    })
                const entityKey = contentState.getLastCreatedEntityKey()
                contentState = Modifier.applyEntity(
                    contentState,
                    selection,
                    entityKey,
                )
                const newEditorState = EditorState.push(
                    editorState,
                    contentState,
                    'apply-entity',
                )
                this.handleChildChange(newEditorState)
                return EditorHandledNotHandled.Handled
            }
        }

        const resolvedHtml =
            html ||
            (text && containsMarkdownSyntax(text)
                ? (marked.parse(text) as string)
                : text
                  ? `<div>${text.replace(/\n/g, '<br>')}</div>`
                  : undefined)

        // manually convert pasted text/html with draft-convert to preserve newlines and empty blocks.
        // by default draft-js's convertFromHTML tries to clean-up the html, and remove extra newlines.
        // https://github.com/facebook/draft-js/issues/231
        const contentState = Modifier.replaceWithFragment(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            contentStateFromTextOrHTML(text, resolvedHtml).getBlockMap(),
        )

        let newEditorState = (
            EditorState.push as (
                editorState: EditorState,
                contentState: ContentState,
            ) => EditorState
        )(editorState, contentState)

        // Automatically inject a video player at the bottom when content pasted is a video link. When applicable.
        newEditorState = this._insertExtraVideoOnPastedTextIfApplicable(
            newEditorState,
            text,
        )

        this.handleChildChange(newEditorState)

        // draft-js-plugins-editor requires `handled`, instead of `true` like the native draft-js instance,
        // to prevent the default behavior.
        return EditorHandledNotHandled.Handled
    }

    _insertExtraVideoOnPastedTextIfApplicable = (
        editorState: EditorState,
        text: string,
    ): EditorState => {
        let newEditorState = editorState

        if (this.props.canAddVideoPlayer) {
            const urls =
                _uniq(
                    extractUrlsFromString(text)?.filter((url) =>
                        ReactPlayer.canPlay(url),
                    ),
                ) || []

            urls.forEach((url) => {
                newEditorState = focusToTheEndOfContent(newEditorState)
                newEditorState = addVideo(newEditorState, url)
            })

            urls.length && this.props.onInsertVideoAddedFromPastedLink?.()
        }

        return newEditorState
    }

    _runPlugins = (editorState: EditorState) => {
        // run plugins onChange on the editor state
        // comes from Editor internal onChange function https://github.com/draft-js-plugins/draft-js-plugins/blob/55eb3b845d7e776a10def7f388624cf4c9879f5a/draft-js-plugins-editor/src/Editor/index.js#L92
        let nextEditorState = editorState
        if (this.editor) {
            this.editor.resolvePlugins().forEach((plugin) => {
                if (plugin.onChange && this.editor) {
                    nextEditorState = plugin.onChange(
                        nextEditorState,
                        this.editor.getPluginMethods(),
                    )
                }
            })
        }

        return nextEditorState
    }

    handleChildChange = (editorState: EditorState) => {
        // run plugins
        this.props.onChange(this._runPlugins(editorState))
    }

    _onDragOver = () => this.setState({ isDragging: true })

    _onDragLeave = () => this.setState({ isDragging: false })

    _onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        this.setState({ isDragging: false })
    }

    _onEditorFocus = (event: MouseEvent<HTMLDivElement>) => {
        shortcutManager.denylist(['SpotlightModal', 'Dialpad', 'PhoneCall'])
        const { onFocus, detectGrammarly } = this.props
        onFocus(event)
        detectGrammarly()
    }

    _onEditorBlur = () => {
        this.props.onBlur()
        shortcutManager.clear(['SpotlightModal', 'Dialpad', 'PhoneCall'])
    }

    _customKeyBindingFn = (e: KeyboardEvent) => {
        this.props.onKeyDown?.(e)
        if (e.key === 'Enter' && KeyBindingUtil.hasCommandModifier(e)) {
            return null
        }

        if (e.key === 'a' && KeyBindingUtil.hasCommandModifier(e)) {
            return 'select-all'
        }

        if (e.key === 'Backspace') {
            const { editorState } = this.props
            const selection = editorState.getSelection()
            if (selection.isCollapsed() && selection.getStartOffset() === 0) {
                const content = editorState.getCurrentContent()
                const block = content.getBlockForKey(selection.getStartKey())
                const blockType = block.getType()
                if (
                    block.getDepth() > 0 &&
                    blockType !== 'unordered-list-item' &&
                    blockType !== 'ordered-list-item'
                ) {
                    return 'unindent-block'
                }
            }
        }

        if (KeyBindingUtil.hasCommandModifier(e) || e.altKey) {
            return undefined
        }

        if (e.key === ' ') {
            return undefined
        }

        return getDefaultKeyBinding(e)
    }

    render() {
        const {
            className,
            isRequired,
            pattern,
            displayOnly,
            onFocus,
            emailExtraEnabled,
            ticket,
            header,
            uploadType,
        } = this.props
        // $TsFixMe remove casting after migrating createMentionPlugin
        const { MentionSuggestions } = this.mentionPlugin as {
            MentionSuggestions: ComponentType<{
                onSearchChange: (arg: { value: string }) => void
                suggestions: List<any>
                canAddMention: boolean
            }>
        }
        const pluginMethods = this.editor?.getPluginMethods()

        return (
            <div
                className={classnames(className, 'rich-textarea-wrapper', {
                    'display-only': displayOnly,
                })}
            >
                <div
                    className={classnames('editor-wrapper', {
                        drop: this.state.isDragging,
                    })}
                    ref={this._setEditorWrapperRef}
                    onClick={onFocus}
                    onDragOver={this._onDragOver}
                    onDragLeave={this._onDragLeave}
                    onDrop={this._onDrop}
                    {...(this.props.minHeight && {
                        style: {
                            minHeight: this.props.minHeight,
                        },
                    })}
                >
                    <div
                        className={classnames({
                            [css.withMinHeight]:
                                !this.props.quickReply && !this.props.minHeight,
                        })}
                    >
                        {this.findReplacePlugin && (
                            <this.findReplacePlugin.FindReplaceDialog
                                store={this.findReplacePlugin.store}
                                onSearchChange={
                                    this.findReplacePlugin.onSearchChange
                                }
                                onReplaceChange={
                                    this.findReplacePlugin.onReplaceChange
                                }
                                onFindNext={this.findReplacePlugin.onFindNext}
                                onFindPrevious={
                                    this.findReplacePlugin.onFindPrevious
                                }
                                onReplace={this.findReplacePlugin.onReplace}
                                onReplaceAll={
                                    this.findReplacePlugin.onReplaceAll
                                }
                                onClose={this.findReplacePlugin.close}
                                onToggleReplace={
                                    this.findReplacePlugin.toggleReplace
                                }
                            />
                        )}
                        {header}
                        <DraftJsErrorBoundary
                            onError={(error) => {
                                console.error(
                                    '[RichFieldEditor] Speech-to-text caused error:',
                                    error,
                                )
                            }}
                        >
                            <Editor
                                editorState={this.props.editorState}
                                onChange={this.handleChildChange}
                                keyBindingFn={this._customKeyBindingFn}
                                handleReturn={this._handleReturn}
                                onFocus={this._onEditorFocus}
                                onBlur={this._onEditorBlur}
                                plugins={this.plugins}
                                handleKeyCommand={this._handleKeyCommand}
                                onTab={this._handleOnTab}
                                handlePastedText={this._handlePastedText}
                                readOnly={displayOnly || this.props.readOnly}
                                customStyleMap={CUSTOM_STYLE_MAP}
                                blockStyleFn={this._blockStyleFn}
                                placeholder={
                                    this.props.placeholderBehavior ===
                                    'persistent'
                                        ? this.props.placeholder
                                        : !this.state.wasEverFocused
                                          ? this.props.placeholder
                                          : undefined
                                }
                                ref={(editor: Editor | null) => {
                                    this.editor = editor
                                }}
                                editorKey={this.props.editorKey}
                                tabIndex={this.props.tabIndex}
                                spellCheck={this.props.spellCheck}
                                ticket={ticket}
                            />
                        </DraftJsErrorBoundary>
                        <MentionSuggestions
                            onSearchChange={this.props.onMentionSearchChange}
                            suggestions={this.props.mentionSearchResults}
                            canAddMention={!!this.props.canAddMention}
                        />
                        {this.slashCommandPlugin && (
                            <this.slashCommandPlugin.SlashCommandSuggestions />
                        )}
                        {(isRequired || pattern) && (
                            <input
                                value={this.props.editorState
                                    .getCurrentContent()
                                    .getPlainText()}
                                style={{
                                    opacity: 0,
                                    height: 0,
                                    padding: 0,
                                    margin: 'none',
                                    overflow: 'hidden',
                                }}
                                required={isRequired}
                                pattern={pattern}
                            />
                        )}
                    </div>

                    {emailExtraEnabled && (
                        <EmailExtraButton
                            editorState={this.props.editorState}
                        />
                    )}
                </div>
                {pluginMethods && (
                    <Toolbar
                        {...(this.props as unknown as ComponentProps<
                            typeof Toolbar
                        >)}
                        canDropFiles={!!this.props.canDropFiles}
                        uploadType={uploadType}
                        {...pluginMethods}
                        getWorkflowVariables={this.props.getWorkflowVariables}
                        isToolbarDisabled={this.props.isToolbarDisabled}
                    />
                )}
            </div>
        )
    }
}

export default withGrammarlyUsageTracking(
    provideToolbarPlugin(provideMentionFilteredSuggestions(RichFieldEditor)),
)
