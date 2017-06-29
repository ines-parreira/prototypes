import React, {PropTypes} from 'react'
import ToggleButton from '../../../../common/components/ToggleButton'
import ConfirmButton from '../../../../common/components/ConfirmButton'

export default class AircallIntegrationListItem extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired,
    }

    state = {
        isDeleting: false
    }

    _toggle = (value) => {
        const integrationId = this.props.integration.get('id')
        return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
    }

    _delete = () => {
        this.setState({isDeleting: true})
        this.props.delete(this.props.integration)
            .then(() => this.setState({isDeleting: false}))
    }

    render() {
        const {integration: inte} = this.props
        const isDisabled = inte.get('deactivated_datetime')

        return (
            <tr>
                <td className="align-middle">
                    <div>
                        <b className="mr-2">{inte.get('name')}</b>
                        <span className="text-faded">
                            {inte.getIn(['meta', 'address'])}
                        </span>
                    </div>
                </td>
                <td className="smallest align-middle">
                    <ToggleButton
                        value={!isDisabled}
                        onChange={this._toggle}
                    />
                </td>
                <td className="smallest align-middle">
                    <ConfirmButton
                        color="danger"
                        loading={this.state.isDeleting}
                        outline
                        confirm={this._delete}
                        content="Are you sure you want to delete this integration?"
                    >
                        Delete
                    </ConfirmButton>
                </td>
            </tr>
        )
    }
}
