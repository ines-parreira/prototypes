import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import IntegrationList from '../IntegrationList'

export default class SmoochIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props

        const longTypeDescription = (
            <span>
                You can add a chat integration here to add a chat widget on your website.
                Every time a user starts a conversation, it opens a ticket in Gorgias.
                You can then respond to the ticket to chat with the user.
                <br />
                You can add multiple chat integrations.
            </span>
        )

        const integrationToItemDisplay = (int) => {
            const editLink = `/app/integrations/smooch/${int.get('id')}`
            const isLoading = int.get('id') === loading.get('delete')

            const editClassName = classnames('ui basic light blue button', {
                'loading disabled': isLoading
            })

            const deleteClassName = classnames('ui basic light red button', {
                'loading disabled': isLoading
            })

            return (
                <tr key={int.get('id')}>
                    <td>
                        <div className="ui header">
                            <Link className="subject" to={editLink}>{int.get('name')}</Link>
                            <div className="body sub header">
                                {int.get('description')}
                            </div>
                        </div>
                    </td>
                    <td className="eight wide column">
                        <div className="floated right">
                            <button className={editClassName}
                                    onClick={() => !isLoading && browserHistory.push(editLink)}
                            >
                                Edit
                            </button>
                            <button className={deleteClassName}
                                    onClick={() => !isLoading && actions.deleteIntegration(int)}
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="smooch"
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter((v) => v.get('type') === 'smooch')}
                createIntegration={() => browserHistory.push('/app/integrations/smooch/new')}
                createIntegrationButtonText="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

SmoochIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
