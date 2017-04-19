import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Badge, Button} from 'reactstrap'

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
                <td className="smallest">
                    <img
                        style={{
                            height: '33px',
                            maxWidth: '33px',
                            overflow: 'hidden',
                        }}
                        className="rounded"
                        alt={page.get('name')}
                        src={page.getIn(['picture', 'data', 'url'])}
                    />
                </td>
                <td style={{verticalAlign: 'middle'}}>
                    <b>{page.get('name')}</b>
                    {' '}
                    <span className="text-faded ml-3">
                        {page.get('category')}
                    </span>
                </td>
                <td
                    className="smallest"
                    style={{verticalAlign: 'middle'}}
                >
                    {
                        isDisabled ? (
                                <Badge color="warning">
                                    Disabled
                                </Badge>
                            ) : (
                                <Badge color="success">
                                    Enabled
                                </Badge>
                            )
                    }
                </td>
                <td className="smallest">
                    <div className="pull-right">
                        {
                            isDisabled ? (
                                    <Button
                                        color="success"
                                        onClick={this._enable}
                                    >
                                        Enable
                                    </Button>
                                ) : (
                                    <Button
                                        tag={Link}
                                        color="info"
                                        to={`/app/integrations/facebook/${integration.get('id')}`}
                                    >
                                        Edit
                                    </Button>
                                )
                        }
                    </div>
                </td>
            </tr>
        )
    }
}

FacebookPageRow.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
}
