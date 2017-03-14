import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import _throttle from 'lodash/throttle'

import {EditorState, ContentState, RichUtils} from 'draft-js'
import Editor, {composeDecorators} from 'draft-js-plugins-editor'
import createDndPlugin from 'draft-js-dnd-plugin'
import createEmojiPlugin from 'draft-js-emoji-plugin'
import createResizeablePlugin from 'draft-js-resizeable-plugin'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'
import createToolbarPlugin from '../../../../common/draftjs/plugins/toolbar'
import {isRichType} from '../../../../../config/ticket'

import * as ticketSelectors from '../../../../../state/ticket/selectors'

import 'draft-js-emoji-plugin/lib/plugin.css'

const dndPlugin = createDndPlugin()
const emojiPlugin = createEmojiPlugin()
const blockBreakoutPlugin = createBlockBreakoutPlugin()
const resizeablePlugin = createResizeablePlugin({
    horizontal: 'absolute',
})

const imageDecorator = composeDecorators(
    resizeablePlugin.decorator,
)

const toolbarPlugin = createToolbarPlugin({imageDecorator})

const {EmojiSuggestions} = emojiPlugin
const {Toolbar} = toolbarPlugin

const plugins = [emojiPlugin, dndPlugin, blockBreakoutPlugin, resizeablePlugin, toolbarPlugin]


// throttle the updating of the redux because it's slow otherwise when we type
const _updateMessageText = _throttle((props, editorState) => {
    props.actions.ticket.setResponseText(Map({
        contentState: editorState.getCurrentContent(),
        selectionState: editorState.getSelection()
    }))
}, 300)

class TicketReplyEditor extends React.Component {
    componentWillMount() {
        this.state = this._getEditorState(this.props)
    }

    componentDidMount() {
        // We'd like to autofocus the editor, but in componentDidMount the editor element might not be ready
        // so we're using the setTimeout hack to focus the editor here
        if (this.props.autoFocus) {
            setTimeout(this._focusEditor, 0)
        }
    }

    componentWillReceiveProps(nextProps) {
        const contentState = nextProps.ticket.getIn(['state', 'contentState'])
        const forceUpdate = nextProps.ticket.getIn(['state', 'forceUpdate'])
        if (contentState === null || forceUpdate) {
            this.setState(this._getEditorState(nextProps))
        }
    }

    _getEditorState = (props) => {
        const state = props.ticket.get('state')
        const contentState = state.get('contentState')
        const selectionState = state.get('selectionState')

        let editorState

        if (this.state && this.state.editorState) {
            // if content state already exists, just clear the content
            editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''))
        } else {
            // if there is no content, create a new editor state
            editorState = EditorState.createWithContent(ContentState.createFromText(''))
        }

        if (contentState && contentState.hasText()) {
            editorState = EditorState.push(editorState, contentState, 'insert-characters')
        } else {
            // This is required because otherwise the cursor has an undefined state for an empty content
            // See: https://github.com/facebook/draft-js/issues/410
            if (this.props.autoFocus) {
                editorState = EditorState.moveFocusToEnd(editorState)
            }
        }

        if (selectionState) {
            // hasFocus:false is important here because otherwise the editor will have a very strange behavior
            editorState = EditorState.forceSelection(editorState, selectionState.merge({
                hasFocus: false
            }))
        }

        return {editorState}
    }

    _onChange = (editorState) => {
        this.setState({editorState})
        _updateMessageText(this.props, editorState)
    }

    _handleFiles = (files) => {
        this.props.actions.ticket.addAttachments(this.props.ticket, files)
    }

    // This is for handling things like Bold, Italic, etc..
    _handleKeyCommand = (command) => { // eslint-disable-line
        const {editorState} = this.state
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            this._onChange(newState)
            return 'handled'
        }

        return 'not-handled'
    }

    _handleDroppedFiles = (selection, files) => {
        dndPlugin.handleDroppedFiles(selection, files, {
            getEditorState: () => this.state.editorState,
            setEditorState: this._onChange
        })
        this._handleFiles(files)
        return false
    }

    _focusEditor = () => {
        if (this.editor) {
            this.editor.focus()
        }
    }

    render() {
        const {ticket, newMessageType} = this.props

        const hideActions = !isRichType(newMessageType)

        return (
            <div className="ui reply form">
                <div
                    ref="overlay"
                    className="field rich-textarea-wrapper"
                    onClick={this._focusEditor}
                    onDragOver={() => this.refs.overlay.classList.add('active')}
                    onDragLeave={() => this.refs.overlay.classList.remove('active')}
                    onDrop={() => this.refs.overlay.classList.remove('active')}
                >
                    <Editor
                        ref={(editor) => {
                            this.editor = editor
                        }}
                        tabIndex="4"
                        spellCheck
                        readOnly={ticket.getIn(['_internal', 'loading', 'submitMessage'])}
                        editorState={this.state.editorState}
                        plugins={plugins}
                        onChange={this._onChange}
                        handleKeyCommand={this._handleKeyCommand}
                        handleDroppedFiles={this._handleDroppedFiles}
                    />
                    <EmojiSuggestions />
                </div>
                <Toolbar
                    hideActions={hideActions}
                    buttons={[
                        <div className="attachment">
                            <label htmlFor="attachments-input">
                                {
                                    ticket.getIn(['_internal', 'loading', 'addAttachment'])
                                        ? (
                                            <i className="notched circle loading icon" />
                                        ) : (
                                            <i
                                                className="attach icon"
                                                title="Add attachment"
                                            />
                                        )
                                }
                            </label>
                            <input
                                id="attachments-input"
                                type="file"
                                multiple
                                onChange={e => this._handleFiles(e.target.files)}
                            />
                        </div>
                    ]}
                />
            </div>
        )
    }
}

TicketReplyEditor.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    newMessageType: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool
}

function mapStateToProps(state) {
    return {
        newMessageType: ticketSelectors.getNewMessageType(state),
    }
}

export default connect(mapStateToProps)(TicketReplyEditor)
