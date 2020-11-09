import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List} from 'immutable'

import {RootState} from '../../../../../state/types'
import * as selectors from '../../../../../state/teams/selectors'

import Select from './ReactSelect'

type OwnProps = {
    onChange: (value: number) => void
    value?: string | number
    className?: string
    allowUnassign?: boolean
}

class AssigneeTeamSelect extends React.Component<
    OwnProps & ConnectedProps<typeof connector>
> {
    static defaultProps = {
        allowUnassign: true,
    }

    render() {
        const {teams, value, onChange, className, allowUnassign} = this.props
        let options: List<any> = fromJS(
            allowUnassign ? [{value: null, label: 'Unassigned'}] : []
        )

        teams.forEach((team: Map<any, any>) => {
            options = options.push({
                value: team.get('id'),
                label: team.get('name'),
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

const connector = connect((state: RootState) => ({
    teams: selectors.getTeams(state),
}))

export default connector(AssigneeTeamSelect)
