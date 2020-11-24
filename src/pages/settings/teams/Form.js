//@flow
import React, {Component} from 'react'
import {Emoji} from 'emoji-mart'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
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
import {browserHistory, Link} from 'react-router'
import classnames from 'classnames'

import * as actions from '../../../state/teams/actions.ts'
import Loader from '../../common/components/Loader'
import PageHeader from '../../common/components/PageHeader.tsx'
import InputField from '../../common/forms/InputField'
import SecondaryNavbar from '../../common/components/SecondaryNavbar/SecondaryNavbar'
import ConfirmButton from '../../common/components/ConfirmButton.tsx'
import {type teamType} from '../../../state/teams/types'
import EmojiPicker from '../../common/components/EmojiPicker'

import css from './Form.less'

type Props = {
    teamId: number,
    createTeam: (team: teamType) => Promise<*>,
    deleteTeam: (teamId: number) => Promise<*>,
    fetchTeam: (teamId: number) => Promise<*>,
    updateTeam: (team: teamType) => Promise<*>,
}

type State = {
    team: teamType,
    errors: Object,
    isFetching: boolean,
    isSubmitting: boolean,
    isEmojiPickerOpen: boolean,
}

@connect(
    (state, ownProps) => {
        return {
            teamId: parseInt(ownProps.params.id),
        }
    },
    {
        createTeam: actions.createTeam,
        deleteTeam: actions.deleteTeam,
        fetchTeam: actions.fetchTeam,
        updateTeam: actions.updateTeam,
    }
)
export default class Form extends Component<Props, State> {
    state = {
        team: fromJS({}),
        errors: {},
        isFetching: false,
        isSubmitting: false,
        isEmojiPickerOpen: false,
    }

    componentDidMount() {
        if (this._isUpdate()) {
            this._fetchTeam(this.props.teamId)
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
                team: resp,
            })
        })
    }

    _onSubmit = (e: SyntheticEvent<*>) => {
        e.preventDefault()
        this.setState({isSubmitting: true})
        const team = this.state.team
        const promise = this._isUpdate()
            ? this.props.updateTeam(team)
            : this.props.createTeam(team)
        return promise.then((resp) => {
            this.setState({isSubmitting: false})
            if (!this._isUpdate()) {
                browserHistory.push(
                    `app/settings/teams/${resp.get('id')}/members`
                )
            }
        })
    }

    _delete = () => {
        return this.props
            .deleteTeam(this.state.team.get('id'))
            .then((success) => {
                if (success) {
                    browserHistory.push('app/settings/teams')
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
        const emoji = team.getIn(['decoration', 'emoji'])

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/teams">Teams</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {isUpdate
                                    ? `Edit ${team.get('name')}`
                                    : 'Create team'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                {isUpdate && (
                    <SecondaryNavbar>
                        <Link
                            to={`/app/settings/teams/${team.get('id')}/members`}
                        >
                            Team members
                        </Link>
                        <Link to={`/app/settings/teams/${team.get('id')}`}>
                            Settings
                        </Link>
                    </SecondaryNavbar>
                )}
                <Container fluid className="page-container">
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
                                                    <div className={'flex'}>
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
                                                <Button
                                                    type="button"
                                                    color="secondary"
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
                                                    <i className="material-icons">
                                                        close
                                                    </i>
                                                </Button>
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
                                        >
                                            <PopoverBody className={'p-0'}>
                                                <EmojiPicker
                                                    showPreview={false}
                                                    onClick={(emoji) => {
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
                                            'btn-loading': this.state
                                                .isSubmitting,
                                        })}
                                        disabled={this.state.isSubmitting}
                                    >
                                        Save team
                                    </Button>
                                    {isUpdate && (
                                        <ConfirmButton
                                            content={
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
                                            confirm={this._delete}
                                            className="float-right"
                                            color="danger"
                                            outline
                                        >
                                            <i className="material-icons">
                                                delete
                                            </i>{' '}
                                            Delete team
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
