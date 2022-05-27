import React, {
    FormEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {useAsyncFn, useList, usePrevious} from 'react-use'
import {AnyAction} from 'redux'
import {EmojiData, BaseEmoji, emojiIndex} from 'emoji-mart'
import {fromJS, Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Button from 'pages/common/components/button/Button'
import Dropdown, {
    DropdownContext,
} from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import InputField from 'pages/common/forms/input/InputField'
import InputGroup from 'pages/common/forms/input/InputGroup'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextInput from 'pages/common/forms/input/TextInput'
import Label from 'pages/common/forms/Label/Label'
import {getAgents} from 'state/agents/selectors'
import {createTeam} from 'state/teams/actions'
import {Team} from 'state/teams/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import css from './TeamCreationModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onTeamCreated: (team: Team) => void
}

export default function TeamCreationModal({
    isOpen,
    onClose,
    onTeamCreated,
}: Props) {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getAgents)
    const ref = useRef<HTMLDivElement>(null)
    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [emoji, setEmoji] = useState<EmojiData>()
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isMemberSelectOpen, setIsMemberSelectOpen] = useState(false)
    const [
        memberIds,
        {
            clear: clearMemberIds,
            filter: filterMemberIds,
            push: pushMemberIds,
            set: setMemberIds,
        },
    ] = useList<number>([])
    const previousIsOpen = usePrevious(isOpen)

    const membersLabel = useMemo(() => {
        if (memberIds.length > 5) {
            return `${memberIds.length} team members`
        }

        return memberIds
            .reduce((acc: string[], id) => {
                const agent: Map<any, any> = agents.find(
                    (item: Map<any, any>) => item.get('id') === id
                )
                if (agent) {
                    acc.push(agent.get('name'))
                }
                return acc
            }, [])
            .join(', ')
    }, [agents, memberIds])

    const isValidForm = useMemo(
        () => !!name && memberIds.length > 0,
        [memberIds, name]
    )

    const resetForm = useCallback(() => {
        setName('')
        setEmoji(undefined)
        setDescription('')
        clearMemberIds()
    }, [clearMemberIds])

    useEffect(() => {
        if (previousIsOpen != null && previousIsOpen && !isOpen) {
            resetForm()
        }
    }, [isOpen, previousIsOpen, resetForm])

    const handleMemberChange = useCallback(
        (nextValue: number) => {
            if (memberIds.includes(nextValue)) {
                filterMemberIds((value) => value !== nextValue)
            } else {
                pushMemberIds(nextValue)
            }
        },
        [filterMemberIds, memberIds, pushMemberIds]
    )

    const [{loading: isSubmitting}, submitTeam] = useAsyncFn(
        async (event: FormEvent) => {
            event.preventDefault()
            const res = (await dispatch(
                createTeam(
                    fromJS({
                        name,
                        description,
                        decoration: {
                            ...(!!emoji ? {emoji} : {}),
                        },
                        members: memberIds.map((memberId) => ({id: memberId})),
                    })
                )
            )) as AnyAction

            if (!res.error) {
                logEvent(SegmentEvent.TeamCreation, {'referrer-page': 'teams'})
                onClose()
                resetForm()
                onTeamCreated((res as unknown as Map<any, any>).toJS())
            }
        },
        [description, emoji, memberIds, name, resetForm]
    )

    const handleSubmit = useCallback(
        async (event: FormEvent) => {
            if (isValidForm) {
                await submitTeam(event)
            }
        },
        [isValidForm, submitTeam]
    )

    const values = useMemo(
        () =>
            agents
                .map((agent: Map<any, any>) => agent.get('id') as number)
                .toJS() as number[],
        [agents]
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div ref={ref}>
                <form onSubmit={handleSubmit}>
                    <ModalHeader title="Create team" />
                    <ModalBody>
                        <Label className={css.label} isRequired htmlFor="name">
                            Team name
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <EmojiSelect
                                className={css.emojiSelect}
                                emoji={(emoji as BaseEmoji)?.native}
                                onEmojiSelect={(emoji) => {
                                    setEmoji(
                                        Object.values(emojiIndex.emojis).find(
                                            (value) =>
                                                (value as BaseEmoji)?.native ===
                                                emoji
                                        ) as EmojiData | undefined
                                    )
                                }}
                                onEmojiClear={() => setEmoji(undefined)}
                                container={ref}
                            />
                            <TextInput
                                id="name"
                                value={name || ''}
                                placeholder="Team name"
                                onChange={setName}
                                autoFocus
                                isRequired
                            />
                        </InputGroup>
                        <InputField
                            id="description"
                            label="Description"
                            className={css.inputGroup}
                            value={description || ''}
                            placeholder="Works on making things awesome!"
                            onChange={setDescription}
                        />
                        <Label className={css.label} isRequired>
                            Team members
                        </Label>
                        <SelectInputBox
                            floating={floatingRef}
                            label={membersLabel}
                            onToggle={setIsMemberSelectOpen}
                            placeholder="Add at least 1 team member"
                            ref={targetRef}
                        >
                            <SelectInputBoxContext.Consumer>
                                {(context) => (
                                    <Dropdown
                                        isMultiple
                                        isOpen={isMemberSelectOpen}
                                        onToggle={() => context!.onBlur()}
                                        ref={floatingRef}
                                        target={targetRef}
                                        value={memberIds}
                                    >
                                        <DropdownSearch autoFocus />
                                        <DropdownQuickSelect
                                            count={values.length}
                                            onRemoveAll={() => setMemberIds([])}
                                            onSelectAll={() =>
                                                setMemberIds(values)
                                            }
                                            values={values}
                                        />
                                        <DropdownBody>
                                            {agents.map(
                                                (agent: Map<any, any>) => (
                                                    <UserDropdownItem
                                                        agent={agent}
                                                        key={agent.get('id')}
                                                        onMemberChange={
                                                            handleMemberChange
                                                        }
                                                    />
                                                )
                                            )}
                                        </DropdownBody>
                                    </Dropdown>
                                )}
                            </SelectInputBoxContext.Consumer>
                        </SelectInputBox>
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button intent="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isDisabled={!isValidForm}
                            isLoading={isSubmitting}
                        >
                            Create team
                        </Button>
                    </ModalActionsFooter>
                </form>
            </div>
        </Modal>
    )
}

type UserDropdownItemProps = {
    agent: Map<any, any>
    onMemberChange: (nextValue: number) => void
}

function UserDropdownItem({agent, onMemberChange}: UserDropdownItemProps) {
    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'UserDropdownItem must be used within a DropdownContext.Provider'
        )
    }
    const {getHighlightedLabel} = dropdownContext

    const label = useMemo(
        () => getHighlightedLabel(agent.get('name') || agent.get('email')),
        [getHighlightedLabel, agent]
    )

    return (
        <DropdownItem
            option={{
                label: agent.get('name'),
                value: agent.get('id'),
            }}
            onClick={onMemberChange}
        >
            <Avatar
                className={css.avatar}
                email={agent.get('email')}
                name={agent.get('name')}
                size={20}
                url={agent.getIn(['meta', 'profile_picture_url'])}
            />
            {label}
        </DropdownItem>
    )
}
