import React from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'

import {IntegrationType} from '../../../../../models/integration/types'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integration: Map<string, any>
}

export default function PhoneIntegrationListItem({
    integration,
}: Props): JSX.Element {
    const id: string = integration.get('id')
    const emoji = integration.getIn(['meta', 'emoji'])
    const editLink = `/app/settings/integrations/${IntegrationType.PhoneIntegrationType}/${id}/preferences`

    return (
        <tr>
            <td className="link-full-td">
                <Link to={editLink}>
                    <div>
                        <b className="mr-2">
                            {!!emoji && <span className="mr-3">{emoji}</span>}
                            {integration.get('name')}
                        </b>
                        <span className="text-faded">
                            {integration.getIn([
                                'meta',
                                'twilio',
                                'incoming_phone_number',
                                'friendly_name',
                            ])}
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
