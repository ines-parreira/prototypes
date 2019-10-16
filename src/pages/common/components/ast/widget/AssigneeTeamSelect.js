// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, List, Map} from 'immutable'

import * as selectors from '../../../../../state/teams/selectors'

import Select from './ReactSelect'


type Props = {
    onChange: (number) => void,
    value?: string | number,
    teams: Map<*, *>,
    className?: string,
    allowUnassign?: boolean,
}

class AssigneeTeamSelect extends React.Component<Props> {
    static defaultProps = {
        allowUnassign: true,
    }

    render() {
        const {teams, value, onChange, className, allowUnassign} = this.props
        let options: List<*> = fromJS(
            allowUnassign
                ? [{value: null, label: 'Unassigned'}]
                : []
        )

        teams.forEach((team) => {
            options = options.push({value: team.get('id'), label: team.get('name')})
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
    teams: selectors.getTeams(state),
})

//$FlowFixMe
export default connect(
    mapStateToProps
)(AssigneeTeamSelect)
