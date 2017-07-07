import React from 'react'
import InputField from './InputField'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'

import {EditorState, RichUtils, ContentState} from 'draft-js'
import Editor, {composeDecorators} from 'draft-js-plugins-editor'
import createDndPlugin from 'draft-js-dnd-plugin'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import createResizeablePlugin from 'draft-js-resizeable-plugin'
import createToolbarPlugin from '../draftjs/plugins/toolbar'

import {convertToHTML, convertFromHTML} from '../../../utils'

export default class RichField extends InputField {
    constructor(props) {
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

        this.plugins = [
            this.dndPlugin,
            this.blockBreakoutPlugin,
            this.resizeablePlugin,
            this.toolbarPlugin,
        ]

        let editorState = EditorState.createEmpty()
        editorState = EditorState.moveFocusToEnd(editorState)

        this.state = {
            editorState,
            isDragging: false,
        }
    }

    componentWillMount() {
        this._updateEditorState(this.props.value)
    }

    componentWillReceiveProps(nextProps) {
        if (!_isEqual(nextProps.value, this.props.value)) {
            this._updateEditorState(nextProps.value)
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

            this.props.onChange({
                text: contentState.getPlainText(),
                html: convertToHTML(contentState),
            })
        })
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
            placeholder, // eslint-disable-line
            required, // eslint-disable-line
            type, // eslint-disable-line
            value, // eslint-disable-line
            canDropFiles,
            toolbarProps,
            displayOnly,
            ...rest,
        } = this.props

        const {Toolbar} = this.toolbarPlugin

        return (
            <div
                className={classnames('rich-textarea-wrapper', {
                    'display-only': displayOnly,
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
                    <Editor
                        editorState={this.state.editorState}
                        onChange={editorState => this._onChange(editorState)}
                        plugins={this.plugins}
                        handleKeyCommand={this._handleKeyCommand}
                        handleDroppedFiles={this._handleDroppedFiles}
                        ref={(editor) => {
                            this.editor = editor
                        }}
                        readOnly={displayOnly}
                        {...rest}
                    />
                </div>
                <Toolbar {...toolbarProps} />
            </div>
        )
    }
}
