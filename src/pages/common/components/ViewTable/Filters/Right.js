import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'

import {TICKET_STATUSES} from '../../../../../config'
import RightSelect from './RightSelect'
import {getTags} from '../../../../../state/tags/selectors'

@connect((state) => {
    return {
        tags: getTags(state),
    }
})
export default class Right extends React.Component {
    static propTypes = {
        node: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        agents: PropTypes.object.isRequired,
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
        const {node, objectPath, agents, tags, currentUser, onChange, index, empty} = this.props

        if (empty) {
            return <span />
        }

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
                    if (node.raw.includes('{current_user.id}')) {
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
