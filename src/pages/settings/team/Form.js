import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {browserHistory, Link} from 'react-router'
import _pick from 'lodash/pick'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Form as BootstrapForm,
    FormGroup,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap'

import {toJS} from '../../../utils'
import Loader from '../../common/components/Loader'

import InputField from '../../common/forms/InputField'

import * as actions from '../../../state/agents/actions'
import * as helpers from '../../../state/agents/helpers'
import PageHeader from '../../common/components/PageHeader'

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
            return <Loader/>
        }

        const isUpdate = this._isUpdate()

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/team">Team members</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {isUpdate ? `Edit ${agent.get('name')}` : 'Add team member'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    {
                        !isUpdate && (
                            <p>
                                We'll send login instructions via email when you add this user.
                            </p>
                        )
                    }

                    <BootstrapForm onSubmit={this._onSubmit}>
                        <InputField
                            type="text"
                            name="name"
                            label="Name"
                            value={this.state.name}
                            onChange={value => this.setState({name: value})}
                            placeholder="John Doe"
                            required
                        />
                        <InputField
                            type="email"
                            name="email"
                            label="Email"
                            value={this.state.email}
                            onChange={value => this.setState({email: value})}
                            placeholder="john@doe.com"
                            required
                        />
                        <InputField
                            type="select"
                            name="role"
                            label="Role"
                            value={this.state.role}
                            onChange={value => this.setState({role: value})}
                            required
                            help="Agents can view & respond to tickets. Admins can add/remove team members, manage tags & billing."
                        >
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                        </InputField>
                        <FormGroup>
                            <Button
                                type="submit"
                                color="success"
                                className={classnames('mr-2', {
                                    'btn-loading': this.state.isSubmitting,
                                })}
                                disabled={this.state.isSubmitting}
                            >
                                {isUpdate ? 'Update team member' : 'Add team member'}
                            </Button>
                            {
                                isUpdate && (
                                    <span>
                                        <Button
                                            type="button"
                                            color="secondary"
                                            onClick={this._invite}
                                            className={classnames({'btn-loading': this.state.isInviting})}
                                            disabled={this.state.isInviting}
                                        >
                                             <i className="material-icons">mail</i> Re-send invitation email
                                        </Button>
                                        <Button
                                            id="delete-agent-button"
                                            type="button"
                                            color="danger"
                                            outline
                                            onClick={this._toggleDeleteConfirmation}
                                            className={classnames('float-right', {
                                                'btn-loading': this.state.isDeleting,
                                            })}
                                            disabled={this.state.isDeleting}
                                        >
                                            <i className="material-icons">delete</i> Delete team member
                                        </Button>
                                        <Popover
                                            placement="left"
                                            isOpen={this.state.askDeleteConfirmation}
                                            target="delete-agent-button"
                                            toggle={this._toggleDeleteConfirmation}
                                        >
                                            <PopoverHeader>Are you sure?</PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    You are about to <b>delete</b> this team member. This action is{' '}
                                                    <b>irreversible</b>. This will unassign this team member from{' '}
                                                    all its tickets, open or closed, and delete its statistics.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="danger"
                                                    onClick={() => {
                                                        this._toggleDeleteConfirmation()
                                                        this._delete()
                                                    }}
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                    </span>
                                )
                            }
                        </FormGroup>
                    </BootstrapForm>
                </Container>
            </div>
        )
    }
}
