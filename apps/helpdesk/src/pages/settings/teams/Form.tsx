import type { SyntheticEvent } from 'react'
import React, { useEffect, useState } from 'react'

import { history } from '@repo/routing'
import classnames from 'classnames'
import type { EmojiData } from 'emoji-mart'
import { Emoji } from 'emoji-mart'
import _cloneDeep from 'lodash/cloneDeep'
import { NavLink, useParams } from 'react-router-dom'
import {
    Form as BootstrapForm,
    Breadcrumb,
    BreadcrumbItem,
    ButtonGroup,
    Col,
    FormGroup,
    Popover,
    PopoverBody,
    Row,
} from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyIconButton as IconButton,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'
import type { Team } from '@gorgias/helpdesk-queries'

import { useAppNode } from 'appNode'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import EmojiPicker from 'pages/common/components/EmojiPicker/EmojiPicker'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import InputField from 'pages/common/forms/input/InputField'
import settingsCss from 'pages/settings/settings.less'
import { useDeleteTeam, useFetchTeam, useUpdateTeam } from 'teams/queries'

import css from './Form.less'

export const Form = () => {
    const { id: idString } = useParams<{
        id: string
    }>()
    const id = parseInt(idString)
    const appNode = useAppNode()

    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [team, setTeam] = useState<Team>()

    const { data, isLoading } = useFetchTeam(id)
    const { mutate: updateTeam, isLoading: isSubmitting } = useUpdateTeam(id)
    const { mutateAsync: deleteTeam } = useDeleteTeam()

    useEffect(() => {
        setTeam(_cloneDeep(data?.data))
    }, [data])

    const onSubmit = (e: SyntheticEvent) => {
        e.preventDefault()

        if (!!team) {
            updateTeam({ id, data: team })
        }
    }

    const handleDeleteTeam = async () => {
        if (!!team) {
            try {
                await deleteTeam({ id })
                history.push('/app/settings/teams')
            } catch {
                // handled in the hook
            }
        }
    }

    const toggleEmojiPicker = () => {
        setIsEmojiPickerOpen(!isEmojiPickerOpen)
    }

    const emoji = team?.decoration?.emoji as string | EmojiData | undefined

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
            <div className={settingsCss.pageContainer}>
                {isLoading ? (
                    <div className={css.spinner}>
                        <LoadingSpinner size="big" />
                    </div>
                ) : (
                    <BootstrapForm onSubmit={onSubmit}>
                        <Row>
                            <Col lg={6}>
                                <div className="d-flex">
                                    <InputField
                                        className={classnames(
                                            'flex-grow',
                                            css.inputField,
                                        )}
                                        name="name"
                                        label="Name"
                                        placeholder="Awesome team"
                                        value={team?.name || ''}
                                        onChange={(value) =>
                                            !!team &&
                                            setTeam({
                                                ...team,
                                                name: value,
                                            })
                                        }
                                        isRequired
                                    />
                                    <FormGroup
                                        className={classnames(
                                            'ml-2 align-self-end',
                                            css.inputField,
                                        )}
                                    >
                                        <ButtonGroup>
                                            <Button
                                                className={classnames(
                                                    css.emojiButton,
                                                    {
                                                        [css.hasEmoji]: !!emoji,
                                                    },
                                                )}
                                                intent="secondary"
                                                id="add-emoji"
                                                onClick={toggleEmojiPicker}
                                            >
                                                {emoji ? (
                                                    <div
                                                        className={classnames(
                                                            'flex',
                                                            css.iconContainer,
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
                                                    icon="close"
                                                    className={css.removeEmoji}
                                                    intent="secondary"
                                                    onClick={() =>
                                                        setTeam({
                                                            ...team,
                                                            decoration: {
                                                                ...team.decoration,
                                                                emoji: undefined,
                                                            },
                                                        })
                                                    }
                                                />
                                            )}
                                        </ButtonGroup>
                                        <Popover
                                            placement="right"
                                            isOpen={isEmojiPickerOpen}
                                            target="add-emoji"
                                            toggle={toggleEmojiPicker}
                                            hideArrow={true}
                                            className={css.popover}
                                            trigger="legacy"
                                            container={appNode ?? undefined}
                                        >
                                            <PopoverBody className="p-0">
                                                <EmojiPicker
                                                    showPreview={false}
                                                    onClick={(
                                                        emoji: EmojiData,
                                                    ) => {
                                                        !!team &&
                                                            setTeam({
                                                                ...team,
                                                                decoration: {
                                                                    ...team.decoration,
                                                                    emoji,
                                                                },
                                                            })
                                                        toggleEmojiPicker()
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
                                        setTeam({
                                            ...team,
                                            description: value,
                                        })
                                    }
                                />
                                <FormGroup>
                                    <Button
                                        type="submit"
                                        className="mr-2"
                                        isLoading={isSubmitting}
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
                                        onConfirm={handleDeleteTeam}
                                        className="float-right"
                                        leadingIcon="delete"
                                    >
                                        Delete team
                                    </ConfirmButton>
                                </FormGroup>
                            </Col>
                        </Row>
                    </BootstrapForm>
                )}
            </div>
        </div>
    )
}
