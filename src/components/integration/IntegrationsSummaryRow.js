import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import _ from 'lodash'
import {INTEGRATION_TYPE_TO_ICON} from '../../constants'


export default class IntegrationsSummaryRow extends React.Component {
    render() {
        const {integrationType, onClickConnect, onClickEdit} = this.props

        const triggerEdit = onClickEdit ||
            (() => browserHistory.push(`/app/settings/integrations/${integrationType.get('type')}`))

        const triggerConnect = onClickConnect ||
            (() => browserHistory.push(`/app/settings/integrations/${integrationType.get('type')}/new`))

        const button = integrationType.get('count') <= 0 ? (
            <button className="ui basic light blue button right" onClick={triggerConnect}>
                Connect
            </button>
        ) : (
            <button className="ui basic light blue button right" onClick={triggerEdit}>
                Edit
            </button>
        )

        return (
            <tr className="IntegrationsSummaryRow">
                <td>
                    <i className={`${INTEGRATION_TYPE_TO_ICON[integrationType.get('type')]} huge`}/>
                </td>
                <td>
                    <div className="ui header">
                        <span className="subject">
                            {_.capitalize(integrationType.get('type'))}
                            {integrationType.get('count') > 0 ? <span> ({integrationType.get('count')})</span> : ''}
                        </span>
                    </div>
                    {integrationType.get('description')}
                </td>
                <td>
                    {button}
                </td>
            </tr>
        )
    }
}


IntegrationsSummaryRow.propTypes = {
    integrationType: PropTypes.object.isRequired,
    onClickConnect: PropTypes.func,
    onClickEdit: PropTypes.func
}
