import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {EditorState, ContentState, RichUtils, convertFromHTML} from 'draft-js'
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
        this.updateAfterGorgias = this.updateAfterGorgias.bind(this)
        this.receiveMessage = this.receiveMessage.bind(this)
    }

    onChange = (editorState) => {
        this.setState({editorState})

        const text = editorState.getCurrentContent().getPlainText()
        const html = stateToHTML(editorState.getCurrentContent())

        return this.props.actions.ticket.setResponseText(
            this.props.currentUser,
            text,
            html
        )
    }

    updateAfterGorgias(payload) {
        const actualHTML = this.refs.editor.refs.editor.refs.editor.innerHTML
        const contentBlock = convertFromHTML(actualHTML)
        const contentState = ContentState.createFromBlockArray(contentBlock)
        const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState))

        this.setState({editorState})
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

    receiveMessage(event) {
        // We're waiting for an event from Gorgias extension - that the template has been inserted
        if (event.data.source && event.data.source === 'gorgias-extension') {
            if (event.data.payload.event === 'template-inserted') {
                this.updateAfterGorgias(event.data.payload)
            }
        }
    }

    componentDidMount() {
        window.addEventListener('message', this.receiveMessage, false)
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
                            onTab={this.onTab}
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
