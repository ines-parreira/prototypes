import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'

import Select from './Select'

import * as userActions from './../../../../../state/users/actions'
import * as userSelectors from './../../../../../state/users/selectors'


class AssigneeSelect extends React.Component {
    componentDidMount() {
        const {actions, agents} = this.props

        if (agents.isEmpty()) {
            actions.fetchUsers(['agent', 'admin'])
        }
    }

    render() {
        const {value, onChange, agents} = this.props
        let options = fromJS([{value: '', label: 'Unassigned'}])

        agents.forEach(agent => {
            options = options.push({value: agent.get('id'), label: agent.get('name')})
        })

        if (options.isEmpty()) {
            return (
                <div className="ui input">
                    <input type="text" placeholder="Loading agents..." readOnly="true"/>
                </div>
            )
        }

        return (
            <Select
                value={value}
                onChange={onChange}
                options={options.toJS() || []}
            />
        )
    }
}

AssigneeSelect.propTypes = {
    actions: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,

    agents: PropTypes.object.isRequired
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
