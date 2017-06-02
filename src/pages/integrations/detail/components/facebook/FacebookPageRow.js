import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
import * as integrationsActions from '../../../../../state/integrations/actions'

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class FacebookPageRow extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    _toggleIntegration = (value) => {
        const integrationId = this.props.integration.get('id')
        return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
    }


    render() {
        const {integration} = this.props
        const isDisabled = integration.get('deactivated_datetime')
        const page = integration.get('facebook')

        if (!page || page.isEmpty()) {
            return null
        }

        const editLink = `/app/integrations/facebook/${integration.get('id')}`

        return (
            <tr className="FacebookPageRow">
                <td className="smallest">
                    <img
                        style={{
                            height: '23px',
                            maxWidth: '23px',
                            overflow: 'hidden',
                        }}
                        className="rounded"
                        alt={page.get('name')}
                        src={page.getIn(['picture', 'data', 'url'])}
                    />
                </td>
                <td className="link-full-td">
                    <Link to={editLink}>
                        <div>
                            <b className="mr-2">{page.get('name')}</b>
                            <span className="text-faded">
                                {page.get('category')}
                            </span>
                        </div>
                    </Link>
                </td>
                <td className="smallest align-middle">
                    <ToggleCheckbox
                        input={{
                            onChange: this._toggleIntegration,
                            value: !isDisabled,
                        }}
                    />
                </td>
            </tr>
        )
    }
}
