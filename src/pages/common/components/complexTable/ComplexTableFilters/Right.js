import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {TICKET_STATUSES} from '../../../../../config'
import RightSelect from './RightSelect'

const Right = ({node, objectPath, agents, tags, currentUser, onChange, index}) => {
    let options = fromJS([])

    if (objectPath === 'ticket.assignee_user.id') {
        options = agents.map((agent) => {
            if (agent.get('id') === currentUser.get('id')) {
                // replace my name with 'Me'
                let me = agent.set('name', 'Me')

                // if we're getting the selected value from the view,
                // replace the current user id with {current_user.id},
                // that's the way the filter value is stored in the view.
                // for the select element to match the active item.
                if (node.raw === '"{current_user.id}"') {
                    me = me.set('id', '{current_user.id}')
                }

                return me
            }

            return agent
        })
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

    return <span className="ui basic light blue button">{node.value}</span>
}
Right.propTypes = {
    node: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    agents: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    objectPath: PropTypes.string.isRequired
}

export default Right
