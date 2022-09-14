import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container} from 'reactstrap'
import {useEffectOnce} from 'react-use'
import {bindActionCreators} from 'redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import {RootState, StoreDispatch} from 'state/types'
import {IntegrationType, ZendeskIntegration} from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import * as integrationSelectors from 'state/integrations/selectors'
import * as integrationActions from 'state/integrations/actions'
import Button from 'pages/common/components/button/Button'

import css from '../settings.less'
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
                <Link
                    to="/app/settings/import-data/zendesk"
                    className="float-right"
                >
                    <Button>Add account</Button>
                </Link>
            </PageHeader>
            <Container fluid className={css.pageContainer}>
                <div className={classnames('body-regular', css.contentWrapper)}>
                    <div className={classnames(css.mb32)}>
                        <p>
                            Import data (one way) from your current helpdesk
                            into Gorgias.
                        </p>
                    </div>
                    <LinkAlert
                        className={css.mb16}
                        icon
                        actionLabel="Read more"
                        actionHref="https://docs.gorgias.com/helpdesk-migration/switching-from-zendesk"
                    >
                        When you activate the integration, 2 years of data will
                        be loaded from Zendesk at first, then continuous syncing
                        will be enabled automatically.{' '}
                    </LinkAlert>
                    {zendeskIntegrations.length === 0 ? (
                        <span>You don't have any imports at the moment</span>
                    ) : (
                        <ImportZendeskDataList />
                    )}
                </div>
            </Container>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        loading: state.integrations.getIn(['state', 'loading', 'integrations']),
        zendeskIntegrations:
            integrationSelectors.getIntegrationsByType<ZendeskIntegration>(
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
