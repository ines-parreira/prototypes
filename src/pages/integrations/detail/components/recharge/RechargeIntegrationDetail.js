import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'

import InputField from '../../../../common/forms/InputField'

class RechargeIntegrationDetail extends React.Component {
    static propTypes = {

        integration: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,

        redirectUri: PropTypes.string.isRequired,

        // Router
        location: PropTypes.object.isRequired,
        params: PropTypes.object.isRequired
    }

    isInitialized = false

    state = {
        store_name: ''
    }

    componentWillReceiveProps(nextProps) {
        if (_isEmpty(this.props.integration.toJS()) && !_isEmpty(nextProps.integration.toJS())) {
            const authenticationRequired = nextProps.integration.getIn(['meta', 'oauth', 'status']) === 'pending'
            const isAuthenticating = nextProps.location.query.action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(
                        nextProps.actions.fetchIntegration(
                            nextProps.integration.get('id'),
                            nextProps.integration.get('type'),
                            true)
                        , 3000)
                } else {
                    nextProps.actions.triggerCreateSuccess(nextProps.integration.toJS())
                }
            }
        }
    }

    _submit = () => {
        window.location.href = this.props.redirectUri.concat('?store_name=').concat(this.state.store_name)
    }

    render() {
        const {actions, integration, loading} = this.props

        const isUpdate = this.props.params.integrationId !== 'new'
        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired = this.props.integration.getIn(['meta', 'oauth', 'status']) === 'pending'

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/recharge">Recharge</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isUpdate ? integration.get('name') : 'Add'}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>

                <InputField
                    type="text"
                    name="name"
                    label="Store name"
                    value={isUpdate ? integration.get('name') : undefined}
                    onChange={(value) => this.setState({store_name: value})}
                    placeholder="Enter the name of the Shopify store to which your Recharge account is connected..."
                    disabled={isUpdate}
                    required
                />

                <div>
                    {
                        !isUpdate && (
                            <Button
                                type="button"
                                color="success"
                                className={classNames({
                                    'btn-loading': isSubmitting,
                                })}
                                onClick={() => this._submit()}
                            >
                                Add Recharge integration
                            </Button>
                        )
                    }
                    {
                        isUpdate && !authenticationRequired && isActive && (
                            <Button
                                type="button"
                                color="warning"
                                outline
                                className={classNames({
                                    'btn-loading': isSubmitting,
                                })}
                                onClick={() => actions.deactivateIntegration(integration.get('id'))}
                            >
                                Deactivate integration
                            </Button>
                        )
                    }
                    {
                        isUpdate && !authenticationRequired && !isActive && (
                            <Button
                                type="button"
                                color="success"
                                className={classNames({
                                    'btn-loading': isSubmitting,
                                })}
                                onClick={() => actions.activateIntegration(integration.get('id'))}
                            >
                                Re-activate integration
                            </Button>
                        )
                    }
                    {
                        isUpdate && (
                            <ConfirmButton
                                className="pull-right"
                                color="danger"
                                confirm={() => actions.deleteIntegration(integration)}
                                content="Are you sure you want to delete this integration?"
                            >
                                Delete
                            </ConfirmButton>
                        )
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(RechargeIntegrationDetail)
