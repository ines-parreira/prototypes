import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'

import {TICKET_STATUSES} from '../../../../../config'
import RightSelect from './RightSelect'
import {getTags} from '../../../../../state/tags/selectors'
import {getMessagingIntegrations} from '../../../../../state/integrations/selectors'

@connect((state) => {
    const integrations = getMessagingIntegrations(state).map(inte => {
        if (['email', 'gmail'].includes(inte.get('type'))) {
            return inte.set('name', `${inte.get('name')} <${inte.getIn(['meta', 'address'])}>`)
        } else if (inte.get('type') == 'aircall') {
            return inte.set('name', `${inte.get('name')} (${inte.getIn(['meta', 'address'])})`)
        }
        return inte
    })

    return {
        tags: getTags(state),
        integrations
    }
})
export default class Right extends React.Component {
    static propTypes = {
        node: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        agents: PropTypes.object.isRequired,
        integrations: PropTypes.object.isRequired,
        tags: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        objectPath: PropTypes.string.isRequired,
        empty: PropTypes.bool.isRequired
    }

    static defaultProps = {
        empty: false
    }

    render() {
        const {node, objectPath, agents, tags, integrations, onChange, index, empty} = this.props

        if (empty) {
            return <span />
        }

        let options = fromJS([])

        if (objectPath === 'ticket.assignee_user.id') {
            options = agents

            options = options.unshift(fromJS({
                name: 'Me (current user)',
                id: '{current_user.id}',
            }))
        }

        if (objectPath === 'ticket.messages.integration_id') {
            options = integrations
        }

        // we want tags names as key, not their ID, like 'refund', 'billing', etc.
        if (objectPath === 'ticket.tags.name') {
            options = tags.map((tag) => {
                const name = tag.get('name')
                return fromJS({
                    id: name,
                    name
                })
            })
        }

        // we want status as keys, like 'open', 'close', etc.
        if (objectPath === 'ticket.status') {
            options = fromJS(TICKET_STATUSES.map((status) => {
                return {
                    id: status,
                    name: status
                }
            }))
        }

        if (options.size) {
            return (
                <RightSelect
                    node={node}
                    options={options}
                    onChange={onChange}
                    index={index}
                />
            )
        }

        return (
            <Button
                className="btn-frozen"
                tag="div"
                color="info"
                outline
            >
                {node.value}
            </Button>
        )
    }
}
