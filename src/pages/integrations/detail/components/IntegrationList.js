import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Link, withRouter} from 'react-router'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Table, Button} from 'reactstrap'

import NoIntegration from './NoIntegration'
import {getIntegrationsList, getIconFromType} from '../../../../state/integrations/helpers'
import {notify} from '../../../../state/notifications/actions'
import {sourceTypeToIcon} from '../../../../config/ticket'

/**
 * A generic component to edit integrations of a given type.
 * We can then have specific components for each integration type using this one.
 */
@connect(null, {
    notify
})
class IntegrationList extends React.Component {
    static propTypes = {
        integrationType: PropTypes.string.isRequired, // The type of the integrations we're displaying
        integrations: PropTypes.object.isRequired, // The integrations for the relevant type only
        createIntegration: PropTypes.func.isRequired, // The callback to create a new integration for this type.
        createIntegrationButtonText: PropTypes.string.isRequired, // The text for the button to create a new integration
        createIntegrationButtonOnClick: PropTypes.func, // function executed when user click on button to create a new integration
        longTypeDescription: PropTypes.node,
        loading: PropTypes.object.isRequired,  // A map for different loading status(es)
        // A function that takes an integration and returns the rendered individual integration. Used to display the list of integrations.
        integrationToItemDisplay: PropTypes.func.isRequired,
        createIntegrationButtonHidden: PropTypes.bool.isRequired,

        // Router
        location: PropTypes.object.isRequired,
        params: PropTypes.object.isRequired,

        // Actions
        notify: PropTypes.func.isRequired
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
                type: 'error',
                message: 'Something went wrong while creating your integration. Please wait a few minutes and ' +
                    'try again. If the problem persists, contact us at support@gorgias.io.',
            })
        }
    }

    render() {
        const {
            integrations,
            integrationType,
            createIntegrationButtonText,
            longTypeDescription,
            integrationToItemDisplay,
            loading,
        } = this.props

        const integrationTypes = fromJS(getIntegrationsList(integrations))
        const integrationConfig = integrationTypes.find(i => i.get('type', '') === integrationType, null, fromJS({}))
        const integrationTitle = integrationConfig.get('title')

        return (
            <div className="integrations-list">
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {integrationTitle}
                    </BreadcrumbItem>
                </Breadcrumb>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="d-flex align-items-center m-0">
                        {
                            integrationConfig.get('image') ? (
                                    <img
                                        role="presentation"
                                        className="mr-3"
                                        src={getIconFromType(integrationType)}
                                    />
                                )
                                : (
                                    <i className={classnames('mr-2', sourceTypeToIcon(integrationConfig.get('type')))} />
                                )
                        }

                        {integrationTitle}
                    </h1>

                    {
                        !this.props.createIntegrationButtonHidden && (
                            <Button
                                type="submit"
                                color="primary"
                                onClick={this.onButtonClick}
                            >
                                {createIntegrationButtonText}
                            </Button>
                        )
                    }
                </div>

                {longTypeDescription}

                {
                    integrations.isEmpty() ? (
                            <div className="mt-3">
                                <NoIntegration
                                    type={integrationType}
                                    loading={loading.get('integrations', false)}
                                />
                            </div>
                        ) : (
                            <Table
                                className="mt-3"
                                hover
                            >
                                <tbody>
                                    {integrations.valueSeq().map(integrationToItemDisplay)}
                                </tbody>
                            </Table>
                        )
                }
            </div>
        )
    }
}

export default withRouter(IntegrationList)
