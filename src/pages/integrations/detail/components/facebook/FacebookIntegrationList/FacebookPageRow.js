import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'

import ForwardIcon from '../../ForwardIcon.tsx'

import FacebookLoginButton from '../FacebookLoginButton'

export default class FacebookPageRow extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
    }

    render() {
        const {integration} = this.props
        const isDisabled = integration.get('deactivated_datetime')
        const integrationMeta = integration.get('meta')

        if (!integrationMeta || integrationMeta.isEmpty()) {
            return null
        }

        const editLink = `/app/settings/integrations/facebook/${integration.get(
            'id'
        )}/overview`

        return (
            <tr className="FacebookPageRow">
                <td className="smallest align-middle">
                    <img
                        style={{
                            height: '23px',
                            maxWidth: '23px',
                            overflow: 'hidden',
                        }}
                        className="rounded"
                        alt={integrationMeta.get('name')}
                        src={integrationMeta.getIn(['picture', 'data', 'url'])}
                    />
                </td>
                <td className="link-full-td">
                    <Link to={editLink}>
                        <div>
                            <b className="mr-2">
                                {integrationMeta.get('name')}
                            </b>
                            <span className="text-faded">
                                {integrationMeta.get('category')}
                            </span>
                        </div>
                    </Link>
                </td>
                <td className="smallest align-middle p-0">
                    <div>{isDisabled && <FacebookLoginButton reconnect />}</div>
                </td>
                <td className="smallest align-middle">
                    <ForwardIcon href={editLink} />
                </td>
            </tr>
        )
    }
}
