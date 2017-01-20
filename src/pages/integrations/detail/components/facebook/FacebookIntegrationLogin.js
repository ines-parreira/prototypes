import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {Loader} from '../../../../common/components/Loader'

export default class FacebookIntegrationLogin extends React.Component {
    _onLogin = () => {
        window.location = this.props.redirectUri
    }

    render() {
        const {loading} = this.props

        if (loading.get('integration')) {
            return <Loader />
        }

        const submitButtonClassNames = ['ui', 'green', 'button', {loading: loading.get('updateIntegration')}]

        return (
            <div className="ui grid">
                <div className="ten wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/integrations/facebook" className="section">Facebook</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">Login to Facebook</a>
                    </div>

                    <h1>Login to Facebook</h1>
                </div>
                <div className="ten wide column">
                    <p>Please login to Facebook and give Gorgias the permissions to access and manage your pages.</p>
                    <button
                        className={classNames(submitButtonClassNames)}
                        onClick={this._onLogin}
                    >
                        Login to Facebook
                    </button>
                </div>
            </div>
        )
    }
}

FacebookIntegrationLogin.propTypes = {
    loading: PropTypes.object.isRequired,
    redirectUri: PropTypes.string.isRequired,
}
