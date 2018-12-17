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
} from 'reactstrap'

import {toJS} from '../../../utils'
import Loader from '../../common/components/Loader'

import InputField from '../../common/forms/InputField'

import * as actions from '../../../state/agents/actions'
import * as helpers from '../../../state/agents/helpers'
import PageHeader from '../../common/components/PageHeader'
import DeleteAgent from './DeleteAgent'

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
        email: '',
        errors: {},
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
        return this.props.deleteAgent(this.props.agentId)
            .then(({error}) => {
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
                                        <DeleteAgent
                                            action={this._delete}
                                            className="float-right"
                                            color="danger"
                                            outline
                                        >
                                            <i className="material-icons">delete</i> Delete team member
                                        </DeleteAgent>
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
