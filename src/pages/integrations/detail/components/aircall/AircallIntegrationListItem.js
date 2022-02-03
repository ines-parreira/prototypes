import React from 'react'
import PropTypes from 'prop-types'

import ToggleInput from '../../../../common/forms/ToggleInput.tsx'

export default class AircallIntegrationListItem extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    state = {
        isDeleting: false,
    }

    _toggle = (value) => {
        const integrationId = this.props.integration.get('id')
        return value
            ? this.props.activate(integrationId)
            : this.props.deactivate(integrationId)
    }

    render() {
        const {integration: inte} = this.props
        const isDisabled = inte.get('deactivated_datetime')

        return (
            <tr>
                <td className="smallest align-middle">
                    <ToggleInput
                        isToggled={!isDisabled}
                        onClick={this._toggle}
                    />
                </td>
                <td className="align-middle">
                    <div>
                        <b className="mr-2">{inte.get('name')}</b>
                        <span className="text-faded">
                            {inte.getIn(['meta', 'address'])}
                        </span>
                    </div>
                </td>
            </tr>
        )
    }
}
