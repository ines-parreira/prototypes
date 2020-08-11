//@flow
import _memoize from 'lodash/memoize'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {browserHistory, Link} from 'react-router'
import _pick from 'lodash/pick'
import {
    Badge,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Form as BootstrapForm,
    FormGroup,
    Label,
} from 'reactstrap'

import {toJS} from '../../../utils'
import Loader from '../../common/components/Loader'
import ConfirmButton from '../../common/components/ConfirmButton'
import RichDropdown, {type Option} from '../../common/components/RichDropdown'
import {
    BASIC_AGENT_ROLE,
    ORDERED_ROLES_META_BY_USER_ROLE,
} from '../../../config/user'
import type {MetaByAgentRole} from '../../../config/types/user'

import InputField from '../../common/forms/InputField'

import * as actions from '../../../state/agents/actions.ts'
import {updateAccountOwner} from '../../../state/currentAccount/actions'
import * as helpers from '../../../state/agents/helpers.ts'
import PageHeader from '../../common/components/PageHeader'
import Popover from '../../common/components/Popover'

import DeleteUser from './DeleteUser'
import css from './Form.less'

type Props = {
    agentId: number,
    currentUserId: number,
    accountOwnerId: number,
    createAgent: (Object) => Promise<Object>,
    deleteAgent: (number) => Promise<Object>,
    fetchAgent: (number) => Promise<Object>,
    inviteAgent: Function,
    orderedRoleMetaByUserRole: MetaByAgentRole,
    updateAgent: (number, Object) => Promise<Object>,
    updateAccountOwner: Function,
}

type State = {
    agent: Map<*, *>,
    email: string,
    errors: Object,
    isInviting: boolean,
    isFetching: boolean,
    isSubmitting: boolean,
    name: string,
    role: ?string,
}

@connect(
    (state, ownProps) => {
        return {
            agentId: parseInt(ownProps.params.id),
            accountOwnerId: state.currentAccount.get('user_id'),
            currentUserId: state.currentUser.get('id'),
        }
    },
    {
        createAgent: actions.createAgent,
        deleteAgent: actions.deleteAgent,
        fetchAgent: actions.fetchAgent,
        inviteAgent: actions.inviteAgent,
        updateAgent: actions.updateAgent,
        updateAccountOwner,
    }
)
export default class Form extends Component<Props, State> {
    static defaultProps = {
        orderedRoleMetaByUserRole: ORDERED_ROLES_META_BY_USER_ROLE,
    }

    state = {
        agent: fromJS({}),
        email: '',
        errors: {},
        isInviting: false,
        isFetching: false,
        isSubmitting: false,
        name: '',
        role: BASIC_AGENT_ROLE,
    }

    componentDidMount() {
        if (this._isUpdate()) {
            this._fetchAgent(this.props.agentId)
        }
    }

    _isUpdate = () => {
        return !!this.props.agentId
    }

    _fetchAgent = (id: number) => {
        this.setState({isFetching: true})
        return this.props.fetchAgent(id).then((resp) => {
            const agent = toJS(resp)
            const role = helpers.getHighestRole(resp)
            this.setState({
                agent: resp,
                email: agent.email,
                isFetching: false,
                name: agent.name,
                role,
            })
        })
    }

    _invite = () => {
        this.setState({isInviting: true})
        return this.props.inviteAgent(this.props.agentId).then(() => {
            this.setState({isInviting: false})
        })
    }

    _delete = () => {
        return this.props.deleteAgent(this.props.agentId).then(({error}) => {
            if (!error) {
                browserHistory.push('/app/settings/users')
            }
        })
    }

    _onSubmit = (e: SyntheticEvent<*>) => {
        e.preventDefault()
        const form = _pick(this.state, ['email', 'name'])
        form.roles = [{name: this.state.role}]
        this.setState({isSubmitting: true})
        const promise = this._isUpdate()
            ? this.props.updateAgent(this.props.agentId, form)
            : this.props.createAgent(form)
        return promise.then(({error}) => {
            this.setState({isSubmitting: false})
            if (error) {
                if (error.data) {
                    this.setState({errors: error.data})
                }
            } else {
                this.setState({errors: {}})
                if (!this._isUpdate()) {
                    browserHistory.push('/app/settings/users')
                }
            }
        })
    }

    getRolesOptionsFromRoles = _memoize((roles: MetaByAgentRole): Option[] =>
        Object.keys(roles).map((key) => ({
            key,
            ...roles[key],
        }))
    )

    render() {
        const {orderedRoleMetaByUserRole} = this.props
        const {agent, role} = this.state

        if (this.state.isFetching) {
            return <Loader />
        }

        const currentRoleMeta = role && ORDERED_ROLES_META_BY_USER_ROLE[role]
        const isUpdate = this._isUpdate()
        const isCurrentUserAccountOwner =
            this.props.accountOwnerId === this.props.currentUserId
        const isAgentAccountOwner =
            this.props.agentId === this.props.accountOwnerId

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/users">Users</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {isUpdate
                                    ? `Edit ${agent.get('name')}`
                                    : 'Add user'}
                                {isAgentAccountOwner && (
                                    <Badge
                                        className={'ml-2 align-middle'}
                                        color="dark"
                                        pill
                                    >
                                        Account Owner
                                    </Badge>
                                )}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className="page-container">
                    {!isUpdate && (
                        <p>
                            We'll send login instructions via email when you add
                            this user.
                        </p>
                    )}

                    <BootstrapForm onSubmit={this._onSubmit}>
                        <InputField
                            type="text"
                            name="name"
                            label="Name"
                            value={this.state.name}
                            onChange={(value) => this.setState({name: value})}
                            placeholder="John Doe"
                            required
                        />
                        <InputField
                            type="email"
                            name="email"
                            label="Email"
                            value={this.state.email}
                            onChange={(value) => this.setState({email: value})}
                            placeholder="john@doe.com"
                            required
                        />
                        <RichDropdown
                            className={css.roleDropdown}
                            options={this.getRolesOptionsFromRoles(
                                orderedRoleMetaByUserRole
                            )}
                            onClick={(role) => this.setState({role})}
                            value={
                                currentRoleMeta
                                    ? currentRoleMeta.label
                                    : 'Choose a role'
                            }
                        >
                            <div className={css.roleLabel}>
                                <Label
                                    className={classnames(
                                        'control-label',
                                        css.required
                                    )}
                                >
                                    Role
                                </Label>
                                <Popover>
                                    <p>
                                        User Roles will allow the store owner to
                                        restrict access to some parts of your
                                        Dashboard and actions that they can take
                                        within the dashboard.
                                    </p>
                                    <a
                                        href="https://docs.gorgias.com/user/adding-team-members#user_permissions"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Go to roles documentation
                                    </a>
                                    .
                                </Popover>
                            </div>
                        </RichDropdown>
                        <FormGroup>
                            <Button
                                type="submit"
                                color="success"
                                className={classnames('mr-2', {
                                    'btn-loading': this.state.isSubmitting,
                                })}
                                disabled={this.state.isSubmitting}
                            >
                                Save user
                            </Button>
                            {isUpdate && (
                                <>
                                    <Button
                                        type="button"
                                        color="secondary"
                                        onClick={this._invite}
                                        className={classnames({
                                            'btn-loading': this.state
                                                .isInviting,
                                        })}
                                        disabled={this.state.isInviting}
                                    >
                                        <i className="material-icons">mail</i>{' '}
                                        Re-send invitation email
                                    </Button>
                                    {isCurrentUserAccountOwner &&
                                        !isAgentAccountOwner && (
                                            <ConfirmButton
                                                type="button"
                                                color="danger"
                                                id="set-owner"
                                                outline
                                                className={'ml-2'}
                                                confirm={() =>
                                                    this.props.updateAccountOwner(
                                                        this.props.agentId
                                                    )
                                                }
                                                content={`Are you sure you want transfer ownership of this Gorgias account to ${this.state.name}?`}
                                            >
                                                Set as account owner
                                            </ConfirmButton>
                                        )}
                                    <DeleteUser
                                        action={this._delete}
                                        className="float-right"
                                        color="danger"
                                        id="delete-user"
                                        outline
                                    >
                                        <i className="material-icons">delete</i>{' '}
                                        Delete user
                                    </DeleteUser>
                                </>
                            )}
                        </FormGroup>
                    </BootstrapForm>
                </Container>
            </div>
        )
    }
}
