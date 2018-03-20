import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import {fromJS} from 'immutable'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import _pick from 'lodash/pick'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
} from 'reactstrap'

import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'

import Loader from '../../../../common/components/Loader'
import PageHeader from '../../../../common/components/PageHeader'
import RealtimeMessagingIntegrationNavigation from '../../../common/RealtimeMessagingIntegrationNavigation'

class SmoochIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate
    }

    state = {
        name: ''
    }

    componentDidMount() {
        if (!this.state.integration && !this.props.integration.isEmpty()) {
            this.setState({name: this.props.integration.get('name')})
            this.isInitialized = true
        }
    }

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState({name: integration.get('name')})
            this.isInitialized = true
        }
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

    _addNewSmooch = () => {
        window.location.href = this.props.redirectUri
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        if (!this.props.isUpdate) {
            return this._addNewSmooch()
        }

        let doc = fromJS({
            name: this.state.name
        })

        // only update
        const integration = this.props.integration
        doc = fromJS(_pick(doc.set('id', integration.get('id')).toJS(), ['id', 'name']))
        return this.props.actions.updateOrCreateIntegration(doc)
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    render() {
        const {actions, integration, isUpdate, loading} = this.props

        const isSubmitting = this._isSubmitting()
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired = this.props.integration.getIn(['meta', 'oauth', 'status']) === 'pending'

        const ctaIsLoading = isSubmitting || authenticationRequired

        if (loading.get('integration')) {
            return <Loader/>
        }

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/smooch">Smooch</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active={!isUpdate}>
                            {isUpdate ? integration.get('name') : 'Add'}
                        </BreadcrumbItem>
                        {
                            isUpdate && (
                                <BreadcrumbItem active>
                                    Overview
                                </BreadcrumbItem>
                            )
                        }
                    </Breadcrumb>
                )}/>

                <RealtimeMessagingIntegrationNavigation integration={integration}/>

                <Container fluid className="page-container">
                    <Form onSubmit={this._handleSubmit}>
                        {
                            isUpdate && (
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Smooch app name"
                                    placeholder="The name of your Smooch app"
                                    value={this.state.name}
                                    onChange={(name) => this.setState({name})}
                                    required
                                />
                            )
                        }

                        <div>
                            <Button
                                type="submit"
                                color="success"
                                className={classNames({
                                    'btn-loading': ctaIsLoading,
                                })}
                                disabled={ctaIsLoading}
                            >
                                {isUpdate ? 'Save changes' : 'Connect my Smooch'}
                            </Button>

                            {
                                !authenticationRequired && isUpdate && isActive && (
                                    <Button
                                        type="button"
                                        color="warning"
                                        outline
                                        className={classNames('ml-2', {
                                            'btn-loading': isSubmitting,
                                        })}
                                        disabled={isSubmitting}
                                        onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                    >
                                        Deactivate
                                    </Button>
                                )
                            }

                            {
                                !authenticationRequired && isUpdate && !isActive && (
                                    <Button
                                        type="button"
                                        color="success"
                                        className={classNames('ml-2', {
                                            'btn-loading': isSubmitting,
                                        })}
                                        disabled={isSubmitting}
                                        onClick={() => actions.activateIntegration(integration.get('id'))}
                                    >
                                        Re-activate
                                    </Button>
                                )
                            }

                            {
                                isUpdate && (
                                    <ConfirmButton
                                        className="float-right"
                                        color="danger"
                                        outline
                                        confirm={() => actions.deleteIntegration(integration)}
                                        content="Are you sure you want to delete this integration?"
                                    >
                                        Delete
                                    </ConfirmButton>
                                )
                            }
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }
}

SmoochIntegrationDetail.propTypes = {
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,

    redirectUri: PropTypes.string.isRequired,

    // Router
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
}

export default withRouter(SmoochIntegrationDetail)
