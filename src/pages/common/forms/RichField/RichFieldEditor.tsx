import classnames from 'classnames'
import {EditorState, Modifier, RichUtils, ContentState} from 'draft-js'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import Editor, {composeDecorators} from 'draft-js-plugins-editor'
import createResizeablePlugin from 'draft-js-resizeable-plugin'
import 'draft-js/dist/Draft.css'
import {Map, List} from 'immutable'
import _isEqual from 'lodash/isEqual'
import _noop from 'lodash/noop'
import React, {
    ReactNode,
    ComponentType,
    MouseEvent,
    DragEvent,
    ComponentProps,
} from 'react'

import {ConnectedAction} from '../../../../state/types'
import {notify} from '../../../../state/notifications/actions'
import {scrollToReactNode} from '../../../common/utils/keyboard'

import createConnectedLinksPlugin from '../../draftjs/plugins/connectedLinks/index.js'
import createDndUploadPlugin from '../../draftjs/plugins/dndUpload'
import createMentionPlugin from '../../draftjs/plugins/mentions/index.js'
import createPasteImagePlugin from '../../draftjs/plugins/pasteImage'
import createVariablesPlugin from '../../draftjs/plugins/variables/index.js'
import createPredictionPlugin from '../../draftjs/plugins/prediction'
import {createQuotesPlugin} from '../../draftjs/plugins/quotes/quotesPlugin'

import InputField from '../InputField.js'
import {ActionName} from '../../draftjs/plugins/toolbar/types'
import {Plugin} from '../../draftjs/plugins/types'
import {
    contentStateFromTextOrHTML,
    isValidSelectionKey,
    refreshEditor,
    removeMentions,
} from '../../../../utils/editor'

import EmailExtraButton from './EmailExtraButton'
import provideToolbarPlugin, {
    InjectedProps as ToolbarPluginProps,
} from './provideToolbarPlugin'
import provideMentionFilteredSuggestions, {
    InjectedProps as MentionFilteredSuggestionsProps,
} from './provideMentionSearchResults'
import withGrammarlyUsageTracking, {
    InjectedProps as GrammarlyUsageTrackingProps,
} from './withGrammarlyUsageTracking'
import Toolbar from './Toolbar'
import css from './RichFieldEditor.less'

type suggestionsType = List<any>
type canAddMentionType = boolean

export type Props = {
    quickReply?: ReactNode
    editorState: EditorState
    onChange: (editorState: EditorState) => void
    required: boolean
    displayOnly: boolean
    emailExtraEnabled: boolean
    isFocused: boolean
    onFocus: (event: MouseEvent<HTMLDivElement>) => void
    onBlur: () => void
    placeholder: string
    notify: ConnectedAction<typeof notify>
    attachFiles: (T: File[]) => void
    canDropFiles: boolean
    canInsertInlineImages: boolean
    mentionSuggestions?: suggestionsType
    canAddMention?: canAddMentionType
    buttons?: ReactNode[]
    displayedActions?: ActionName[]
    attachments?: List<any>
    editorKey?: string
    tabIndex?: number
    readOnly?: boolean
    spellCheck?: boolean
    predictionContext: Map<any, any>
    ticket: any
} & ToolbarPluginProps &
    MentionFilteredSuggestionsProps &
    GrammarlyUsageTrackingProps

type State = {
    isDragging: boolean
    wasEverFocused: boolean
}

export class RichFieldEditor extends InputField<Props, State> {
    static defaultProps: Pick<
        Props,
        | 'emailExtraEnabled'
        | 'notify'
        | 'attachFiles'
        | 'canDropFiles'
        | 'canInsertInlineImages'
        | 'isFocused'
    > &
        Pick<ComponentProps<typeof InputField>, 'type'> = {
        emailExtraEnabled: false,
        type: 'text',
        notify: () => Promise.resolve(),
        attachFiles: _noop,
        canDropFiles: false,
        canInsertInlineImages: true,
        isFocused: false,
    }

    plugins: Plugin[]

    editor: Editor | null = null

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

    state: State = {
        isDragging: false,
        wasEverFocused: false,
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
        }

        this.dndPlugin = createDndUploadPlugin(imagePluginProps)
        this.pasteImage = createPasteImagePlugin(imagePluginProps)
        this.blockBreakoutPlugin = createBlockBreakoutPlugin()
        this.resizeablePlugin = createResizeablePlugin({
            horizontal: 'absolute',
        })

        const imageDecorator = composeDecorators(
            this.resizeablePlugin.decorator
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

        if (this.props.predictionContext) {
            this.predictionPlugin = createPredictionPlugin({
                context: this.props.predictionContext,
            })

            plugins.push(this.predictionPlugin)
        }

        return plugins as Plugin[]
    }

    componentDidUpdate(prevProps: Props) {
        let {editorState} = this.props

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
            this._onChange(editorState)
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
                prevProps.editorState.getSelection()
            )
        ) {
            this._focusEditor()
        }
    }

    _getAttachFiles = () => this.props.attachFiles

    _getCanDropFiles = () => this.props.canDropFiles

    _getCanInsertInlineImages = () => this.props.canInsertInlineImages

    _focusEditor = () => {
        const {editorState} = this.props
        const {wasEverFocused} = this.state

        if (!wasEverFocused) {
            this.setState({wasEverFocused: true})
            this._onChange(EditorState.moveFocusToEnd(editorState))
        }
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus()
                scrollToReactNode(this.editor as any)
            }
        }, 0)
    }

    // This is for handling things like Bold, Italic, etc..
    _handleKeyCommand = (command: string) => {
        const {editorState} = this.props
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            this._onChange(newState)
            return 'handled'
        }

        return 'not-handled'
    }

    _handlePastedText = (
        text: string,
        html: string | undefined,
        editorState: EditorState
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
            return 'not-handled'
        }

        // manually convert pasted text/html with draft-convert to preserve newlines and empty blocks.
        // by default draft-js's convertFromHTML tries to clean-up the html, and remove extra newlines.
        // https://github.com/facebook/draft-js/issues/231
        const contentState = Modifier.replaceWithFragment(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            contentStateFromTextOrHTML(text, html).getBlockMap()
        )

        const newEditorState = (EditorState.push as (
            editorState: EditorState,
            contentState: ContentState
        ) => EditorState)(editorState, contentState)
        this._onChange(newEditorState)

        // draft-js-plugins-editor requires `handled`, instead of `true` like the native draft-js instance,
        // to prevent the default behavior.
        return 'handled'
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
                        this.editor.getPluginMethods()
                    )
                }
            })
        }

        return nextEditorState
    }

    _onChange = (editorState: EditorState) => {
        // run plugins
        this.props.onChange(this._runPlugins(editorState))
    }

    _onDragOver = () => this.setState({isDragging: true})

    _onDragLeave = () => this.setState({isDragging: false})

    _onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        this.setState({isDragging: false})
    }

    _onEditorFocus = (event: MouseEvent<HTMLDivElement>) => {
        const {onFocus, detectGrammarly} = this.props
        onFocus(event)
        detectGrammarly()
    }

    _getField = () => {
        const {
            required,
            displayOnly,
            onFocus,
            emailExtraEnabled,
            ticket,
        } = this.props
        // $TsFixMe remove casting after migrating createMentionPlugin
        const {MentionSuggestions} = this.mentionPlugin as {
            MentionSuggestions: ComponentType<{
                onSearchChange: (arg: {value: string}) => void
                suggestions: List<any>
                canAddMention: boolean
            }>
        }
        return (
            <div
                className={classnames('rich-textarea-wrapper', {
                    'display-only': displayOnly,
                })}
            >
                <div
                    className={classnames('editor-wrapper', {
                        drop: this.state.isDragging,
                    })}
                    onClick={onFocus}
                    onDragOver={this._onDragOver}
                    onDragLeave={this._onDragLeave}
                    onDrop={this._onDrop}
                >
                    <div
                        className={classnames({
                            [css.withMinHeight]: !this.props.quickReply,
                        })}
                    >
                        <Editor
                            editorState={this.props.editorState}
                            onChange={this._onChange}
                            onFocus={this._onEditorFocus}
                            onBlur={this.props.onBlur}
                            plugins={this.plugins}
                            handleKeyCommand={this._handleKeyCommand}
                            handlePastedText={this._handlePastedText}
                            readOnly={displayOnly || this.props.readOnly}
                            // once focused we're removing the placeholder (Gmail style)
                            placeholder={
                                !this.state.wasEverFocused
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
                        <MentionSuggestions
                            onSearchChange={this.props.onMentionSearchChange}
                            suggestions={this.props.mentionSearchResults}
                            canAddMention={!!this.props.canAddMention}
                        />
                        {required && (
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
                                required
                            />
                        )}
                    </div>

                    {emailExtraEnabled && (
                        <EmailExtraButton
                            editorState={this.props.editorState}
                        />
                    )}
                </div>
                <Toolbar
                    {...((this.props as unknown) as ComponentProps<
                        typeof Toolbar
                    >)}
                    canDropFiles={this._getCanDropFiles()}
                    pluginMethods={this.editor?.getPluginMethods()}
                />
            </div>
        )
    }
}

export default withGrammarlyUsageTracking(
    provideToolbarPlugin(provideMentionFilteredSuggestions(RichFieldEditor))
)
