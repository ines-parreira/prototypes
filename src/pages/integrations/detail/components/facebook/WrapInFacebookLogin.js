import React, {PropTypes} from 'react'

/**
 * A 'Higher order component' that loads the Facebook sdk (required from Facebook login).
 *
 * @param Component
 * @returns {FacebookLoginWrapperComponent}
 */
export default function WrapInFacebookLogin(Component) {
    class FacebookLoginWrapperComponent extends React.Component {
        componentWillMount() {
            const {facebookAppId} = this.props

            window.fbAsyncInit = () => {
                FB.init({
                    appId: facebookAppId,
                    xfbml: true,
                    version: 'v2.6'
                })
            }

            ((d, s, id) => {
                const fjs = d.getElementsByTagName(s)[0]
                if (d.getElementById(id)) {
                    return
                }
                const js = d.createElement(s)
                js.id = id
                // js.src = "//connect.facebook.net/en_US/sdk/debug.js"
                js.src = '//connect.facebook.net/en_US/sdk.js'
                fjs.parentNode.insertBefore(js, fjs)
            })(document, 'script', 'facebook-jssdk')
        }

        render() {
            return <Component {...this.props} />
        }
    }

    const wrappedPropTypes = Component.propTypes

    FacebookLoginWrapperComponent.propTypes = {
        ...wrappedPropTypes,
        facebookAppId: PropTypes.string.isRequired
    }

    return FacebookLoginWrapperComponent
}
