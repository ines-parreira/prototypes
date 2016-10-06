import React from 'react'
import classNames from 'classnames'

import {EditorState, RichUtils, ContentState, convertFromHTML} from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import {stateToHTML} from 'draft-js-export-html'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import 'draft-js-mention-plugin/lib/plugin.css'
import 'draft-js-linkify-plugin/lib/plugin.css'
import 'draft-js-emoji-plugin/lib/plugin.css'

const dndPlugin = createDndPlugin()
const linkifyPlugin = createLinkifyPlugin()
const emojiPlugin = createEmojiPlugin({
    emojiSuggestions: 'emoji-suggestions'
})
const plugins = [emojiPlugin, dndPlugin, linkifyPlugin]


export default class RichTextAreaField extends React.Component {
    constructor(props) {
        super(props)
        let contentState = null

        if (props.input.value.html) {
            contentState = ContentState.createFromBlockArray(convertFromHTML(props.input.value.html))
            this.state = {editorState: EditorState.createWithContent(contentState)}
        } else if (props.input.value) {
            contentState = ContentState.createFromText('')
            this.state = {editorState: EditorState.createWithContent(contentState)}
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.input.value && nextProps.input.value) {
            let contentState = null

            if (nextProps.input.value.html) {
                contentState = ContentState.createFromBlockArray(convertFromHTML(nextProps.input.value.html))
            } else {
                contentState = ContentState.createFromText('')
            }

            this.setState({editorState: EditorState.createWithContent(contentState)})
        }
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

    _onChange = (editorState) => {
        if (!editorState.getCurrentContent().equals(ContentState.createFromText(''))) {
            this.setState({editorState})
            this.props.input.onChange({
                text: editorState.getCurrentContent().getPlainText(),
                html: stateToHTML(editorState.getCurrentContent())
            })
        }
    }

    render() {
        const {input, label, placeholder, required} = this.props
        const fieldClassName = classNames({required}, 'field')

        let editor = null

        if (this.state) {
            editor = (
                <Editor
                    editorState={this.state.editorState}
                    onChange={this._onChange}
                    plugins={plugins}
                    placeholder={placeholder}
                    handleKeyCommand={this._handleKeyCommand}
                />
            )
        }

        return (
            <div className={fieldClassName}>
                {label && <label htmlFor={input.name}>{label}</label>}
                <div className="rich-textarea-wrapper">
                    {editor}
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
