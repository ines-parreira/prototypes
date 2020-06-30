// @flow

import * as React from 'react'
import {Button} from 'reactstrap'
import {connect} from 'react-redux'

import {getFacebookRedirectUri} from '../../../../../../state/integrations/selectors'

type Props = {
    redirectUri: string,
    reconnect?: boolean,
    link?: boolean,
    children?: React.Node,
}

@connect((state, props) => ({
    redirectUri: getFacebookRedirectUri(props.reconnect)(state),
}))
export default class FacebookLoginButton extends React.Component<Props> {
    static defaultProps = {
        reconnect: false,
        link: false,
        children: null,
    }

    renderLink() {
        const {redirectUri, children} = this.props

        return <a href={redirectUri}>{children || 'Login with Facebook'}</a>
    }

    renderButton() {
        const {redirectUri, children} = this.props

        return (
            <Button tag="a" color="success" href={redirectUri}>
                {children || 'Reconnect'}
            </Button>
        )
    }

    render() {
        const {link} = this.props

        return link ? this.renderLink() : this.renderButton()
    }
}
