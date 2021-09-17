import React, {Component} from 'react'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
import classNames from 'classnames'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    Row,
    Col,
} from 'reactstrap'
import {parse} from 'query-string'
import {connect, ConnectedProps} from 'react-redux'

import {
    SMOOCH_LANGUAGE_DEFAULT,
    SMOOCH_LANGUAGE_OPTIONS,
} from '../../../../../config/integrations/smooch'
import {
    activateIntegration,
    deactivateIntegration,
    deleteIntegration,
    triggerCreateSuccess,
    updateOrCreateIntegration,
} from '../../../../../state/integrations/actions'

import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'
import Loader from '../../../../common/components/Loader/Loader'
import PageHeader from '../../../../common/components/PageHeader'

import SmoochIntegrationNavigation from './SmoochIntegrationNavigation'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
} & RouteComponentProps &
    ConnectedProps<typeof connector>

type State = {
    name: string
    language: string
}

export class SmoochIntegrationDetail extends Component<Props, State> {
    isInitialized = false

    state = {
        name: '',
        language: SMOOCH_LANGUAGE_DEFAULT,
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this.setState({
                name: this.props.integration.get('name'),
                language:
                    this.props.integration.getIn(['meta', 'language']) ||
                    SMOOCH_LANGUAGE_DEFAULT,
            })
            this.isInitialized = true
        }
    }

    componentWillUpdate(nextProps: Props) {
        const {integration} = nextProps

        if (!this.isInitialized && !integration.isEmpty()) {
            this.setState({
                name: integration.get('name'),
                language:
                    integration.getIn(['meta', 'language']) ||
                    SMOOCH_LANGUAGE_DEFAULT,
            })
            this.isInitialized = true
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const isAuthenticating =
            parse(nextProps.location.search).action === 'authentication'

        if (
            this.props.integration.isEmpty() &&
            !nextProps.integration.isEmpty() &&
            isAuthenticating
        ) {
            this.props.triggerCreateSuccess(nextProps.integration.toJS())
        }
    }

    _setName = (name: string) => {
        this.setState({name})
    }

    _setLanguage = (language: string) => {
        this.setState({language})
    }

    _handleSubmit = (event: React.SyntheticEvent<any>) => {
        event.preventDefault()

        const integrationData = fromJS({
            id: this.props.integration.get('id'),
            name: this.state.name,
            meta: (this.props.integration.get('meta') as Map<any, any>).set(
                'language',
                this.state.language
            ),
        })

        return this.props.updateOrCreateIntegration(integrationData)
    }

    render() {
        const {
            activateIntegration,
            deactivateIntegration,
            deleteIntegration,
            integration,
            loading,
        } = this.props

        const isSubmitting =
            loading.get('updateIntegration') === integration.get('id')
        const isActive = !integration.get('deactivated_datetime')

        const ctaIsLoading = isSubmitting

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/smooch">
                                    Smooch
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <SmoochIntegrationNavigation integration={integration} />

                <Container fluid className="page-container">
                    <Row>
                        <Col md="8">
                            <Form onSubmit={this._handleSubmit}>
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Smooch app name"
                                    placeholder="The name of your Smooch app"
                                    value={this.state.name}
                                    onChange={this._setName}
                                    required
                                />

                                <InputField
                                    type="select"
                                    value={this.state.language}
                                    options={SMOOCH_LANGUAGE_OPTIONS.toJS()}
                                    onChange={this._setLanguage}
                                    label="Language"
                                >
                                    {SMOOCH_LANGUAGE_OPTIONS.map((option) => (
                                        <option
                                            key={option!.get('value')}
                                            value={option!.get('value')}
                                        >
                                            {option!.get('label')}
                                        </option>
                                    ))}
                                </InputField>

                                <div>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classNames({
                                            'btn-loading': ctaIsLoading,
                                        })}
                                        disabled={ctaIsLoading}
                                    >
                                        Save changes
                                    </Button>

                                    {isActive ? (
                                        <Button
                                            type="button"
                                            color="warning"
                                            outline
                                            className={classNames('ml-2', {
                                                'btn-loading': isSubmitting,
                                            })}
                                            disabled={isSubmitting}
                                            onClick={() =>
                                                deactivateIntegration(
                                                    integration.get('id')
                                                )
                                            }
                                        >
                                            Deactivate
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            color="success"
                                            className={classNames('ml-2', {
                                                'btn-loading': isSubmitting,
                                            })}
                                            disabled={isSubmitting}
                                            onClick={() =>
                                                activateIntegration(
                                                    integration.get('id')
                                                )
                                            }
                                        >
                                            Re-activate
                                        </Button>
                                    )}

                                    <ConfirmButton
                                        className="float-right"
                                        color="secondary"
                                        confirm={() =>
                                            deleteIntegration(integration)
                                        }
                                        content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                    >
                                        <i className="material-icons mr-1 text-danger">
                                            delete
                                        </i>
                                        Delete integration
                                    </ConfirmButton>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(null, {
    activateIntegration,
    deactivateIntegration,
    deleteIntegration,
    triggerCreateSuccess,
    updateOrCreateIntegration,
})

export default withRouter(connector(SmoochIntegrationDetail))
