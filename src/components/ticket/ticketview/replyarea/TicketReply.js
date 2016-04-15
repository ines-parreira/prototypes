import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {EditorState, ContentState, RichUtils} from 'draft-js'
import {stateToHTML} from 'draft-js-export-html'
import Editor from 'draft-js-plugins-editor'
import createMentionPlugin from 'draft-js-mention-plugin'
import createLinkifyPlugin from 'draft-js-linkify-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import 'draft-js-mention-plugin/lib/plugin.css'
import 'draft-js-linkify-plugin/lib/plugin.css'
import 'draft-js-emoji-plugin/lib/plugin.css'

export default class TicketReply extends React.Component {
    constructor(props) {
        super(props)

        const contentState = ContentState.createFromText(props.value)

        const mentions = fromJS(props.users.get('agents', []).map(user => {
            return fromJS({
                name: user.get('name'),
                link: '',
                avatar: ''
            })
        }))

        const plugins = [
            createMentionPlugin({mentions}),
            createLinkifyPlugin({
                target: '_blank'
            }),
            createEmojiPlugin()
        ]

        this.state = {
            editorState: EditorState.createWithContent(contentState),
            plugins
        }

        this.focus = () => this.refs.editor.focus()
        this.handleKeyCommand = this.handleKeyCommand.bind(this)
    }

    onChange = (editorState) => {
        this.setState({editorState})

        const text = editorState.getCurrentContent().getPlainText()
        const html = stateToHTML(editorState.getCurrentContent());

        return this.props.actions.ticket.setResponseText(
            this.props.currentUser,
            text,
            html
        )
    }

    // This is for handling things like Bold, Italic, etc..
    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
        if (newState) {
            this.onChange(newState)
            return true
        }
        return false
    }

    render() {
        let internal = ''

        if (this.props.ticket.get('newMessage') && !this.props.ticket.getIn(['newMessage', 'public'])) {
            internal = 'internal'
        }

        const className = `TicketReply search ui raised segment ${internal}`

        return (
            <div className={className}>
                <form className="ui reply form">
                    <div className="field">
                        <Editor
                            editorState={this.state.editorState}
                            onChange={this.onChange}
                            handleKeyCommand={this.handleKeyCommand}
                            plugins={this.state.plugins}
                            ref="editor"
                        />
                    </div>
                </form>
            </div>
        )
    }
}

TicketReply.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired
}
