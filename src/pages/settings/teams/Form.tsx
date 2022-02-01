import React, {Component, SyntheticEvent} from 'react'
import {Emoji, EmojiData} from 'emoji-mart'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    Col,
    Container,
    Form as BootstrapForm,
    FormGroup,
    Popover,
    PopoverBody,
    Row,
} from 'reactstrap'
import {NavLink, RouteComponentProps, withRouter} from 'react-router-dom'
import classnames from 'classnames'

import InputField from 'pages/common/forms/InputField'
import {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import IconButton from 'pages/common/components/button/IconButton'
import {
    createTeam,
    deleteTeam,
    fetchTeam,
    updateTeam,
} from '../../../state/teams/actions'
import Loader from '../../common/components/Loader/Loader'
import PageHeader from '../../common/components/PageHeader'
import SecondaryNavbar from '../../common/components/SecondaryNavbar/SecondaryNavbar'
import EmojiPicker from '../../common/components/EmojiPicker/EmojiPicker'
import history from '../../history'
import settingsCss from '../settings.less'

import css from './Form.less'

type OwnProps = RouteComponentProps<{id: string}>

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    team: Map<any, any>
    isFetching: boolean
    isSubmitting: boolean
    isEmojiPickerOpen: boolean
}

export class FormContainer extends Component<Props, State> {
    state: State = {
        team: fromJS({}),
        isFetching: false,
        isSubmitting: false,
        isEmojiPickerOpen: false,
    }

    componentDidMount() {
        if (this._isUpdate()) {
            void this._fetchTeam(this.props.teamId)
        }
    }

    _isUpdate = () => {
        return !!this.props.teamId
    }

    _fetchTeam = (id: number) => {
        this.setState({isFetching: true})
        return this.props.fetchTeam(id).then((resp) => {
            this.setState({
                isFetching: false,
                team: resp as Map<any, any>,
            })
        })
    }

    _onSubmit = (e: SyntheticEvent) => {
        e.preventDefault()
        this.setState({isSubmitting: true})
        const team = this.state.team
        const promise = this._isUpdate()
            ? this.props.updateTeam(team)
            : this.props.createTeam(team)
        return promise.then((resp) => {
            this.setState({isSubmitting: false})
            if (!this._isUpdate()) {
                history.push(
                    `/app/settings/teams/${
                        (resp as Map<any, any>).get('id') as number
                    }/members`
                )
            }
        })
    }

    _delete = () => {
        return this.props
            .deleteTeam(this.state.team.get('id'))
            .then((success) => {
                if (success) {
                    history.push('/app/settings/teams')
                }
            })
    }

    _toggleEmojiPicker = () => {
        this.setState({
            isEmojiPickerOpen: !this.state.isEmojiPickerOpen,
        })
    }

    render() {
        if (this.state.isFetching) {
            return <Loader />
        }

        const isUpdate = this._isUpdate()
        const team = this.state.team || fromJS({})
        const emoji = team.getIn(['decoration', 'emoji']) as Map<any, any>

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <NavLink to="/app/settings/teams" exact>
                                    Teams
                                </NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {isUpdate
                                    ? `Edit ${team.get('name') as string}`
                                    : 'Create team'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                {isUpdate && (
                    <SecondaryNavbar>
                        <NavLink
                            to={`/app/settings/teams/${
                                team.get('id') as number
                            }/members`}
                            exact
                        >
                            Team members
                        </NavLink>
                        <NavLink
                            to={`/app/settings/teams/${
                                team.get('id') as number
                            }`}
                            exact
                        >
                            Settings
                        </NavLink>
                    </SecondaryNavbar>
                )}
                <Container fluid className={settingsCss.pageContainer}>
                    <BootstrapForm onSubmit={this._onSubmit}>
                        <Row>
                            <Col lg={6}>
                                <div className={'d-flex'}>
                                    <InputField
                                        className={'flex-grow'}
                                        type="text"
                                        name="name"
                                        label="Name"
                                        placeholder="Awesome team"
                                        value={team.get('name') || ''}
                                        onChange={(value) =>
                                            this.setState({
                                                team: team.set('name', value),
                                            })
                                        }
                                        required
                                    />
                                    <FormGroup
                                        className={'ml-2 align-self-end'}
                                    >
                                        <ButtonGroup>
                                            <Button
                                                type="button"
                                                color="secondary"
                                                id="add-emoji"
                                                onClick={
                                                    this._toggleEmojiPicker
                                                }
                                            >
                                                {emoji ? (
                                                    <div
                                                        className={classnames(
                                                            'flex',
                                                            css.iconContainer
                                                        )}
                                                    >
                                                        <div
                                                            className={
                                                                'mr-1 flex align-self-center'
                                                            }
                                                        >
                                                            <Emoji
                                                                emoji={emoji.toJS()}
                                                                size={16}
                                                            />
                                                        </div>
                                                        <div>Change icon</div>
                                                    </div>
                                                ) : (
                                                    'Add icon'
                                                )}
                                            </Button>
                                            {emoji && (
                                                <IconButton
                                                    className={css.removeEmoji}
                                                    type="button"
                                                    intent={
                                                        ButtonIntent.Secondary
                                                    }
                                                    onClick={() =>
                                                        this.setState({
                                                            team: team.setIn(
                                                                [
                                                                    'decoration',
                                                                    'emoji',
                                                                ],
                                                                null
                                                            ),
                                                        })
                                                    }
                                                >
                                                    close
                                                </IconButton>
                                            )}
                                        </ButtonGroup>
                                        <Popover
                                            placement={'right'}
                                            isOpen={
                                                this.state.isEmojiPickerOpen
                                            }
                                            target="add-emoji"
                                            toggle={this._toggleEmojiPicker}
                                            hideArrow={true}
                                            className={css.popover}
                                            trigger="legacy"
                                        >
                                            <PopoverBody className={'p-0'}>
                                                <EmojiPicker
                                                    showPreview={false}
                                                    onClick={(
                                                        emoji: EmojiData
                                                    ) => {
                                                        this.setState({
                                                            team: team.setIn(
                                                                [
                                                                    'decoration',
                                                                    'emoji',
                                                                ],
                                                                fromJS(emoji)
                                                            ),
                                                        })
                                                        this._toggleEmojiPicker()
                                                    }}
                                                />
                                            </PopoverBody>
                                        </Popover>
                                    </FormGroup>
                                </div>
                                <InputField
                                    type="text"
                                    name="description"
                                    label="Description"
                                    placeholder="Works on making things awesome!"
                                    value={team.get('description') || ''}
                                    onChange={(value) =>
                                        this.setState({
                                            team: team.set(
                                                'description',
                                                value
                                            ),
                                        })
                                    }
                                />
                                <FormGroup>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classnames('mr-2', {
                                            'btn-loading':
                                                this.state.isSubmitting,
                                        })}
                                        disabled={this.state.isSubmitting}
                                    >
                                        Save team
                                    </Button>
                                    {isUpdate && (
                                        <ConfirmButton
                                            confirmationContent={
                                                <span>
                                                    You are about to{' '}
                                                    <b>delete</b> this team.
                                                    This action is{' '}
                                                    <b>irreversible</b>. This
                                                    will unassign this team from
                                                    all their tickets, open or
                                                    closed.
                                                </span>
                                            }
                                            intent={ButtonIntent.Destructive}
                                            onConfirm={this._delete}
                                            className="float-right"
                                            type="button"
                                        >
                                            <ButtonIconLabel icon="delete">
                                                Delete team
                                            </ButtonIconLabel>
                                        </ConfirmButton>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>
                    </BootstrapForm>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state, ownProps: OwnProps) => {
        return {
            teamId: parseInt(ownProps.match.params.id),
        }
    },
    {
        createTeam,
        deleteTeam,
        fetchTeam,
        updateTeam,
    }
)

export default withRouter(connector(FormContainer))
