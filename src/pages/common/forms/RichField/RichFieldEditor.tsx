import classnames from 'classnames'
import {
    ContentState,
    EditorState,
    KeyBindingUtil,
    Modifier,
    RichUtils,
} from 'draft-js'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import Editor, { composeDecorators } from 'draft-js-plugins-editor'
import createResizeablePlugin from 'draft-js-resizeable-plugin'

import 'draft-js/dist/Draft.css'

import React, {
    Component,
    ComponentProps,
    ComponentType,
    DragEvent,
    KeyboardEvent,
    MouseEvent,
    ReactNode,
} from 'react'

import { List, Map } from 'immutable'
import _isEqual from 'lodash/isEqual'
import _noop from 'lodash/noop'
import _uniq from 'lodash/uniq'
import ReactPlayer from 'react-player'

import { UploadType } from 'common/types'
import { GuidanceVariableList } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import createGuidanceVariablesPlugin from 'pages/common/draftjs/plugins/guidance-variables'
import { addVideo } from 'pages/common/draftjs/plugins/utils'
import shortcutManager from 'services/shortcutManager'
import { extractUrlsFromString } from 'utils'

import { notify } from '../../../../state/notifications/actions'
import { ConnectedAction } from '../../../../state/types'
import {
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
import { createQuotesPlugin } from '../../draftjs/plugins/quotes/quotesPlugin'
import Toolbar from '../../draftjs/plugins/toolbar/Toolbar'
import { ActionName } from '../../draftjs/plugins/toolbar/types'
import { ImagePluginConfig, Plugin } from '../../draftjs/plugins/types'
import createVariablesPlugin from '../../draftjs/plugins/variables/index'
import EmailExtraButton from './EmailExtraButton'
import provideMentionFilteredSuggestions, {
    InjectedProps as MentionFilteredSuggestionsProps,
} from './provideMentionSearchResults'
import provideToolbarPlugin, {
    InjectedProps as ToolbarPluginProps,
} from './provideToolbarPlugin'
import withGrammarlyUsageTracking, {
    InjectedProps as GrammarlyUsageTrackingProps,
} from './withGrammarlyUsageTracking'

import css from './RichFieldEditor.less'

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
    > = {
        emailExtraEnabled: false,
        notify: () => Promise.resolve(),
        attachFiles: _noop,
        canDropFiles: false,
        canInsertInlineImages: true,
        isFocused: false,
        canAddVideoPlayer: false,
        onInsertVideoAddedFromPastedLink: _noop,
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
    workflowVariablesPlugin?: ReturnType<typeof createWorkflowVariablesPlugin>
    guidanceVariablesPlugin?: ReturnType<typeof createGuidanceVariablesPlugin>

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
            this.resizeablePlugin.decorator,
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

        if (props.displayedActions?.includes(ActionName.GuidanceVariable)) {
            this.guidanceVariablesPlugin = createGuidanceVariablesPlugin({
                getVariables: this.props.getGuidanceVariables,
            })

            plugins.push(this.guidanceVariablesPlugin)
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
    }

    componentWillUnmount() {
        shortcutManager.clear(['SpotlightModal', 'Dialpad', 'PhoneCall'])
    }

    _getAttachFiles = () => this.props.attachFiles

    _getCanDropFiles = () => this.props.canDropFiles

    _getCanInsertInlineImages = () => this.props.canInsertInlineImages

    _focusEditor = () => {
        const { editorState, noAutoScroll } = this.props
        const { wasEverFocused } = this.state

        if (!wasEverFocused) {
            this.setState({ wasEverFocused: true })
            this.handleChildChange(EditorState.moveFocusToEnd(editorState))
        }
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus()
                if (!noAutoScroll) {
                    scrollToReactNode(this.editor as any)
                }

                shortcutManager.denylist([
                    'SpotlightModal',
                    'Dialpad',
                    'PhoneCall',
                ])
            }
        }, 0)
    }

    // This is for handling things like Bold, Italic, etc..
    _handleKeyCommand = (command: string) => {
        const { editorState } = this.props
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            this.handleChildChange(newState)
            return EditorHandledNotHandled.Handled
        }

        return EditorHandledNotHandled.NotHandled
    }

    _handleOnTab = (event: React.KeyboardEvent) => {
        const { editorState } = this.props
        const newState = RichUtils.onTab(event, editorState, 4)
        if (newState) {
            this.handleChildChange(newState)
            return EditorHandledNotHandled.Handled
        }
        return EditorHandledNotHandled.NotHandled
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

        // manually convert pasted text/html with draft-convert to preserve newlines and empty blocks.
        // by default draft-js's convertFromHTML tries to clean-up the html, and remove extra newlines.
        // https://github.com/facebook/draft-js/issues/231
        const contentState = Modifier.replaceWithFragment(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            contentStateFromTextOrHTML(text, html).getBlockMap(),
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

        return
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
                        {header}
                        <Editor
                            editorState={this.props.editorState}
                            onChange={this.handleChildChange}
                            keyBindingFn={this._customKeyBindingFn}
                            onFocus={this._onEditorFocus}
                            onBlur={this._onEditorBlur}
                            plugins={this.plugins}
                            handleKeyCommand={this._handleKeyCommand}
                            onTab={this._handleOnTab}
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
                    />
                )}
            </div>
        )
    }
}

export default withGrammarlyUsageTracking(
    provideToolbarPlugin(provideMentionFilteredSuggestions(RichFieldEditor)),
)
