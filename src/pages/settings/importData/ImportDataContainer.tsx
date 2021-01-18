import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Alert, Button, Container} from 'reactstrap'
import {useEffectOnce} from 'react-use'
import {bindActionCreators} from 'redux'

import PageHeader from '../../common/components/PageHeader'
import history from '../../history'
import {RootState, StoreDispatch} from '../../../state/types'
import {IntegrationType} from '../../../models/integration/types'
import Loader from '../../common/components/Loader/Loader.js'
import * as integrationSelectors from '../../../state/integrations/selectors'
import * as integrationActions from '../../../state/integrations/actions'

import ImportZendeskDataList from './zendesk/ImportZendeskDataList'

export const ImportDataContainer = (
    props: ConnectedProps<typeof connector>
) => {
    const {hasEmailIntegration, zendeskIntegrations, actions, loading} = props

    useEffectOnce(() => {
        actions.fetchIntegrations()
    })

    const importNotAllowedAlert = (): React.ReactChild => {
        return (
            <Alert
                className="col-md-5"
                color="warning"
                hidden={hasEmailIntegration}
            >
                You must add an Email, Gmail or Outlook integration to be able
                to start a data import.
            </Alert>
        )
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div className="full-width">
            <PageHeader title="Import data">
                <Button
                    type="submit"
                    color="success"
                    onClick={() => {
                        history.push('/app/settings/import-data/zendesk')
                    }}
                    className="float-right"
                    disabled={!hasEmailIntegration}
                >
                    Add account
                </Button>
            </PageHeader>
            <Container fluid className="page-container">
                <div className="mb-3">
                    <p>
                        Import data (one way) from your current helpdesk into
                        Gorgias.
                    </p>
                </div>
                <Alert color="info" className="col-md-5">
                    <i className="material-icons">info_outline</i> The import is
                    performed one time only and will not sync your tickets
                    continuously. We import only 2 years data from Zendesk.{' '}
                    <a
                        className="text-underline"
                        href="https://docs.gorgias.com/migrating-helpdesks/switching-from-zendesk#how_does_import_work"
                    >
                        Read more
                    </a>
                </Alert>
                {hasEmailIntegration ? null : importNotAllowedAlert()}
                {zendeskIntegrations.isEmpty() ? (
                    <span>You don't have any imports at the moment</span>
                ) : (
                    <ImportZendeskDataList />
                )}
            </Container>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        loading: state.integrations.getIn(['state', 'loading', 'integrations']),
        zendeskIntegrations: integrationSelectors.getIntegrationsByTypes(
            IntegrationType.ZendeskIntegrationType
        )(state),
        hasEmailIntegration: integrationSelectors.hasAtLeastOneEmailIntegration(
            state
        ),
    }
}

const mapDispatchToProps = (dispatch: StoreDispatch) => {
    return {
        actions: bindActionCreators(integrationActions, dispatch),
    }
}
const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(ImportDataContainer)
