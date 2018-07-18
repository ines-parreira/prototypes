import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import ImportDataList from './ImportDataList'
import {Alert, Container} from 'reactstrap'

import * as integrationSelectors from './../../../state/integrations/selectors'
import * as accountSelectors from './../../../state/currentAccount/selectors'

import * as integrationActions from './../../../state/integrations/actions'
import PageHeader from '../../common/components/PageHeader'

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
                            We are currently importing all your Zendesk data (tickets, agents, admins, end-users and macros). We will
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
                            We have finished importing all your Zendesk data (tickets, agents, admins, end-users and macros).{' '}
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
            <div className="full-width">
                <PageHeader title="Import data"/>
                <Container fluid className="page-container">
                    <div className="mb-3">
                        <p>
                            Import data (one way) from your current helpdesk into Gorgias.
                            Note: The import is performed one time only and will not sync your tickets continuously.
                        </p>
                        {
                            !isAllowedToCreate && (
                                <Alert color="warning">
                                    <i className="material-icons md-2">warning</i>{' '}
                                    Import operations <strong>consume a lot of resources</strong> which is why this
                                    feature is <strong>not</strong> available for accounts during their <strong>free
                                    trial</strong>.
                                    <br/>
                                    To import data in Gorgias, please subscribe to a <Link
                                    to="/app/settings/billing" className="alert-link">paid plan</Link>.
                                </Alert>
                            )
                        }
                        {
                            this._renderIntegration()
                        }
                    </div>
                    <ImportDataList/>
                </Container>
            </div>
        )
    }
}
