import React from 'react'
import PropTypes from 'prop-types'
import {Link, withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {
    Breadcrumb,
    BreadcrumbItem,
    Table,
    Button,
    Container,
    Alert,
} from 'reactstrap'
import {parse} from 'query-string'
import moment from 'moment'

import {getIntegrationConfig} from '../../../../state/integrations/helpers.ts'
import {notify} from '../../../../state/notifications/actions.ts'
import PageHeader from '../../../common/components/PageHeader.tsx'

import {
    SMOOCH_INSIDE_INTEGRATION_TYPE,
    AIRCALL_INTEGRATION_TYPE,
} from '../../../../constants/integration.ts'

import NoIntegration from './NoIntegration'

/**
 * A generic component to edit integrations of a given type.
 * We can then have specific components for each integration type using this one.
 */
@connect(null, {
    notify,
})
class IntegrationList extends React.Component {
    static propTypes = {
        integrationType: PropTypes.string.isRequired, // The type of the integrations we're displaying
        integrations: PropTypes.object.isRequired, // The integrations for the relevant type only
        createIntegration: PropTypes.func.isRequired, // The callback to create a new integration for this type.
        createIntegrationButtonClassName: PropTypes.string, // custom class name for the create integration button
        createIntegrationButtonContent: PropTypes.node.isRequired, // The content of the button to create a new integration
        createIntegrationButtonOnClick: PropTypes.func, // function executed when user click on button to create a new integration
        longTypeDescription: PropTypes.node,
        loading: PropTypes.object.isRequired, // A map for different loading status(es)
        alert: PropTypes.node,
        // A function that takes an integration and returns the rendered individual integration. Used to display the list of integrations.
        integrationToItemDisplay: PropTypes.func.isRequired,
        createIntegrationButtonHidden: PropTypes.bool.isRequired,

        // Router
        location: PropTypes.object.isRequired,
        params: PropTypes.object.isRequired,

        // Actions
        notify: PropTypes.func.isRequired,
    }

    static defaultProps = {
        createIntegrationButtonHidden: false,
    }

    onButtonClick = () => {
        if (this.props.integrationType === SMOOCH_INSIDE_INTEGRATION_TYPE) {
            this.props.notify({
                status: 'error',
                message:
                    'Cannot create a chat integration because it is deprecated. ' +
                    'Please use the new chat integration instead.',
            })
            return
        }

        if (this.props.createIntegrationButtonOnClick) {
            this.props.createIntegrationButtonOnClick()
        }
        this.props.createIntegration()
    }

    displayAircallWebhookWarning = (integrationType, integrations) => {
        if (integrationType !== AIRCALL_INTEGRATION_TYPE) {
            return
        }

        const maxDate = moment('2021-05-20')

        const olderIntegrations = integrations.filter((integration) => {
            return moment(integration.get('created_datetime')).isBefore(maxDate)
        })

        if (olderIntegrations.size > 0) {
            return (
                <Alert color="warning">
                    Due to security reasons, we updated the webhook URL for
                    Aircall. Please update your integration by clicking ”Connect
                    Aircall”.
                </Alert>
            )
        }
    }

    componentWillMount() {
        if (parse(this.props.location.search).status === 'create-error') {
            this.props.notify({
                status: 'error',
                message: `Something went wrong while creating your integration. Please wait a few minutes and ' +
                    'try again. If the problem persists, contact us at ${window.GORGIAS_SUPPORT_EMAIL}.`,
            })
        }
    }

    render() {
        const {
            integrations,
            integrationType,
            createIntegrationButtonContent,
            createIntegrationButtonClassName,
            longTypeDescription,
            integrationToItemDisplay,
            loading,
            alert,
        } = this.props

        const integrationTitle = getIntegrationConfig(integrationType).title

        return (
            <div className="w-100">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {integrationTitle}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    {!this.props.createIntegrationButtonHidden && (
                        <Button
                            type="submit"
                            color="success"
                            onClick={this.onButtonClick}
                            className={createIntegrationButtonClassName}
                        >
                            {createIntegrationButtonContent}
                        </Button>
                    )}
                </PageHeader>

                <Container className="page-container" fluid>
                    <div className="mb-3">{longTypeDescription}</div>
                    {alert}
                    {this.displayAircallWebhookWarning(
                        integrationType,
                        integrations
                    )}

                    {integrations.isEmpty() && (
                        <div className="mt-3">
                            <NoIntegration
                                type={integrationType}
                                loading={loading.get('integrations', false)}
                            />
                        </div>
                    )}
                </Container>

                {!integrations.isEmpty() && (
                    <Table className="table-integrations mt-3" hover>
                        <tbody>
                            {integrations
                                .valueSeq()
                                .map(integrationToItemDisplay)}
                        </tbody>
                    </Table>
                )}
            </div>
        )
    }
}

export default withRouter(IntegrationList)
