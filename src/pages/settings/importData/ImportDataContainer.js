import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Alert, Container} from 'reactstrap'

import PageHeader from '../../common/components/PageHeader'

import ImportDataList from './ImportDataList'

import * as integrationSelectors from './../../../state/integrations/selectors.ts'

import * as integrationActions from './../../../state/integrations/actions.ts'
import {ImportStatus} from './zendesk/types.ts'

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

    _getImportStatus(integrations) {
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

        if (integrations.isEmpty()) {
            return ImportStatus.Empty
        } else if (isPending) {
            return ImportStatus.Pending
        } else if (isCompleted) {
            return ImportStatus.Completed
        }
    }

    constructor(props) {
        super(props)

        const {integrations} = this.props
        this.state = {
            importStatus: this._getImportStatus(integrations),
        }
    }

    componentWillMount() {
        this.props.fetchIntegrations()
    }

    _renderIntegration() {
        const {importStatus} = this.state
        if (importStatus === ImportStatus.Pending) {
            return (
                <Alert color="info" className="mb-4">
                    <p>
                        <b className="alert-heading">
                            <i className="material-icons md-spin mr-2">
                                refresh
                            </i>
                            Importing your Zendesk data (It is not possible to
                            run several imports in parallel)
                        </b>
                    </p>
                    <p>
                        We are currently importing all your Zendesk data
                        (tickets, agents, admins, end-users and macros). We will
                        notify you by email when the import is done.
                    </p>
                </Alert>
            )
        } else if (importStatus === ImportStatus.Completed) {
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
        return null
    }

    render() {
        const {importStatus} = this.state

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
                    <ImportDataList
                        isImportPending={importStatus === ImportStatus.Pending}
                    />
                </Container>
            </div>
        )
    }
}
