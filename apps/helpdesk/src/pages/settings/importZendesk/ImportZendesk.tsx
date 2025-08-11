import { useEffectOnce } from '@repo/hooks'
import classnames from 'classnames'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import { fetchIntegrations } from 'state/integrations/actions'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { RootState } from 'state/types'

import ImportZendeskDataList from './zendesk/ImportZendeskDataList'

import css from '../settings.less'

const ImportZendesk = () => {
    const dispatch = useAppDispatch()
    const zendeskIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Zendesk),
    )

    const loading = useAppSelector(
        (state: RootState) =>
            state.integrations.getIn([
                'state',
                'loading',
                'integrations',
            ]) as boolean,
    )

    useEffectOnce(() => {
        void dispatch(fetchIntegrations())
    })

    if (loading) {
        return <Loader />
    }

    return (
        <div className="full-width">
            <PageHeader title="Import data">
                <Link
                    to="/app/settings/import-zendesk/zendesk"
                    className="float-right"
                >
                    <Button>Add account</Button>
                </Link>
            </PageHeader>
            <div className={css.pageContainer}>
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
                        actionHref="https://link.gorgias.com/m8v"
                    >
                        When you activate the integration, 2 years of data will
                        be loaded from Zendesk at first, then continuous syncing
                        will be enabled automatically.{' '}
                    </LinkAlert>
                    {zendeskIntegrations.length === 0 ? (
                        <span>
                            {"You don't have any imports at the moment"}
                        </span>
                    ) : (
                        <ImportZendeskDataList />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ImportZendesk
