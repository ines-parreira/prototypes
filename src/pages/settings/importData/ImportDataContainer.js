import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Alert, Container} from 'reactstrap'

import PageHeader from '../../common/components/PageHeader.tsx'

import ImportDataList from './ImportDataList'

import * as integrationSelectors from './../../../state/integrations/selectors.ts'

import * as integrationActions from './../../../state/integrations/actions.ts'

@connect(
    (state) => {
        return {
            integrations: integrationSelectors.getIntegrationsByTypes(
                'zendesk'
            )(state),
        }
    },
    {
        fetchIntegrations: integrationActions.fetchIntegrations,
    }
)
export default class ImportDataContainer extends React.Component {
    static propTypes = {
        integrations: ImmutablePropTypes.list.isRequired,
        fetchIntegrations: PropTypes.func.isRequired,
    }

    componentWillMount() {
        this.props.fetchIntegrations()
    }

    _renderIntegration() {
        const {integrations} = this.props

        if (!integrations.isEmpty()) {
            const isPending =
                integrations.filter(
                    (integration) =>
                        integration.getIn(['meta', 'status']) === 'pending'
                ).size > 0
            const isCompleted =
                integrations.filter((integration) =>
                    ['success', 'failure'].includes(
                        integration.getIn(['meta', 'status'])
                    )
                ).size === integrations.size
            if (isPending) {
                return (
                    <Alert color="info" className="mb-4">
                        <p>
                            <b className="alert-heading">
                                <i className="material-icons md-spin mr-2">
                                    refresh
                                </i>
                                Importing your Zendesk data
                            </b>
                        </p>
                        <p>
                            We are currently importing all your Zendesk data
                            (tickets, agents, admins, end-users and macros). We
                            will notify you by email when the import is done.
                        </p>
                    </Alert>
                )
            } else if (isCompleted) {
                return (
                    <Alert color="success" className="mb-4">
                        <p>
                            <b className="alert-heading">
                                <i className="material-icons mr-2">check</i>
                                Import from Zendesk completed
                            </b>
                        </p>
                        <p>
                            We have finished importing all your Zendesk data
                            (tickets, agents, admins, end-users and macros).
                        </p>
                    </Alert>
                )
            }
        }

        return null
    }

    render() {
        return (
            <div className="full-width">
                <PageHeader title="Import data" />
                <Container fluid className="page-container">
                    <div className="mb-3">
                        <p>
                            Import data (one way) from your current helpdesk
                            into Gorgias. Note: The import is performed one time
                            only and will not sync your tickets continuously.
                        </p>
                        {this._renderIntegration()}
                    </div>
                    <ImportDataList />
                </Container>
            </div>
        )
    }
}
