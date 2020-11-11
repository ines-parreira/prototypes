import React from 'react'
import PropTypes from 'prop-types'
import {Link, withRouter} from 'react-router'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Table, Button, Container} from 'reactstrap'

import {getIntegrationsList} from '../../../../state/integrations/helpers.ts'
import {notify} from '../../../../state/notifications/actions.ts'
import PageHeader from '../../../common/components/PageHeader'

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
        if (this.props.createIntegrationButtonOnClick) {
            this.props.createIntegrationButtonOnClick()
        }
        this.props.createIntegration()
    }

    componentWillMount() {
        if (this.props.location.query.status === 'create-error') {
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
        } = this.props

        const integrationTypes = fromJS(getIntegrationsList(integrations))
        const integrationConfig = integrationTypes.find(
            (i) => i.get('type', '') === integrationType,
            null,
            fromJS({})
        )
        const integrationTitle = integrationConfig.get('title')

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
