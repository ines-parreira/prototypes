// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _isEqual from 'lodash/isEqual'

import {ContentState, EditorState, RichUtils} from 'draft-js'
import Editor, {composeDecorators} from 'draft-js-plugins-editor'
import createDndPlugin from 'draft-js-dnd-plugin'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import createResizeablePlugin from 'draft-js-resizeable-plugin'

import createToolbarPlugin from '../../draftjs/plugins/toolbar'

import createMentionPlugin, {suggestionsFilter} from '../../draftjs/plugins/mentions'

import InputField from '../InputField'
import {convertFromHTML, convertToHTML, removeMentions} from '../../../../utils'
import {scrollToReactNode} from '../../../common/utils/keyboard'

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
        signature: false
    }

    constructor(props: Props) {
        super(props)

        this.dndPlugin = createDndPlugin()
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

    _focusEditor = () => {
        if (this.editor) {
            this.editor.focus()
            scrollToReactNode(this.editor)
        }
    }

    _didHTMLChanged = (html: string) => {
        return convertToHTML(this.state.editorState.getCurrentContent()) !== html
    }

    _updateEditorState = (value: {html: string, text: string}, callback?: () => any) => {
        // if incoming value is the same as the current one, don't update the current one
        if (!this._didHTMLChanged(value.html)) {
            return
        }

        let {editorState} = this.state

        // generate a content state from incoming value
        let contentState = ContentState.createFromText('')
        if (value.html) {
            contentState = convertFromHTML(value.html)
        } else if (value.text) {
            contentState = ContentState.createFromText(value.text)
        }

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

    _onChange = (editorState: EditorState) => {
        this.setState({editorState}, () => {
            // notify the parent of the new editor state
            this.props.onChange(editorState)
        })
    }

    _onFocus = () => {
        // once focused we're removing the placeholder (Gmail style)
        this.setState({placeholder: ''})
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
                    onClick={this._focusEditor}
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
                                plugins={this.plugins}
                                handleKeyCommand={this._handleKeyCommand}
                                handleDroppedFiles={this._handleDroppedFiles}
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
