import React, {PropTypes} from 'react'
import {Editor, EditorState, ContentState, RichUtils} from 'draft-js'

export default class TicketReply extends React.Component {
    constructor(props) {
        super(props)
        const contentState = ContentState.createFromText(props.value)
        this.state = {editorState: EditorState.createWithContent(contentState)}
        this.focus = () => this.refs.editor.focus()
        this.handleKeyCommand = this.handleKeyCommand.bind(this)
    }

    onChange = (ev) => {
        this.setState({editorState: ev})
        const cleanHTML = this.cleanupHTML(this.refs.editor.refs.editor).innerHTML
        const text = ev.getCurrentContent().getPlainText()

        return this.props.actions.ticket.setResponseText(
            this.props.currentUser,
            text,
            cleanHTML
        )
    }

    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
        if (newState) {
            this.onChange(newState)
            return true
        }
        return false
    }

    // Before sending it to our API we're cleaning up all data-* attributes from elements
    cleanupHTML = (domNode) => {
        const domClone = domNode.cloneNode(true)
        const domNodes = domClone.querySelectorAll('*')

        for (let k = 0; k <= domNodes.length; k++) {
            if (!domNodes.hasOwnProperty(k)) {
                continue
            }
            const attrs = domNodes[k].attributes
            for (let i = 0; i < attrs.length; i++) {
                if (attrs[i].name.slice(0, 5) !== 'data-') {
                    continue
                }
                domNodes[k].removeAttribute(attrs[i].name)
                i--
            }
        }

        return domClone
    }

    render() {
        return (
            <div className="TicketReply search ui raised segment">
                <form className="ui reply form">
                    <div className="field">
                        <Editor
                            editorState={this.state.editorState}
                            onChange={this.onChange}
                            handleKeyCommand={this.handleKeyCommand}
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
    value: PropTypes.string.isRequired,
}
