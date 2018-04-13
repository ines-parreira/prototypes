// @flow
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List, Map} from 'immutable'
import {Input} from 'reactstrap'

import Select from './ReactSelect'

import * as userActions from './../../../../../state/users/actions'
import * as userSelectors from './../../../../../state/users/selectors'


type Props = {
    actions: Object,
    onChange: (number) => void,
    value?: string | number,
    agents: List<Map<*,*>>,
    className?: string
}

class AssigneeSelect extends React.Component<Props> {
    componentDidMount() {
        const {actions, agents} = this.props

        if (agents.isEmpty()) {
            actions.fetchUsers(['agent', 'admin'])
        }
    }

    render() {
        const {value, onChange, agents, className} = this.props
        let options : List<*> = fromJS([{value: '', label: 'Unassigned'}])

        agents.forEach((agent) => {
            options = options.push({value: agent.get('id'), label: agent.get('name')})
        })

        if (options.isEmpty()) {
            return (
                <Input
                    type="text"
                    placeholder="Loading agents..."
                    readOnly
                />
            )
        }

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
    agents: userSelectors.getAgents(state)
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(userActions, dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssigneeSelect)
