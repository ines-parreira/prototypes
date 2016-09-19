import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import classNames from 'classnames'
import {INTEGRATION_TYPE_TO_ICON} from '../../../../config'

export default class IntegrationListRow extends React.Component {
    render() {
        const {integrationType, onClickAdd, onClickEdit, isLoading} = this.props

        const triggerEdit = onClickEdit ||
            (() => browserHistory.push(`/app/integrations/${integrationType.get('type')}`))

        const triggerAdd = onClickAdd ||
            (() => browserHistory.push(`/app/integrations/${integrationType.get('type')}/new`))

        const buttonClasses = ['ui', 'basic', 'light', 'blue', 'button', 'right', {loading: isLoading}]
        const button = integrationType.get('count') <= 0 ? (
            <button className={classNames(buttonClasses)} onClick={triggerAdd}>
                Add
            </button>
        ) : (
            <button className={classNames(buttonClasses)} onClick={triggerEdit}>
                Edit
            </button>
        )

        return (
            <tr className="IntegrationListRow">
                <td className="center aligned">
                    <i className={`${INTEGRATION_TYPE_TO_ICON[integrationType.get('type')]} huge`}/>
                </td>
                <td>
                    <div className="ui header">
                        <span className="subject">
                            {integrationType.get('title')}
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

IntegrationListRow.propTypes = {
    integrationType: PropTypes.object.isRequired,
    onClickAdd: PropTypes.func,
    onClickEdit: PropTypes.func,
    isLoading: PropTypes.bool
}
