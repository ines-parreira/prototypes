import React from 'react'
import classNames from 'classnames'

import {EditorState, RichUtils, ContentState} from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import {convertToHTML, convertFromHTML} from '../../../utils'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createToolbarPlugin from '../draftjs/plugins/toolbar'

import 'draft-js-emoji-plugin/lib/plugin.css'

export default class RichTextAreaField extends React.Component {
    constructor(props) {
        super(props)

        this.dndPlugin = createDndPlugin()
        this.emojiPlugin = createEmojiPlugin()
        this.toolbarPlugin = createToolbarPlugin()

        this.plugins = [this.emojiPlugin, this.dndPlugin, this.toolbarPlugin]

        let editorState = EditorState.createEmpty()
        editorState = EditorState.moveFocusToEnd(editorState)

        this.state = {
            editorState,
        }
    }

    componentWillMount() {
        this._updateEditorState(this.props.input.value)
    }

    componentWillReceiveProps(nextProps) {
        this._updateEditorState(nextProps.input.value)
    }

    // used by parents that want to set a new editor state
    _setEditorState = (editorState, focus = true) => {
        this._onChange(editorState, () => {
            if (focus && this.editor) {
                this.editor.focus()
            }
        })
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
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
        if (newState) {
            this._onChange(newState)
            return true
        }
        return false
    }

    _onChange = (editorState, callback) => {
        const html = convertToHTML(editorState.getCurrentContent())
        // compare new html to current one in state of component
        const didHTMLChanged = this._didHTMLChanged(html)

        this.setState({editorState}, () => {
            if (callback) {
                callback()
            }

            // if content did not change, don't trigger a onChange event
            // we don't care about changes in selection state
            if (!didHTMLChanged) {
                return
            }

            this.props.input.onChange({
                text: editorState.getCurrentContent().getPlainText(),
                html,
            })
        })
    }

    render() {
        const {input, label, placeholder, required} = this.props
        const fieldClassName = classNames({required}, 'field')

        const {EmojiSuggestions} = this.emojiPlugin
        const {Toolbar} = this.toolbarPlugin

        return (
            <div className={fieldClassName}>
                {label && <label htmlFor={input.name}>{label}</label>}
                <div className="rich-textarea-wrapper">
                    <div style={{paddingBottom: '26px'}}>
                        <Editor
                            editorState={this.state.editorState}
                            onChange={editorState => this._onChange(editorState)}
                            plugins={this.plugins}
                            placeholder={placeholder}
                            handleKeyCommand={this._handleKeyCommand}
                            ref={(editor) => {
                                this.editor = editor
                            }}
                        />
                        <EmojiSuggestions />
                        <Toolbar />
                    </div>
                </div>
            </div>
        )
    }
}

RichTextAreaField.defaultProps = {
    required: false
}

RichTextAreaField.propTypes = {
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool
}
