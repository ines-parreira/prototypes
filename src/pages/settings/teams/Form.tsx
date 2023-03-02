import React, {Component, SyntheticEvent} from 'react'
import {Emoji, EmojiData} from 'emoji-mart'
import {connect, ConnectedProps} from 'react-redux'
import {
    Breadcrumb,
    BreadcrumbItem,
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

import {GorgiasApiError} from 'models/api/types'
import {deleteTeam, fetchTeam, updateTeam} from 'models/team/resources'
import {Team} from 'models/team/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import IconButton from 'pages/common/components/button/IconButton'
import EmojiPicker from 'pages/common/components/EmojiPicker/EmojiPicker'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import InputField from 'pages/common/forms/input/InputField'
import history from 'pages/history'
import settingsCss from 'pages/settings/settings.less'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    deleteTeamSuccess,
    fetchTeamSuccess,
    updateTeamSuccess,
} from 'state/teams/actions'

import css from './Form.less'

type OwnProps = RouteComponentProps<{id: string}>

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    team?: Team
    isFetching: boolean
    isSubmitting: boolean
    isEmojiPickerOpen: boolean
}

export class FormContainer extends Component<Props, State> {
    state: State = {
        isFetching: false,
        isSubmitting: false,
        isEmojiPickerOpen: false,
    }

    componentDidMount() {
        void this._fetchTeam(this.props.teamId)
    }

    _fetchTeam = async (id: number) => {
        this.setState({isFetching: true})

        try {
            const res = await fetchTeam(id)

            this.setState({
                team: res,
            })
            this.props.fetchTeamSuccess(res)
        } catch (error) {
            void this.props.notify({
                message: (error as GorgiasApiError).response.data.error.msg,
                status: NotificationStatus.Error,
            })
        } finally {
            this.setState({isFetching: false})
        }
    }

    _onSubmit = async (e: SyntheticEvent) => {
        e.preventDefault()
        this.setState({isSubmitting: true})
        const team = this.state.team

        if (!!team) {
            try {
                await updateTeam(team)
                this.props.updateTeamSuccess(team)
            } catch (error) {
                const {response} = error as GorgiasApiError

                void this.props.notify({
                    message: response.data.error.msg,
                    status: NotificationStatus.Error,
                })
            } finally {
                this.setState({isSubmitting: false})
            }
        }
    }

    _delete = async () => {
        const team = this.state.team

        if (!!team) {
            try {
                await deleteTeam(team.id)

                history.push('/app/settings/teams')
                this.props.deleteTeamSuccess(team.id)
            } catch (error) {
                const {response} = error as GorgiasApiError

                void this.props.notify({
                    message: response.data.error.msg,
                    status: NotificationStatus.Error,
                })
            }
        }
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

        const team = this.state.team
        const emoji = team?.decoration?.emoji

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
                                Edit {team?.name}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <SecondaryNavbar>
                    <NavLink
                        to={`/app/settings/teams/${team?.id || ''}/members`}
                        exact
                    >
                        Team members
                    </NavLink>
                    <NavLink to={`/app/settings/teams/${team?.id || ''}`} exact>
                        Settings
                    </NavLink>
                </SecondaryNavbar>
                <Container fluid className={settingsCss.pageContainer}>
                    <BootstrapForm onSubmit={this._onSubmit}>
                        <Row>
                            <Col lg={6}>
                                <div className="d-flex">
                                    <InputField
                                        className={classnames(
                                            'flex-grow',
                                            css.inputField
                                        )}
                                        name="name"
                                        label="Name"
                                        placeholder="Awesome team"
                                        value={team?.name || ''}
                                        onChange={(value) =>
                                            !!team &&
                                            this.setState({
                                                team: {
                                                    ...team,
                                                    name: value,
                                                },
                                            })
                                        }
                                        isRequired
                                    />
                                    <FormGroup
                                        className={classnames(
                                            'ml-2 align-self-end',
                                            css.inputField
                                        )}
                                    >
                                        <ButtonGroup>
                                            <Button
                                                className={classnames(
                                                    css.emojiButton,
                                                    {
                                                        [css.hasEmoji]: !!emoji,
                                                    }
                                                )}
                                                intent="secondary"
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
                                                                emoji={emoji}
                                                                size={16}
                                                            />
                                                        </div>
                                                        <div>Change icon</div>
                                                    </div>
                                                ) : (
                                                    'Add icon'
                                                )}
                                            </Button>
                                            {!!emoji && !!team && (
                                                <IconButton
                                                    className={css.removeEmoji}
                                                    intent="secondary"
                                                    onClick={() =>
                                                        this.setState({
                                                            team: {
                                                                ...team,
                                                                decoration: {
                                                                    ...team.decoration,
                                                                    emoji: undefined,
                                                                },
                                                            },
                                                        })
                                                    }
                                                >
                                                    close
                                                </IconButton>
                                            )}
                                        </ButtonGroup>
                                        <Popover
                                            placement="right"
                                            isOpen={
                                                this.state.isEmojiPickerOpen
                                            }
                                            target="add-emoji"
                                            toggle={this._toggleEmojiPicker}
                                            hideArrow={true}
                                            className={css.popover}
                                            trigger="legacy"
                                        >
                                            <PopoverBody className="p-0">
                                                <EmojiPicker
                                                    showPreview={false}
                                                    onClick={(
                                                        emoji: EmojiData
                                                    ) => {
                                                        !!team &&
                                                            this.setState({
                                                                team: {
                                                                    ...team,
                                                                    decoration:
                                                                        {
                                                                            ...team.decoration,
                                                                            emoji,
                                                                        },
                                                                },
                                                            })
                                                        this._toggleEmojiPicker()
                                                    }}
                                                />
                                            </PopoverBody>
                                        </Popover>
                                    </FormGroup>
                                </div>
                                <InputField
                                    className={css.inputField}
                                    name="description"
                                    label="Description"
                                    placeholder="Works on making things awesome!"
                                    value={team?.description || ''}
                                    onChange={(value) =>
                                        !!team &&
                                        this.setState({
                                            team: {
                                                ...team,
                                                description: value,
                                            },
                                        })
                                    }
                                />
                                <FormGroup>
                                    <Button
                                        type="submit"
                                        className="mr-2"
                                        isLoading={this.state.isSubmitting}
                                    >
                                        Save team
                                    </Button>
                                    <ConfirmButton
                                        confirmationContent={
                                            <span>
                                                You are about to <b>delete</b>{' '}
                                                this team. This action is{' '}
                                                <b>irreversible</b>. This will
                                                unassign this team from all
                                                their tickets, open or closed.
                                            </span>
                                        }
                                        intent="destructive"
                                        onConfirm={this._delete}
                                        className="float-right"
                                    >
                                        <ButtonIconLabel icon="delete">
                                            Delete team
                                        </ButtonIconLabel>
                                    </ConfirmButton>
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
    (state, ownProps: OwnProps) => ({
        teamId: parseInt(ownProps.match.params.id),
    }),
    {
        deleteTeamSuccess,
        fetchTeamSuccess,
        notify,
        updateTeamSuccess,
    }
)

export default withRouter(connector(FormContainer))
