import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Alert, Button, Container} from 'reactstrap'
import {useEffectOnce} from 'react-use'
import {bindActionCreators} from 'redux'

import PageHeader from '../../common/components/PageHeader'
import history from '../../history'
import {RootState, StoreDispatch} from '../../../state/types'
import {IntegrationType} from '../../../models/integration/types'
import Loader from '../../common/components/Loader/Loader'
import * as integrationSelectors from '../../../state/integrations/selectors'
import * as integrationActions from '../../../state/integrations/actions'

import ImportZendeskDataList from './zendesk/ImportZendeskDataList'

export const ImportDataContainer = (
    props: ConnectedProps<typeof connector>
) => {
    const {zendeskIntegrations, actions, loading} = props

    useEffectOnce(() => {
        actions.fetchIntegrations()
    })

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
                >
                    Add account
                </Button>
            </PageHeader>
            <Container fluid className="page-container">
                <div className="mb-5">
                    <p>
                        Import data (one way) from your current helpdesk into
                        Gorgias.
                    </p>
                </div>
                <Alert color="info" className="col-md-5">
                    <i className="material-icons">info_outline</i> When you
                    activate the integration, 2 years of data will be loaded
                    from Zendesk at first, then continuous syncing will be
                    enabled automatically.{' '}
                    <a
                        className="text-underline"
                        href="https://docs.gorgias.com/helpdesk-migration/switching-from-zendesk"
                    >
                        Read more
                    </a>
                </Alert>
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
            IntegrationType.Zendesk
        )(state),
    }
}

const mapDispatchToProps = (dispatch: StoreDispatch) => {
    return {
        actions: bindActionCreators(integrationActions, dispatch),
    }
}
const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(ImportDataContainer)
