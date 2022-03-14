import _memoize from 'lodash/memoize'
import React, {Component, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form as BootstrapForm,
    FormGroup,
    Label,
} from 'reactstrap'
import {AxiosError} from 'axios'

import {MetaByAgentRole, User, UserDraft, UserRole} from 'config/types/user'
import {ORDERED_ROLES_META_BY_USER_ROLE} from 'config/user'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import InputField from 'pages/common/forms/InputField'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import PopoverModal from 'pages/common/components/PopoverModal'
import RichDropdown from 'pages/common/components/RichDropdown/RichDropdown'
import {Option} from 'pages/common/components/RichDropdown/types'
import history from 'pages/history'
import {
    updateAgent,
    inviteAgent,
    fetchAgent,
    deleteAgent,
    createAgent,
} from 'state/agents/actions'
import * as helpers from 'state/agents/helpers'
import {updateAccountOwner} from 'state/currentAccount/actions'
import {RootState} from 'state/types'
import {toJS} from 'utils'
import settingsCss from '../settings.less'

import {checkAccessTo2FA} from '../yourProfile/twoFactorAuthentication/utils'
import css from './Form.less'

type OwnProps = {
    orderedRoleMetaByUserRole: MetaByAgentRole
} & RouteComponentProps<{id: string}>

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    agent: Map<any, any>
    email: string
    errors: Record<string, unknown>
    isInviting: boolean
    isFetching: boolean
    isSubmitting: boolean
    name: string
    role: UserRole
}

export class FormContainer extends Component<Props, State> {
    static defaultProps = {
        orderedRoleMetaByUserRole: ORDERED_ROLES_META_BY_USER_ROLE,
    }

    state: State = {
        agent: fromJS({}),
        email: '',
        errors: {},
        isInviting: false,
        isFetching: false,
        isSubmitting: false,
        name: '',
        role: UserRole.BasicAgent,
    }

    componentDidMount() {
        if (this._isUpdate()) {
            void this._fetchAgent(this.props.agentId)
        }
    }

    _isUpdate = () => {
        return !!this.props.agentId
    }

    _fetchAgent = (id: number) => {
        this.setState({isFetching: true})
        return this.props.fetchAgent(id).then((resp) => {
            const agent: User = toJS(resp)
            const role = helpers.getHighestRole(resp)
            this.setState({
                agent: resp,
                email: agent.email,
                isFetching: false,
                name: agent.name,
                role: role!,
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
        return this.props.deleteAgent(this.props.agentId).then((resp) => {
            if (!(resp as {error?: AxiosError}).error) {
                history.push('/app/settings/users')
            }
        })
    }

    _onSubmit = (e: SyntheticEvent) => {
        const {email, name, role} = this.state
        e.preventDefault()
        const form: UserDraft = {email, name, roles: [{name: role}]}
        this.setState({isSubmitting: true})
        const promise = (
            this._isUpdate()
                ? this.props.updateAgent(this.props.agentId, form)
                : this.props.createAgent(form)
        ) as Promise<{
            error?: {data?: Record<string, unknown>}
        }>
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
        const has2FaEnabled = agent.get('has_2fa_enabled', false)

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
                                    ? `Edit ${agent.get('name') as string}`
                                    : 'Add user'}
                                {isAgentAccountOwner && (
                                    <Badge
                                        className="ml-2 align-middle"
                                        type={ColorType.Dark}
                                    >
                                        Account Owner
                                    </Badge>
                                )}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={settingsCss.pageContainer}>
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
                            onClick={(role) =>
                                this.setState({role: role as UserRole})
                            }
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
                                <PopoverModal className={css.learnMore}>
                                    <p className={css.learnMoreContent}>
                                        User Roles will allow the store owner to
                                        restrict access to some parts of your
                                        Dashboard and actions that they can take
                                        within the dashboard.
                                    </p>
                                    <Button
                                        intent="secondary"
                                        onClick={() => {
                                            window
                                                .open(
                                                    'https://docs.gorgias.com/user/adding-team-members#user_permissions',
                                                    '_blank'
                                                )!
                                                .focus()
                                        }}
                                    >
                                        Go to roles documentation
                                    </Button>
                                </PopoverModal>
                            </div>
                        </RichDropdown>
                        {checkAccessTo2FA(this.props.accountDomain) && (
                            <FormGroup>
                                <Label className="control-label">
                                    Two-Factor Authentication
                                </Label>
                                <p>
                                    <Badge
                                        className={css.badge}
                                        type={
                                            has2FaEnabled
                                                ? ColorType.Success
                                                : ColorType.Error
                                        }
                                    >
                                        {has2FaEnabled
                                            ? 'Active'
                                            : 'Not Active'}
                                    </Badge>
                                </p>
                            </FormGroup>
                        )}
                        <FormGroup className="mt-5">
                            <Button
                                type="submit"
                                className="mr-2"
                                isLoading={this.state.isSubmitting}
                            >
                                Save user
                            </Button>
                            {isUpdate && (
                                <>
                                    <Button
                                        intent="secondary"
                                        onClick={this._invite}
                                        isLoading={this.state.isInviting}
                                    >
                                        <ButtonIconLabel icon="mail">
                                            Re-send invitation email
                                        </ButtonIconLabel>
                                    </Button>
                                    {isCurrentUserAccountOwner &&
                                        !isAgentAccountOwner && (
                                            <ConfirmButton
                                                intent="destructive"
                                                id="set-owner"
                                                className={'ml-2'}
                                                onConfirm={() =>
                                                    this.props.updateAccountOwner(
                                                        this.props.agentId
                                                    )
                                                }
                                                confirmationContent={`Are you sure you want transfer ownership of this Gorgias account to ${this.state.name}?`}
                                            >
                                                Set as account owner
                                            </ConfirmButton>
                                        )}
                                    <ConfirmButton
                                        className="float-right"
                                        confirmationContent={
                                            <span>
                                                You are about to <b>delete</b>{' '}
                                                this user. This action is{' '}
                                                <b>irreversible</b>. This will
                                                unassign this user from all
                                                their tickets, open or closed,
                                                and delete their statistics.
                                            </span>
                                        }
                                        id="delete-user"
                                        intent="destructive"
                                        onConfirm={this._delete}
                                    >
                                        <ButtonIconLabel icon="delete">
                                            Delete user
                                        </ButtonIconLabel>
                                    </ConfirmButton>
                                </>
                            )}
                        </FormGroup>
                    </BootstrapForm>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, ownProps: OwnProps) => {
        return {
            agentId: parseInt(ownProps.match.params.id),
            accountDomain: state.currentAccount.get('domain'),
            accountOwnerId: state.currentAccount.get('user_id'),
            currentUserId: state.currentUser.get('id'),
        }
    },
    {
        createAgent,
        deleteAgent,
        fetchAgent,
        inviteAgent,
        updateAgent,
        updateAccountOwner,
    }
)

export default withRouter(connector(FormContainer))
