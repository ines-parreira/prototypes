import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List} from 'immutable'

import {USER_ROLES} from '../../../../../config/user'
import {RootState} from '../../../../../state/types'
import * as userActions from '../../../../../state/agents/actions'
import * as agentSelectors from '../../../../../state/agents/selectors'

import Select from './ReactSelect'

type OwnProps = {
    onChange: (value: number) => void
    value?: string | number
    className?: string
}

class AssigneeUserSelect extends React.Component<
    OwnProps & ConnectedProps<typeof connector>
> {
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

        let options: List<any> = fromJS([{value: null, label: 'Unassigned'}])

        agents.forEach((agent: Map<any, any>) => {
            options = options.push({
                value: (agent.get('id') as number).toString(),
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

const connector = connect(
    (state: RootState) => ({
        agents: agentSelectors.getAgents(state),
    }),
    (dispatch) => ({
        actions: bindActionCreators(userActions, dispatch),
    })
)

export default connector(AssigneeUserSelect)
