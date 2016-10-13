import React, {PropTypes} from 'react'

import {Loader} from '../../../../common/components/Loader'

/**
 * A 'Higher order component' that loads the Facebook sdk (required from Facebook login).
 *
 * @param InnerComponent
 */

const WrapInFacebookLogin = InnerComponent => class FacebookConnected extends React.Component {
    static defaultProps = {
        version: 'v2.6'
    }

    static propTypes = {
        ...InnerComponent.propTypes,
        facebookAppId: PropTypes.string.isRequired,
    }

    constructor() {
        super()
        this.state = {SDKLoaded: false}
    }

    componentWillMount() {
        const {facebookAppId, version} = this.props

        if (typeof FB !== 'undefined') {
            this.setState({SDKLoaded: true})
        }

        window.fbAsyncInit = () => {
            FB.init({appId: facebookAppId, xfbml: true, version})
            this.setState({SDKLoaded: true})
            this.props.actions.facebookLoginStatus()
        }

        ((d, s, id) => {
            const fjs = d.getElementsByTagName(s)[0]
            if (d.getElementById(id)) {
                return
            }
            const js = d.createElement(s)
            js.id = id
            // js.src = `//connect.facebook.net/en_US/sdk/debug.js?version=${version}`
            js.src = `//connect.facebook.net/en_US/sdk.js?version=${version}`
            fjs.parentNode.insertBefore(js, fjs)
        })(document, 'script', 'facebook-jssdk')
    }

    render() {
        // Since the FB object might not be yet loaded (it's script is injected on runtime), wait until it's ready
        return this.state.SDKLoaded
            ? <InnerComponent {...this.props} />
            : <Loader message="Facebook SDK ... (Please, refresh this page, if the loading doesn't disappear)" />
    }
}

export default WrapInFacebookLogin
