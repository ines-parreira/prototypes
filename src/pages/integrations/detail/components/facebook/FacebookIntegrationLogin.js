import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'

export default class FacebookIntegrationLogin extends React.Component {
    _onLogin = () => {
        window.location = this.props.redirectUri
    }

    render() {
        const {loading} = this.props

        if (loading.get('integration')) {
            return <Loader />
        }

        const isLoading = loading.get('updateIntegration')

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/settings/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/settings/integrations/facebook">Facebook</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Login to Facebook
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>Login to Facebook</h1>

                <p>Please login to Facebook and give Gorgias the permissions to access and manage your pages.</p>

                <Button
                    type="submit"
                    color="success"
                    className={classNames({
                        'btn-loading': isLoading,
                    })}
                    onClick={this._onLogin}
                    disabled={isLoading}
                >
                    Login to Facebook
                </Button>
            </div>
        )
    }
}

FacebookIntegrationLogin.propTypes = {
    loading: PropTypes.object.isRequired,
    redirectUri: PropTypes.string.isRequired,
}
