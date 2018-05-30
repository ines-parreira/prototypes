// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _isEqual from 'lodash/isEqual'

import {ContentState, EditorState, RichUtils, Modifier} from 'draft-js'
import Editor, {composeDecorators} from 'draft-js-plugins-editor'
// TODO switch to official source when published
// https://github.com/draft-js-plugins/draft-js-plugins/issues/755
import createDndUploadPlugin from '@mikeljames/draft-js-drag-n-drop-upload-plugin'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import createResizeablePlugin from 'draft-js-resizeable-plugin'

import createToolbarPlugin from '../../draftjs/plugins/toolbar'

import createMentionPlugin, {suggestionsFilter} from '../../draftjs/plugins/mentions'

import InputField from '../InputField'
import {convertFromHTML, convertToHTML, removeMentions} from '../../../../utils'
import {scrollToReactNode} from '../../../common/utils/keyboard'

import {attachEntitiesToVariables} from '../../draftjs/plugins/toolbar/utils'

import Signature from './Signature'

import 'draft-js/dist/Draft.css'

import type {List} from 'immutable'

type suggestionsType = List<*>
type canAddMentionType = boolean

type Props = {
    allowExternalChanges: boolean,
    placeholder: string,
    value: any,
    signature: boolean,

    mentionProps?: {
        suggestions: suggestionsType,
        canAddMention: canAddMentionType
    }
}

type State = {
    editorState: EditorState,
    placeholder: string,
    isDragging: boolean,

    mentionSuggestions?: suggestionsType,
    canAddMention?: canAddMentionType
}

export default class RichField extends InputField<Props, State> {
    static defaultProps = {
        allowExternalChanges: false,
        signature: false,
        type: 'text',
    }

    constructor(props: Props) {
        super(props)

        this.dndPlugin = createDndUploadPlugin()
        this.blockBreakoutPlugin = createBlockBreakoutPlugin()
        this.resizeablePlugin = createResizeablePlugin({
            horizontal: 'absolute',
        })

        const imageDecorator = composeDecorators(
            this.resizeablePlugin.decorator,
        )

        this.toolbarPlugin = createToolbarPlugin({imageDecorator})

        this.mentionPlugin = createMentionPlugin()

        this.plugins = [
            this.dndPlugin,
            this.blockBreakoutPlugin,
            this.resizeablePlugin,
            this.toolbarPlugin,
            this.mentionPlugin
        ]

        let editorState = EditorState.createEmpty()
        editorState = EditorState.moveFocusToEnd(editorState)

        this.state = {
            editorState,
            placeholder: props.placeholder,
            isDragging: false,
            mentionSuggestions: fromJS([]),
            canAddMention: false,
            isFocused: false,
            contentLoaded: false,
        }

        if (this.props.mentionProps) {
            this.state.mentionSuggestions = this.props.mentionProps.suggestions
            this.state.canAddMention = this.props.mentionProps.canAddMention
        }
    }

    componentWillMount() {
        this._updateEditorState(this.props.value)
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.mentionProps && nextProps.mentionProps) {
            if (this.props.mentionProps.canAddMention && !nextProps.mentionProps.canAddMention) {
                this.setState({
                    editorState: removeMentions(this.state.editorState, nextProps.value)
                })
            }
        }

        // when we do a preview we're changing the value directly and so we need to update the editor state
        if (!_isEqual(nextProps.value, this.props.value) && (this.props.displayOnly || this.props.allowExternalChanges)) {
            this._updateEditorState(nextProps.value)
        }
    }

    // used by parents that want to set a new editor state
    _setEditorState = (editorState: EditorState) => {
        this._onChange(editorState)
    }

    focusEditor = () => {
        if (this.editor) {
            this.editor.focus()
            scrollToReactNode(this.editor)
        }
    }

    isFocused = () => {
        return this.state.isFocused
    }

    _didHTMLChanged = (html?: string) => {
        return convertToHTML(this.state.editorState.getCurrentContent()) !== html
    }

    _getContentState = (text: string, html?: string): ContentState => {
        let contentState = ContentState.createFromText('')
        if (html) {
            contentState = convertFromHTML(html)
        } else if (text) {
            contentState = ContentState.createFromText(text)
        }

        return contentState
    }

    _updateEditorState = (value: {html?: string, text: string}, callback?: () => any) => {
        // if incoming value is the same as the current one, don't update the current one
        if (!this._didHTMLChanged(value.html)) {
            return
        }

        let {editorState} = this.state

        // generate a content state from incoming value
        const contentState = this._getContentState(value.text, value.html)

        // set content state in editor state
        editorState = EditorState.push(editorState, contentState)

        // trigger plugins onChange when we force a new editor state via this function
        // comes from Editor internal onChange function https://github.com/draft-js-plugins/draft-js-plugins/blob/55eb3b845d7e776a10def7f388624cf4c9879f5a/draft-js-plugins-editor/src/Editor/index.js#L92
        if (this.editor) {
            this.editor.resolvePlugins().forEach((plugin) => {
                if (plugin.onChange) {
                    editorState = plugin.onChange(editorState, this.editor.getPluginMethods())
                }
            })
        }

        // immutable variables on first load
        editorState = attachEntitiesToVariables(editorState, true)

        this.setState({editorState}, callback)
    }

    // This is for handling things like Bold, Italic, etc..
    _handleKeyCommand = (command: string) => {
        const {editorState} = this.state
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            this._onChange(newState)
            return 'handled'
        }

        return 'not-handled'
    }

    _handleDroppedFiles = (...args: Array<any>) => {
        const {handleDroppedFiles} = this.props
        if (handleDroppedFiles) {
            return handleDroppedFiles(...args)
        }
    }

    _handlePastedText = (text: string, html?: string, editorState: EditorState) => {
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
            this._getContentState(text, html).getBlockMap()
        )

        const newEditorState = EditorState.push(editorState, contentState)
        this._onChange(newEditorState)

        // draft-js-plugins-editor requires `handled`, instead of `true` like the native draft-js instance,
        // to prevent the default behavior.
        return 'handled'
    }

    _onChange = (editorState: EditorState) => {
        this.setState({editorState}, () => {
            // notify the parent of the new editor state
            this.props.onChange(editorState)
        })
    }

    _onFocus = () => {
        this.setState({
            // once focused we're removing the placeholder (Gmail style)
            placeholder: '',
            isFocused: true
        })
    }

    _onBlur = () => {
        this.setState({isFocused: false})
    }

    onSearchChange = ({value}: {value: string}) => {
        if (this.props.mentionProps) {
            this.setState({
                mentionSuggestions: suggestionsFilter(value, this.props.mentionProps.suggestions)
            })
        }
    }

    _getField = () => {
        const {
            children, // eslint-disable-line
            disabled, // eslint-disable-line
            error, // eslint-disable-line
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            onChange, // eslint-disable-line
            placeholder, //eslint-disable-line
            required, // eslint-disable-line
            type, // eslint-disable-line
            value, // eslint-disable-line
            allowExternalChanges, // eslint-disable-line
            alertMode,
            alertText,
            canDropFiles,
            mentionProps,
            toolbarProps,
            displayOnly,
            signature,
            ...rest,
        } = this.props

        const {Toolbar} = this.toolbarPlugin
        const {MentionSuggestions} = this.mentionPlugin

        let canAddMention = false
        if (mentionProps) {
            canAddMention = mentionProps.canAddMention
        }

        return (
            <div
                className={classnames('rich-textarea-wrapper', {
                    'display-only': displayOnly,
                    'alert-warning': alertMode === 'warning'
                })}
            >
                <div
                    className={classnames('editor-wrapper', {
                        drop: this.state.isDragging && canDropFiles,
                    })}
                    style={{paddingBottom: '26px'}}
                    onClick={this.focusEditor}
                    onDragOver={() => this.setState({isDragging: true})}
                    onDragLeave={() => this.setState({isDragging: false})}
                    onDrop={() => this.setState({isDragging: false})}
                >
                    {
                        alertMode ? (
                            <div className="pt-1">
                                {alertText}
                            </div>
                        ) : (
                            <Editor
                                editorState={this.state.editorState}
                                onChange={this._onChange}
                                onFocus={this._onFocus}
                                onBlur={this._onBlur}
                                plugins={this.plugins}
                                handleKeyCommand={this._handleKeyCommand}
                                handleDroppedFiles={this._handleDroppedFiles}
                                handlePastedText={this._handlePastedText}
                                readOnly={displayOnly}
                                placeholder={this.state.placeholder}
                                ref={(editor) => {
                                    this.editor = editor
                                }}
                                {...rest}
                            />
                        )
                    }
                    <MentionSuggestions
                        onSearchChange={this.onSearchChange}
                        suggestions={this.state.mentionSuggestions}
                        canAddMention={canAddMention}
                    />
                    {
                        required && (
                            <input
                                value={
                                    this.state.editorState
                                        ? this.state.editorState.getCurrentContent().getPlainText()
                                        : ''
                                }
                                style={{
                                    opacity: 0,
                                    height: 0,
                                    padding: 0,
                                    margin: 'none',
                                    overflow: 'hidden'
                                }}
                                required
                            />
                        )
                    }

                    {
                        signature &&
                        <Signature editorState={this.state.editorState} />
                    }
                </div>

                <Toolbar {...toolbarProps} />
            </div>
        )
    }
}
