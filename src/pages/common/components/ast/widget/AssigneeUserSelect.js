// @flow
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List, Map} from 'immutable'

import {USER_ROLES} from '../../../../../config/user'

import Select from './ReactSelect'

import * as userActions from './../../../../../state/agents/actions.ts'
import * as agentSelectors from './../../../../../state/agents/selectors.ts'

type Props = {
    actions: Object,
    onChange: (number) => void,
    value?: string | number,
    agents: List<Map<*, *>>,
    className?: string,
}

class AssigneeUserSelect extends React.Component<Props> {
    componentDidMount() {
        const {actions, agents} = this.props

        if (agents.isEmpty()) {
            actions.fetchUsers(USER_ROLES)
        }
    }

    render() {
        const {value, onChange, agents, className} = this.props

        if (agents.isEmpty()) {
            return <span className="text-muted ml-2">Loading agents...</span>
        }

        let options: List<*> = fromJS([{value: null, label: 'Unassigned'}])

        agents.forEach((agent) => {
            options = options.push({
                value: agent.get('id').toString(),
                label: agent.get('name'),
            })
        })

        return (
            <Select
                className={className}
                value={value}
                onChange={onChange}
                options={options.toJS() || []}
            />
        )
    }
}

const mapStateToProps = (state) => ({
    agents: agentSelectors.getAgents(state),
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(userActions, dispatch),
})

//$FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AssigneeUserSelect)
