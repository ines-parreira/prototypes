import React, {PropTypes} from 'react'
import {Link} from 'react-router'

export default class FacebookPageRow extends React.Component {
    _enable = () => {
        const {integration, actions} = this.props
        actions.activateIntegration(integration)
    }

    render() {
        const {integration} = this.props
        const isDisabled = integration.get('deactivated_datetime')
        const page = integration.get('facebook')

        if (!page || page.isEmpty()) {
            return null
        }

        return (
            <tr className="FacebookPageRow">
                <td>
                    <img alt={page.get('name')} src={page.getIn(['picture', 'data', 'url'])}/>
                </td>
                <td>
                    <div className="ui header">
                        <span className="subject">{page.get('name')}</span>

                        <div className="body sub header">
                            {page.get('category')}
                        </div>
                    </div>
                    <div>
                        {page.get('about')}
                    </div>
                </td>
                <td className="three wide middle aligned column">
                    {!isDisabled && (
                        <Link
                            className="ui basic light blue floated right button"
                            to={`/app/integrations/facebook/${integration.get('id')}`}
                        >
                            Edit
                        </Link>
                    )}
                    {isDisabled && (
                        <button
                            className="ui basic green floated right button"
                            onClick={this._enable}
                        >
                            Enable
                        </button>
                    )}
                </td>
            </tr>
        )
    }
}

FacebookPageRow.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
}
