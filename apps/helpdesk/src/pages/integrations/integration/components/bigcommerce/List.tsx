import type { List as ImmutableList, Map } from 'immutable'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import ConnectLink from 'pages/integrations/components/ConnectLink'

import NoIntegration from '../NoIntegration'
import { getConnectUrl } from './Utils'

import css from './List.less'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    loading: Map<any, any>
}

function List({ integrations, loading }: Props) {
    if (loading.get('integrations', false)) {
        return <Loader />
    }
    return (
        <>
            {!integrations.isEmpty() && (
                <ul className={css.list}>
                    {integrations
                        .valueSeq()
                        .toArray()
                        .map((integration) => {
                            const editLink = `/app/settings/integrations/bigcommerce/${
                                integration!.get('id') as number
                            }`
                            const reactivateUrl = getConnectUrl()
                            const isDisabled = integration!.get(
                                'deactivated_datetime',
                            )
                            const isSubmitting =
                                loading.get('updateIntegration')
                            return (
                                <li
                                    className={css.listItem}
                                    key={integration!.get('id')}
                                >
                                    <Link to={editLink} className={css.link}>
                                        <span>{integration?.get('name')}</span>
                                    </Link>
                                    {isDisabled && (
                                        <ConnectLink
                                            connectUrl={
                                                isSubmitting
                                                    ? '#'
                                                    : reactivateUrl
                                            }
                                            integrationTitle={
                                                IntegrationType.BigCommerce
                                            }
                                            isExternal={true}
                                        >
                                            <Button
                                                type="button"
                                                isDisabled={isSubmitting}
                                                className={css.actionLink}
                                            >
                                                Reconnect
                                            </Button>
                                        </ConnectLink>
                                    )}
                                </li>
                            )
                        })}
                </ul>
            )}
            {integrations.isEmpty() && (
                <div className={css.wrapper}>
                    <NoIntegration />
                </div>
            )}
        </>
    )
}

export default List
