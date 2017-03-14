import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'

import {EditorState, RichUtils, ContentState} from 'draft-js'
import Editor, {composeDecorators} from 'draft-js-plugins-editor'
import {convertToHTML, convertFromHTML} from '../../../utils'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import createResizeablePlugin from 'draft-js-resizeable-plugin'
import createToolbarPlugin from '../draftjs/plugins/toolbar'

import 'draft-js-emoji-plugin/lib/plugin.css'

export default class RichTextAreaField extends React.Component {
    constructor(props) {
        super(props)

        this.dndPlugin = createDndPlugin()
        this.emojiPlugin = createEmojiPlugin()
        this.blockBreakoutPlugin = createBlockBreakoutPlugin()
        this.resizeablePlugin = createResizeablePlugin({
            horizontal: 'absolute',
        })

        const imageDecorator = composeDecorators(
            this.resizeablePlugin.decorator,
        )

        this.toolbarPlugin = createToolbarPlugin({imageDecorator})

        this.plugins = [
            this.emojiPlugin,
            this.dndPlugin,
            this.blockBreakoutPlugin,
            this.resizeablePlugin,
            this.toolbarPlugin
        ]

        let editorState = EditorState.createEmpty()
        editorState = EditorState.moveFocusToEnd(editorState)

        this.state = {
            editorState,
            isDragging: false,
        }
    }

    componentWillMount() {
        this._updateEditorState(this.props.input.value)
    }

    componentWillReceiveProps(nextProps) {
        if (!_isEqual(nextProps.input.value, this.props.input.value)) {
            this._updateEditorState(nextProps.input.value)
        }
    }

    // used by parents that want to set a new editor state
    _setEditorState = (editorState, focus = true) => {
        this._onChange(editorState, () => {
            if (focus) {
                this._focusEditor()
            }
        })
    }

    _focusEditor = () => {
        if (this.editor) {
            this.editor.focus()
        }
    }

    _didHTMLChanged = (html) => {
        return convertToHTML(this.state.editorState.getCurrentContent()) !== html
    }

    _updateEditorState = (value, callback) => {
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

        this.setState({editorState}, callback)
    }

    // This is for handling things like Bold, Italic, etc..
    _handleKeyCommand = (command) => {
        const {editorState} = this.state
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            this._onChange(newState)
            return 'handled'
        }

        return 'not-handled'
    }

    _handleDroppedFiles = (...args) => {
        const {handleDroppedFiles} = this.props
        if (handleDroppedFiles) {
            return handleDroppedFiles(...args)
        }
    }

    _onChange = (editorState, callback) => {
        const contentState = editorState.getCurrentContent()

        this.setState({editorState}, () => {
            if (callback) {
                callback()
            }

            this.props.input.onChange({
                text: contentState.getPlainText(),
                html: convertToHTML(contentState),
            })
        })
    }

    render() {
        const {
            canDropFiles,
            input,
            label,
            required,
            toolbarProps,
            ...rest
        } = this.props
        const {EmojiSuggestions} = this.emojiPlugin
        const {Toolbar} = this.toolbarPlugin

        return (
            <div
                className={classnames('field', {
                    required,
                })}
            >
                {label && <label htmlFor={input.name}>{label}</label>}
                <div className="rich-textarea-wrapper">
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
                        <Editor
                            editorState={this.state.editorState}
                            onChange={editorState => this._onChange(editorState)}
                            plugins={this.plugins}
                            handleKeyCommand={this._handleKeyCommand}
                            handleDroppedFiles={this._handleDroppedFiles}
                            ref={(editor) => {
                                this.editor = editor
                            }}
                            {...rest}
                        />
                        <EmojiSuggestions />
                    </div>
                    <Toolbar {...toolbarProps} />
                </div>
            </div>
        )
    }
}

RichTextAreaField.defaultProps = {
    canDropFiles: false,
    required: false,
    toolbarProps: {},
}

RichTextAreaField.propTypes = {
    canDropFiles: PropTypes.bool.isRequired,
    handleDroppedFiles: PropTypes.func,
    input: PropTypes.object.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool.isRequired,
    toolbarProps: PropTypes.object.isRequired,
}
