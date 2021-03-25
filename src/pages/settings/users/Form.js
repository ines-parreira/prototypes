//@flow
import _memoize from 'lodash/memoize'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {Link, withRouter} from 'react-router-dom'
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

import {getCheaperPlanForFeature} from '../../../utils/paywalls.ts'
import {getBillingState} from '../../../state/billing/selectors.ts'
import {toJS} from '../../../utils.ts'
import Loader from '../../common/components/Loader/Loader.tsx'
import ConfirmButton from '../../common/components/ConfirmButton.tsx'
import RichDropdown, {type Option} from '../../common/components/RichDropdown'
import UpgradeButton from '../../common/components/UpgradeButton/UpgradeButton.tsx'
import {
    ADMIN_ROLE,
    BASIC_AGENT_ROLE,
    ORDERED_ROLES_META_BY_USER_ROLE,
} from '../../../config/user.ts'
import type {MetaByAgentRole} from '../../../config/types/user'
import {paywallConfigs} from '../../../config/paywalls.tsx'

import InputField from '../../common/forms/InputField'

import * as actions from '../../../state/agents/actions.ts'
import {updateAccountOwner} from '../../../state/currentAccount/actions.ts'
import {AccountFeatures} from '../../../state/currentAccount/types.ts'
import * as helpers from '../../../state/agents/helpers.ts'
import PageHeader from '../../common/components/PageHeader.tsx'
import Popover from '../../common/components/Popover'
import history from '../../history.ts'

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
    hasUserRolesFeature: boolean,
    plans: Map<any, any>,
}

type State = {
    agent: Map<any, any>,
    email: string,
    errors: Object,
    isInviting: boolean,
    isFetching: boolean,
    isSubmitting: boolean,
    name: string,
    role: string,
}

@withRouter
@connect(
    (state, ownProps) => {
        return {
            agentId: parseInt(ownProps.match.params.id),
            accountOwnerId: state.currentAccount.get('user_id'),
            currentUserId: state.currentUser.get('id'),
            hasUserRolesFeature: state.currentAccount
                .get('features')
                .get(AccountFeatures.UserRoles),
            plans: getBillingState(state).get('plans'),
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
        role: this.props.hasUserRolesFeature ? BASIC_AGENT_ROLE : ADMIN_ROLE,
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
                history.push('/app/settings/users')
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
                    history.push('/app/settings/users')
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
        const {
            hasUserRolesFeature,
            orderedRoleMetaByUserRole,
            plans,
        } = this.props
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
        const paywallConfig = paywallConfigs[AccountFeatures.UserRoles]
        const requiredPlanName = getCheaperPlanForFeature(
            AccountFeatures.UserRoles,
            toJS(plans)
        )

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
                                hasUserRolesFeature
                                    ? orderedRoleMetaByUserRole
                                    : {[role]: orderedRoleMetaByUserRole[role]}
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
                        {!hasUserRolesFeature && (
                            <div className={classnames('mb-3', css.paywall)}>
                                <h3>{paywallConfig.header}</h3>

                                {paywallConfig.description}
                                <UpgradeButton
                                    className="mt-3"
                                    label={`Upgrade to ${requiredPlanName}`}
                                    state={{
                                        openedPlanPopover: requiredPlanName,
                                    }}
                                />
                            </div>
                        )}
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
