import type { Map } from 'immutable'
import { Link } from 'react-router-dom'

import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'

import FacebookIntegrationLoginButton from '../FacebookLoginButton/FacebookIntegrationLoginButton'

const FacebookPageRow = ({ integration }: { integration: Map<any, any> }) => {
    const isDisabled = integration.get('deactivated_datetime')
    const integrationMeta: Map<any, any> = integration.get('meta')

    if (!integrationMeta || integrationMeta.isEmpty()) {
        return null
    }

    const editLink = `/app/settings/integrations/facebook/${
        integration.get('id') as number
    }/overview`

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
                        <b className="mr-2">{integrationMeta.get('name')}</b>
                        <span className="text-faded">
                            {integrationMeta.get('category')}
                        </span>
                    </div>
                </Link>
            </td>
            <td className="smallest align-middle p-0">
                <div>
                    {isDisabled && <FacebookIntegrationLoginButton reconnect />}
                </div>
            </td>
            <td className="smallest align-middle">
                <ForwardIcon href={editLink} />
            </td>
        </tr>
    )
}

export default FacebookPageRow
