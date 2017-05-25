import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Link, browserHistory} from 'react-router'
import _pick from 'lodash/pick'
import {
    Button,
    Form as BootstrapForm,
    FormGroup,
    Breadcrumb,
    BreadcrumbItem,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import {toJS} from '../../../utils'
import Loader from '../../common/components/Loader'
import {InputField, SelectField} from '../../common/forms'

import * as actions from '../../../state/agents/actions'
import * as helpers from '../../../state/agents/helpers'

@connect((state, ownProps) => {
    return {
        agentId: ownProps.params.id,
    }
}, {
    createAgent: actions.createAgent,
    deleteAgent: actions.deleteAgent,
    fetchAgent: actions.fetchAgent,
    inviteAgent: actions.inviteAgent,
    updateAgent: actions.updateAgent,
})
export default class Form extends React.Component {
    static propTypes = {
        agentId: PropTypes.string,
        createAgent: PropTypes.func.isRequired,
        deleteAgent: PropTypes.func.isRequired,
        fetchAgent: PropTypes.func.isRequired,
        inviteAgent: PropTypes.func.isRequired,
        updateAgent: PropTypes.func.isRequired,
    }

    state = {
        agent: fromJS({}),
        askDeleteConfirmation: false,
        email: '',
        errors: {},
        isDeleting: false,
        isInviting: false,
        isFetching: false,
        isSubmitting: false,
        name: '',
        role: 'agent',
    }

    componentDidMount() {
        if (this._isUpdate()) {
            this._fetchAgent(this.props.agentId)
        }
    }

    _isUpdate = () => {
        return !!this.props.agentId
    }

    _fetchAgent = (id) => {
        this.setState({isFetching: true})
        return this.props.fetchAgent(id)
            .then((resp) => {
                const agent = toJS(resp)
                const role = helpers.getHighestRole(resp)
                this.setState({
                    agent: resp,
                    email: agent.email,
                    isFetching: false,
                    name: agent.name,
                    role: toJS(role.get('name')),
                })
            })
    }

    _invite = () => {
        this.setState({isInviting: true})
        return this.props.inviteAgent(this.props.agentId)
            .then(() => {
                this.setState({isInviting: false})
            })
    }

    _delete = () => {
        this.setState({isDeleting: true})
        return this.props.deleteAgent(this.props.agentId)
            .then(({error}) => {
                this.setState({isDeleting: false})
                if (!error) {
                    browserHistory.push('/app/settings/team')
                }
            })
    }

    _onSubmit = (e) => {
        e.preventDefault()
        const form = _pick(this.state, ['email', 'name'])
        form.roles = [{name: this.state.role}]
        this.setState({isSubmitting: true})
        const promise = this._isUpdate() ? this.props.updateAgent(this.props.agentId, form) : this.props.createAgent(form)
        return promise
            .then(({error}) => {
                this.setState({isSubmitting: false})
                if (error) {
                    if (error.data) {
                        this.setState({errors: error.data})
                    }
                } else {
                    this.setState({errors: {}})
                    if (!this._isUpdate()) {
                        browserHistory.push('/app/settings/team')
                    }
                }
            })
    }

    _toggleDeleteConfirmation = () => {
        this.setState({
            askDeleteConfirmation: !this.state.askDeleteConfirmation,
        })
    }

    render() {
        const {agent} = this.state

        if (this.state.isFetching) {
            return <Loader />
        }

        const isUpdate = this._isUpdate()

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/settings/team">Team members</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isUpdate ? `Edit ${agent.get('name')}` : 'Add team member'}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1 className="mb-3">
                    {isUpdate ? `Editing ${agent.get('name')}` : 'Add team member'}
                </h1>

                {
                    !isUpdate && (
                        <p>
                            We'll send login instructions via email when you add this user.
                        </p>
                    )
                }

                <BootstrapForm onSubmit={this._onSubmit}>
                    <FormGroup>
                        <InputField
                            label="Name"
                            input={{
                                value: this.state.name,
                                onChange: e => this.setState({name: e.target.value}),
                            }}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <InputField
                            label="Email"
                            type="email"
                            input={{
                                value: this.state.email,
                                onChange: e => this.setState({email: e.target.value}),
                            }}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <SelectField
                            label="Role"
                            input={{
                                value: this.state.role,
                                onChange: value => this.setState({role: value}),
                            }}
                            required
                            help="Agents can view & respond to tickets. Admins can add/remove team members, manage tags & billing."
                        >
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                        </SelectField>
                    </FormGroup>
                    <FormGroup>
                        <Button
                            type="submit"
                            color="primary"
                            className={classnames('mr-2', {
                                'btn-loading': this.state.isSubmitting,
                            })}
                            disabled={this.state.isSubmitting}
                        >
                            {isUpdate ? 'Save changes' : 'Create team member'}
                        </Button>
                        {
                            isUpdate && (
                                <span>
                                    <Button
                                        type="button"
                                        color="secondary"
                                        onClick={this._invite}
                                        className={classnames('hidden', {
                                            'btn-loading': this.state.isInviting,
                                        })}
                                        disabled={this.state.isInviting}
                                    >
                                        Re-send invitation email
                                    </Button>
                                    <Button
                                        id="delete-agent-button"
                                        type="button"
                                        color="danger"
                                        outline
                                        onClick={this._toggleDeleteConfirmation}
                                        className={classnames('pull-right', {
                                            'btn-loading': this.state.isDeleting,
                                        })}
                                        disabled={this.state.isDeleting}
                                    >
                                        Delete team member
                                    </Button>
                                    <Popover
                                        placement="left"
                                        isOpen={this.state.askDeleteConfirmation}
                                        target="delete-agent-button"
                                        toggle={this._toggleDeleteConfirmation}
                                    >
                                        <PopoverTitle>Are you sure?</PopoverTitle>
                                        <PopoverContent>
                                            <p>
                                                You are about to <b>delete</b> this team member.
                                            </p>
                                            <Button
                                                type="submit"
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
                                </span>
                            )
                        }
                    </FormGroup>
                </BootstrapForm>
            </div>
        )
    }
}
