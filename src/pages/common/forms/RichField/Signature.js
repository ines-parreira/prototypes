// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {EditorState} from 'draft-js'

import * as newMessageSelectors from '../../../../state/newMessage/selectors'
import * as currentUserSelectors from '../../../../state/currentUser/selectors'
import * as newMessageActions from '../../../../state/newMessage/actions'
import * as responseUtils from '../../../../state/newMessage/responseUtils'

type Props = {
    addSignature: typeof newMessageActions.addSignature,
    editorState: EditorState,
    isDirty: boolean,
    signature: Object,
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
        const signatureText = props.signature.get('text')

        if (!signatureText) {
            return false
        }

        return !this.state.forceHideButton
    }

    _hasSignature(props) {
        const contentState = props.editorState.getCurrentContent()
        return contentState && responseUtils.isSignatureAdded(contentState, props.signature.get('text'))
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
        this.props.addSignature(contentState, this.props.signature)

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
                title="Show signature"
                onClick={this._addResponseSignature}
            >
                <i className="fa fa-fw fa-ellipsis-h" />
            </button>
        )
    }
}

function mapStateToProps(state) {
    const newMessageType = newMessageSelectors.getNewMessageType(state)
    let signature = newMessageSelectors.getNewMessageSignature(state)

    // TODO(@LouisBarranqueiro): remove this when users switched to email integration signatures
    if (!signature.get('text') && newMessageType.startsWith('email')) {
        const currentUser = currentUserSelectors.getCurrentUser(state)
        signature = fromJS({
            text: currentUser.get('signature_text'),
            html: currentUser.get('signature_html')
        })
    }

    return {
        signature,
        isDirty: newMessageSelectors.isDirty(state),
    }
}

const mapDispatchToProps = {
    addSignature: newMessageActions.addSignature
}

export default connect(mapStateToProps, mapDispatchToProps)(Signature)
