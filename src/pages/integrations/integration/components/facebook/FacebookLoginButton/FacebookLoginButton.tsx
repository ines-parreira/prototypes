import React, {Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import {getFacebookRedirectUri} from 'state/integrations/selectors'
import {RootState} from 'state/types'

type OwnProps = {
    reconnect?: boolean
    link?: boolean
    children?: ReactNode
    intent?: ButtonIntent
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class FacebookLoginButtonContainer extends Component<Props> {
    static defaultProps: OwnProps = {
        reconnect: false,
        link: false,
        children: null,
        intent: 'primary',
    }

    _handleSubmit = (e: React.SyntheticEvent, redirectUri: string) => {
        e.preventDefault()
        window.open(redirectUri)
    }

    renderLink() {
        const {redirectUri, children} = this.props

        return <a href={redirectUri}>{children || 'Login with Facebook'}</a>
    }

    renderButton() {
        const {redirectUri, children, intent} = this.props

        return (
            <Button
                type="submit"
                intent={intent}
                onClick={(e) => this._handleSubmit(e, redirectUri)}
            >
                {children || 'Reconnect'}
            </Button>
        )
    }

    render() {
        const {link} = this.props

        return link ? this.renderLink() : this.renderButton()
    }
}

const connector = connect((state: RootState, props: OwnProps) => ({
    redirectUri: getFacebookRedirectUri(props.reconnect)(state),
}))

export default connector(FacebookLoginButtonContainer)
