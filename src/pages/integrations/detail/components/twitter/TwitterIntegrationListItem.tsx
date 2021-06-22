import React, {useCallback} from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'

import {
    activateIntegration,
    deactivateIntegration,
} from '../../../../../state/integrations/actions'
import ToggleButton from '../../../../common/components/ToggleButton'
import ForwardIcon from '../ForwardIcon.js'

type Props = {
    integration: Map<string, any>
    actions: {
        activateIntegration: typeof activateIntegration
        deactivateIntegration: typeof deactivateIntegration
    }
}

export default function TwitterIntegrationListItem({
    integration,
    actions,
}: Props): JSX.Element {
    const toggleIntegration = useCallback(
        (value: boolean) => {
            const integrationId = +integration.get('id')

            if (value) {
                actions.activateIntegration(integrationId)
            } else {
                actions.deactivateIntegration(integrationId)
            }

            return null
        },
        [integration, actions]
    )

    const isDisabled = integration.get('deactivated_datetime')
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
                <ToggleButton
                    value={!isDisabled}
                    onChange={toggleIntegration}
                />
            </td>
            <td className="smallest align-middle">
                <ForwardIcon href={editLink} />
            </td>
        </tr>
    )
}
