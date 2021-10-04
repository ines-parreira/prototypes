import React from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'

import ForwardIcon from '../ForwardIcon'

type Props = {
    integration: Map<string, any>
}

export default function TwitterIntegrationListItem({
    integration,
}: Props): JSX.Element {
    const integrationId = integration.get('id')
    const editLink = `/app/settings/integrations/twitter/${
        (integrationId ? integrationId : '') as string
    }`

    return (
        <tr key={integration.get('id')}>
            <td className="link-full-td">
                <Link to={editLink}>
                    <div>
                        <img
                            alt="twitter logo"
                            className="image rounded mr-3"
                            width="32"
                            src={integration.getIn(['meta', 'picture'])}
                        />
                        <b>{integration.get('name')}</b>
                        <span className="ml-3 text-faded">
                            {integration.get('description')}
                        </span>
                    </div>
                </Link>
            </td>
            <td className="smallest align-middle">
                <ForwardIcon href={editLink} />
            </td>
        </tr>
    )
}
