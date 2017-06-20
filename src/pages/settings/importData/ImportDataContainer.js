import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import ImportDataList from './ImportDataList'
import {Alert} from 'reactstrap'

import * as integrationSelectors from './../../../state/integrations/selectors'
import * as accountSelectors from './../../../state/currentAccount/selectors'

import * as integrationActions from './../../../state/integrations/actions'

@connect((state) => {
    return {
        integrations: integrationSelectors.getIntegrationsByTypes('zendesk')(state),
        isAllowedToCreate: accountSelectors.paymentIsActive(state)
    }
}, {
    fetchIntegrations: integrationActions.fetchIntegrations
})
export default class ImportDataContainer extends React.Component {
    static propTypes = {
        integrations: ImmutablePropTypes.list.isRequired,
        isAllowedToCreate: PropTypes.bool.isRequired,
        fetchIntegrations: PropTypes.func.isRequired
    }

    componentWillMount() {
        this.props.fetchIntegrations()
    }

    _renderIntegration() {
        const {integrations} = this.props

        if (!integrations.isEmpty()) {
            const integration = integrations.first()

            if (integration.getIn(['meta', 'status']) === 'pending') {
                return (
                    <Alert
                        color="info"
                        className="mb-4"
                    >
                        <p>
                            <b className="alert-heading">
                                <i className="fa fa-refresh fa-spin mr-2"/>
                                Importing your Zendesk data
                            </b>
                        </p>
                        <p>
                            We are currently importing all your Zendesk data (tickets, users and macros). We will
                            notify you by email when the import is done.{' '}
                            <Link to="/app">Review imported tickets</Link>
                        </p>
                    </Alert>

                )
            } else if (integration.getIn(['meta', 'status']) === 'success') {
                return (
                    <Alert
                        color="success"
                        className="mb-4"
                    >
                        <p>
                            <b className="alert-heading">
                                <i className="fa fa-check mr-2"/>
                                Import from Zendesk completed
                            </b>
                        </p>
                        <p>
                            We have finished importing all your Zendesk data (tickets, users and macros).{' '}
                            <Link to="/app">Review imported tickets</Link>
                        </p>
                    </Alert>

                )
            }
        }

        return null
    }

    render() {
        const {isAllowedToCreate} = this.props

        return (
            <div>
                <div className="mb-3">
                    <h1>
                        <i className="fa fa-cloud-download blue icon mr-2"/>
                        Import data
                    </h1>
                    <p>
                        Import data from your previous helpdesk in Gorgias.
                    </p>
                    {
                        !isAllowedToCreate && (
                            <Alert color="danger">
                                <i className="fa fa-exclamation-circle mr-2" />
                                <strong> This feature is not available for accounts on Free Trial. </strong>
                                To import data in Gorgias, upgrade your <Link
                                to="/app/settings/billing" className="alert-link">plan</Link>.
                            </Alert>
                        )
                    }
                    {
                        this._renderIntegration()
                    }
                </div>
                <ImportDataList/>
            </div>
        )
    }
}
