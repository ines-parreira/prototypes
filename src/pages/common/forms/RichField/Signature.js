// @flow
import React from 'react'
import {Map, fromJS} from 'immutable'
import {EditorState} from 'draft-js'
import {connect} from 'react-redux'

import * as currentUserSelectors from '../../../../state/currentUser/selectors'
import * as newMessageSelectors from '../../../../state/newMessage/selectors'
import * as newMessageActions from '../../../../state/newMessage/actions'
import * as responseUtils from '../../../../state/newMessage/responseUtils'

type Props = {
    currentUser: Map<*,*>,
    newMessageType: string,
    editorState: EditorState,
    isDirty: boolean,
    addSignature: typeof newMessageActions.addSignature,
}

type State = {
    forceHideButton: boolean
}

class Signature extends React.Component<Props, State> {
    constructor() {
        super()

        this.state = {
            forceHideButton: false
        }
    }

    _shouldShowBtn = (props) => {
        const signatureHTML = (props.currentUser.get('signature_html') || '').trim()
        const signatureText = (props.currentUser.get('signature_text') || '').trim()

        if (props.newMessageType !== 'email' || (!signatureHTML && !signatureText)) {
            return false
        }

        return !this.state.forceHideButton
    }

    _hasSignature(props) {
        const contentState = props.editorState.getCurrentContent()
        return contentState && responseUtils.isSignatureAdded(contentState, props.currentUser)
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isDirty) {
            // show button again after message is sent
            this.setState({forceHideButton: false})
        } else if (this._hasSignature(nextProps)) {
            // hide the button if message includes signature
            // (eg. got message w/ signature from cache, or manually typed the signature)
            this.setState({forceHideButton: true})
        }
    }

    _addResponseSignature = () => {
        const contentState = this.props.editorState.getCurrentContent()
        this.props.addSignature(fromJS({contentState}))

        // only add the signature once
        this.setState({forceHideButton: true})
    }

    render() {
        // button hides itself.
        // faster than waiting for the next tick,
        // and the parent to pick up the editor changes.
        if (!this._shouldShowBtn(this.props)) {
            return null
        }

        return (
            <button
                type="button"
                className="btn-more"
                title="Add signature"
                onClick={this._addResponseSignature}
            >
                <i className="fa fa-fw fa-ellipsis-h" />
            </button>
        )
    }
}


function mapStateToProps(state) {
    return {
        currentUser: currentUserSelectors.getCurrentUser(state),
        newMessageType: newMessageSelectors.getNewMessageType(state),
        isDirty: newMessageSelectors.isDirty(state),
    }
}

const mapDispatchToProps = {
    addSignature: newMessageActions.addSignature
}

export default connect(mapStateToProps, mapDispatchToProps)(Signature)
