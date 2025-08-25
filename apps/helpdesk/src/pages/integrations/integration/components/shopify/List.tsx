import { List as ImmutableList, Map } from 'immutable'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import Loader from 'pages/common/components/Loader/Loader'

import NoIntegration from '../NoIntegration'

import css from './List.less'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    loading: Map<any, any>
    redirectUri: string
}

function List({ integrations, loading, redirectUri }: Props) {
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
                            const editLink = `/app/settings/integrations/shopify/${
                                integration?.get('id') as number
                            }`
                            const isDisabled = integration?.get(
                                'deactivated_datetime',
                            )
                            const isSubmitting =
                                loading.get('updateIntegration') ===
                                integration?.get('id')

                            const reconnectUrl = redirectUri.replace(
                                '{shop_name}',
                                integration?.getIn(['meta', 'shop_name'], ''),
                            )

                            return (
                                <li
                                    className={css.listItem}
                                    key={integration?.get('id')}
                                >
                                    <Link to={editLink} className={css.link}>
                                        <span>{integration?.get('name')}</span>
                                        <i className="material-icons md-3">
                                            keyboard_arrow_right
                                        </i>
                                    </Link>
                                    {isDisabled && (
                                        <a
                                            href={
                                                isSubmitting
                                                    ? '#'
                                                    : reconnectUrl
                                            }
                                            className={css.actionLink}
                                        >
                                            <Button
                                                type="button"
                                                isDisabled={isSubmitting}
                                            >
                                                Reconnect
                                            </Button>
                                        </a>
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
