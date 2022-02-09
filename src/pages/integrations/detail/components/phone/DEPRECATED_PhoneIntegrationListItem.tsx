import React from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import {IntegrationType} from '../../../../../models/integration/types'
import {PhoneFunction} from '../../../../../business/twilio'
import ForwardIcon from '../ForwardIcon'

import css from './PhoneIntegrationListItem.less'

type Props = {
    integration: Map<string, any>
}

export default function PhoneIntegrationListItem({
    integration,
}: Props): JSX.Element {
    const id: string = integration.get('id')
    const emoji = integration.getIn(['meta', 'emoji'])
    const isIvr = integration.getIn(['meta', 'function']) === PhoneFunction.Ivr
    const editLink = `/app/settings/integrations/${IntegrationType.Phone}/${id}/preferences`

    return (
        <tr>
            <td className="link-full-td">
                <Link to={editLink}>
                    <div>
                        <b>
                            {!!emoji && <span className="mr-3">{emoji}</span>}
                            {integration.get('name')}
                        </b>
                        {isIvr && (
                            <Badge className={classnames('ml-3', css.ivrBadge)}>
                                IVR
                            </Badge>
                        )}
                        <span className="text-faded ml-3">
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
