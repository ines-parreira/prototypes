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
    allowUnassign?: boolean
}

export class AssigneeUserSelectContainer extends React.Component<
    OwnProps & ConnectedProps<typeof connector>
> {
    componentDidMount() {
        const {actions, agents} = this.props

        if (agents.isEmpty()) {
            actions.fetchUsers(USER_ROLES)
        }
    }

    render() {
        const {value, onChange, agents, className, allowUnassign} = this.props
        let options: List<any> = fromJS(
            allowUnassign
                ? [
                      {
                          value: null,
                          label: (
                              <>
                                  <i className="material-icons">
                                      person_remove
                                  </i>{' '}
                                  Clear assignee
                              </>
                          ),
                      },
                  ]
                : []
        )

        if (agents.isEmpty()) {
            return <span className="text-muted ml-2">Loading agents...</span>
        }

        // TODO(@julian): We need to temporary cast the type of values according to the
        // context of the widget (strings in rule actions, ints in rule conditions),
        // until we fix https://github.com/gorgias/gorgias/issues/6609.

        agents.forEach((agent: Map<any, any>) => {
            const currentValue = agent.get('id')
            options = options.push({
                value:
                    className === 'ActionWidget'
                        ? (currentValue as number).toString()
                        : currentValue,
                label: agent.get('name'),
            })
        })

        return (
            <Select
                className={className}
                value={
                    value && className === 'LiteralWidget'
                        ? parseInt(value as string)
                        : value
                }
                onChange={onChange}
                options={options.toJS() || []}
                sortOptions={false}
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

export default connector(AssigneeUserSelectContainer)
