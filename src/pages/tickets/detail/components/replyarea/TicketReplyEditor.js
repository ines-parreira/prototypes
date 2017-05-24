import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import _throttle from 'lodash/throttle'
import {RichTextAreaField} from '../../../../common/forms'

import {EditorState, ContentState} from 'draft-js'
import createDndPlugin from 'draft-js-dnd-plugin'
import {isRichType, acceptsOnlyImages} from '../../../../../config/ticket'

import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'

import 'draft-js-emoji-plugin/lib/plugin.css'

const dndPlugin = createDndPlugin()

// throttle the updating of the redux because it's slow otherwise when we type
const _updateMessageText = _throttle((props, editorState) => {
    if (!props.newMessage.getIn(['state', 'cacheAdded'])) {
        return
    }

    props.setResponseText(Map({
        contentState: editorState.getCurrentContent(),
        selectionState: editorState.getSelection()
    }))
}, 100)

class TicketReplyEditor extends React.Component {
    componentWillMount() {
        this._updateEditorState(this._getEditorStateFromReducer(this.props))
    }

    componentWillReceiveProps(nextProps) {
        const forceUpdate = nextProps.newMessage.getIn(['state', 'forceUpdate'])

        if (forceUpdate) {
            setTimeout(() => {
                this._updateEditorState(this._getEditorStateFromReducer(nextProps))
            }, 1)
        }

        if (!this.props.autoFocus && nextProps.autoFocus) {
            setTimeout(() => {
                if (this.richArea) {
                    this.richArea._focusEditor()
                }
            }, 1)
        }
    }

    _getEditorStateFromReducer = (props) => {
        const state = props.newMessage.get('state')
        const contentState = state.get('contentState')
        const selectionState = state.get('selectionState')

        let editorState = this._getEditorState()

        if (!editorState) {
            return editorState
        }

        if (contentState && contentState.hasText()) {
            editorState = EditorState.push(editorState, contentState, 'insert-characters')
        } else {
            // empty editor state (triggered after message is sent, textarea needs to be emptied)
            editorState = EditorState.push(editorState, ContentState.createFromText(''))

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

        return editorState
    }

    _onChange = (editorState) => {
        this.setState({editorState})
        _updateMessageText(this.props, editorState)
    }

    _handleFiles = (files) => {
        this.props.addAttachments(this.props.ticket, files)
    }

    _handleDroppedFiles = (selection, files) => {
        dndPlugin.handleDroppedFiles(selection, files, {
            getEditorState: () => this.state.editorState,
            setEditorState: this._onChange
        })
        this._handleFiles(files)
        return false
    }

    _getEditorState = () => {
        if (!this.richArea) {
            return
        }

        return this.richArea.state.editorState
    }

    _updateEditorState = (editorState) => {
        if (!this.richArea) {
            return
        }

        this.richArea._setEditorState(editorState)
    }

    _updateReducer = () => {
        if (!this.richArea) {
            return
        }

        const {editorState} = this.richArea.state
        _updateMessageText(this.props, editorState)
    }

    render() {
        const {newMessage, newMessageType} = this.props

        const isNewMessageRichType = isRichType(newMessageType)
        const newMessageAcceptsOnlyImages = acceptsOnlyImages(newMessageType)

        const attachmentInputProps = {}

        // if not rich type (like chat or Facebook message), only accept images
        if (newMessageAcceptsOnlyImages) {
            attachmentInputProps.accept = 'image/*'
        }

        return (
            <div className="ui reply form">
                <RichTextAreaField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    input={{
                        value: {
                            text: '',
                            html: '',
                        },
                        onChange: this._updateReducer,
                    }}
                    handleDroppedFiles={this._handleDroppedFiles}
                    tabIndex="4"
                    spellCheck
                    canDropFiles
                    readOnly={newMessage.getIn(['_internal', 'loading', 'submitMessage'])}
                    toolbarProps={{
                        hideActions: !isNewMessageRichType,
                        buttons: [
                            <div className="attachment">
                                <label
                                    htmlFor="attachments-input"
                                    style={{margin: 0}}
                                >
                                    {
                                        newMessage.getIn(['_internal', 'loading', 'addAttachment'])
                                            ? (
                                                <i className="notched circle loading icon" />
                                            ) : (
                                                <i
                                                    className={classnames('icon', {
                                                        attach: !newMessageAcceptsOnlyImages,
                                                        'file image outline': newMessageAcceptsOnlyImages,
                                                    })}
                                                    title="Add attachment"
                                                />
                                            )
                                    }
                                </label>
                                <input
                                    id="attachments-input"
                                    type="file"
                                    multiple
                                    onChange={(event) => {
                                        return this._handleFiles(event.target.files)
                                    }}
                                    onClick={(event) => {
                                        // empty input on click
                                        return event.target.value = null
                                    }}
                                    {...attachmentInputProps}
                                />
                            </div>
                        ],
                    }}
                />
            </div>
        )
    }
}

TicketReplyEditor.propTypes = {
    addAttachments: PropTypes.func.isRequired,
    setResponseText: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    newMessageType: PropTypes.string.isRequired,
    newMessage: PropTypes.object.isRequired,
    autoFocus: PropTypes.bool.isRequired,
}

function mapStateToProps(state) {
    return {
        newMessageType: newMessageSelectors.getNewMessageType(state),
        newMessage: state.newMessage,
    }
}

const mapDispatchToProps = {
    addAttachments: newMessageActions.addAttachments,
    setResponseText: newMessageActions.setResponseText,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyEditor)
