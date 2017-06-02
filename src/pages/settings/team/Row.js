import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {Link} from 'react-router'

import {RoleLabel} from '../../common/utils/labels'

export default class Row extends React.Component {
    static propTypes = {
        agent: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {agent} = this.props

        const editLink = `/app/settings/team/update/${agent.get('id')}`

        return (
            <tr>
                <td className="link-full-td">
                    <Link to={editLink}>
                        <div>
                            <b className="hidden-sm-down mr-2">{agent.get('name')} {' '}</b>
                            <span className="text-faded">
                                {agent.get('email')}
                            </span>
                        </div>
                    </Link>
                </td>
                <td className="link-full-td smallest">
                    <Link to={editLink}>
                        <div>
                            <RoleLabel
                                roles={agent.get('roles')}
                            />
                        </div>
                    </Link>
                </td>
            </tr>
        )
    }
}
