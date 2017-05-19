import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import {RoleLabel} from '../../common/utils/labels'

import * as actions from '../../../state/agents/actions'

@connect(null, {
    deleteAgent: actions.deleteAgent,
})
export default class Row extends React.Component {
    static propTypes = {
        agent: ImmutablePropTypes.map.isRequired,
        deleteAgent: PropTypes.func.isRequired,
        fetchPageAfterUpdate: PropTypes.func.isRequired,
    }

    state = {
        askDeleteConfirmation: false,
        isDeleting: false,
    }

    _delete = () => {
        this.setState({isDeleting: true})
        return this.props.deleteAgent(this.props.agent.get('id'))
            .then(({error}) => {
                this.setState({isDeleting: false})
                if (!error) {
                    this.props.fetchPageAfterUpdate()
                }
            })
    }

    _toggleDeleteConfirmation = () => {
        this.setState({
            askDeleteConfirmation: !this.state.askDeleteConfirmation,
        })
    }

    render() {
        const {agent} = this.props

        const id = `delete-agent-button-${agent.get('id')}`

        return (
            <tr>
                <td className="align-middle">
                    <b>{agent.get('name')}</b>
                    {' '}
                    <span className="text-faded ml-2">
                        {agent.get('email')}
                    </span>
                </td>
                <td className="align-middle">
                    <RoleLabel
                        roles={agent.get('roles')}
                    />
                </td>
                <td className="smallest">
                    <Button
                        tag={Link}
                        color="info"
                        to={`/app/settings/team/update/${agent.get('id')}`}
                    >
                        Edit
                    </Button>
                    <Button
                        type="submit"
                        id={id}
                        color="danger"
                        outline
                        onClick={this._toggleDeleteConfirmation}
                        className={classnames('ml-2', {
                            'btn-loading': this.state.isDeleting,
                        })}
                        disabled={this.state.isDeleting}
                    >
                        Delete
                    </Button>
                    <Popover
                        placement="left"
                        isOpen={this.state.askDeleteConfirmation}
                        target={id}
                        toggle={this._toggleDeleteConfirmation}
                    >
                        <PopoverTitle>Are you sure?</PopoverTitle>
                        <PopoverContent>
                            <p>
                                You are about to <b>delete</b> this team member.
                            </p>
                            <Button
                                color="success"
                                onClick={() => {
                                    this._toggleDeleteConfirmation()
                                    this._delete()
                                }}
                            >
                                Confirm
                            </Button>
                        </PopoverContent>
                    </Popover>
                </td>
            </tr>
        )
    }
}
