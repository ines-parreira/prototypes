import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import {Badge, Button} from 'reactstrap'

import IntegrationList from '../IntegrationList'

export default class ChatIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props

        const longTypeDescription = (
            <span>
                Live chat with your customers by adding our Chat widget on your website.
                Every time a customer starts a conversation on your website, it opens a ticket in Gorgias.
            </span>
        )

        const integrationToItemDisplay = (int) => {
            const editLink = `/app/integrations/smooch_inside/${int.get('id')}`
            const isLoading = int.get('id') === loading.get('delete')
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td style={{verticalAlign: 'middle'}}>
                        <Link to={editLink}>
                            <b>{int.get('name')}</b>
                        </Link>
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
                            <Button
                                tag={Link}
                                color="info"
                                className="mr-2"
                                disabled={isLoading}
                                to={editLink}
                            >
                                Edit
                            </Button>
                            <Button
                                color="danger"
                                outline
                                className={classnames({
                                    'btn-loading': isLoading,
                                })}
                                disabled={isLoading}
                                onClick={() => actions.deleteIntegration(int)}
                            >
                                Delete
                            </Button>
                        </div>
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="smooch_inside"
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter((v) => v.get('type') === 'smooch_inside')}
                createIntegration={() => browserHistory.push('/app/integrations/smooch_inside/new')}
                createIntegrationButtonText="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

ChatIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
