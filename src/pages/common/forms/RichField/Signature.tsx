import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {EditorState} from 'draft-js'

import {
    isDirty,
    getNewMessageSignature,
} from '../../../../state/newMessage/selectors'
import {addSignature} from '../../../../state/newMessage/actions'
import {isSignatureAdded} from '../../../../state/newMessage/responseUtils'
import Ellipsis from '../../components/Ellipsis.js'
import {RootState} from '../../../../state/types'

type OwnProps = {
    editorState: EditorState
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    forceHideButton: boolean
}

export class SignatureContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            forceHideButton: false,
        }
    }

    _shouldShowBtn = (props: Props) => {
        const hasSignature =
            props.signature.get('text') || props.signature.get('html')

        if (!hasSignature) {
            return false
        }

        return !this.state.forceHideButton
    }

    _hasSignature(props: Props) {
        const contentState = props.editorState.getCurrentContent()
        return (
            contentState &&
            isSignatureAdded(contentState, props.signature.get('text'))
        )
    }

    componentWillReceiveProps(nextProps: Props) {
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
            <Ellipsis
                title="Show signature"
                onClick={this._addResponseSignature}
            />
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            signature: getNewMessageSignature(state),
            isDirty: isDirty(state),
        }
    },
    {
        addSignature,
    }
)

export default connector(SignatureContainer)
