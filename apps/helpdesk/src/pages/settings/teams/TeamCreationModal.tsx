import type { FormEvent } from 'react'
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useAsyncFn, usePrevious } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { BaseEmoji, EmojiData } from 'emoji-mart'
import { emojiIndex } from 'emoji-mart'
import type { Map } from 'immutable'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { createTeam } from 'models/team/resources'
import type { Team } from 'models/team/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
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
import type { WizardContextState } from 'pages/common/components/wizard/Wizard'
import Wizard, { WizardContext } from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import InputField from 'pages/common/forms/input/InputField'
import InputGroup from 'pages/common/forms/input/InputGroup'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextInput from 'pages/common/forms/input/TextInput'
import { getHumanAgents } from 'state/agents/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { FETCH_TEAM_SUCCESS } from 'state/teams/constants'

import RuleCreationModalContent from './RuleCreationModalContent'

import css from './TeamCreationModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onTeamCreated?: () => void
}

const steps = ['teamCreation', 'ruleCreation']

export default function TeamCreationModal({
    isOpen,
    onClose,
    onTeamCreated,
}: Props) {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getHumanAgents)
    const ref = useRef<HTMLDivElement>(null)
    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [emoji, setEmoji] = useState<EmojiData>()
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)
    const [isMemberSelectOpen, setIsMemberSelectOpen] = useState(false)

    const [memberIds, setMemberIds] = useState<number[]>([])

    const previousIsOpen = usePrevious(isOpen)
    const [team, setTeam] = useState<Team | null>()

    const membersLabel = useMemo(() => {
        if (memberIds.length > 5) {
            return `${memberIds.length} team members`
        }

        return memberIds
            .reduce((acc: string[], id) => {
                const agent: Map<any, any> = agents.find(
                    (item: Map<any, any>) => item.get('id') === id,
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
        [memberIds, name],
    )

    const resetForm = useCallback(() => {
        setName('')
        setEmoji(undefined)
        setDescription('')
        setMemberIds([])
    }, [])

    useEffect(() => {
        if (previousIsOpen != null && previousIsOpen && !isOpen) {
            resetForm()
        }
    }, [isOpen, previousIsOpen, resetForm])

    const handleMemberChange = useCallback(
        (nextValue: number) => {
            if (memberIds.includes(nextValue)) {
                setMemberIds((prev) =>
                    prev.filter((value) => value !== nextValue),
                )
            } else {
                setMemberIds((prev) => [...prev, nextValue])
            }
        },
        [memberIds],
    )

    const [{ loading: isSubmitting }, submitTeam] = useAsyncFn(
        async (event: FormEvent, setActiveStep: (nextStep: string) => void) => {
            event.preventDefault()

            try {
                const res = await createTeam({
                    name,
                    description,
                    decoration: !!emoji ? { emoji } : {},
                    members: memberIds.map((memberId) => ({ id: memberId })),
                })

                dispatch({
                    type: FETCH_TEAM_SUCCESS,
                    payload: res,
                })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team created',
                    }),
                )

                setTeam(res)
                resetForm()
                setActiveStep('ruleCreation')
                onTeamCreated?.()
            } catch {
                void dispatch(
                    notify({
                        message:
                            'Failed to create team. Please refresh the page and try again.',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [description, emoji, memberIds, name, resetForm],
    )

    const handleTeamCreationSubmit = useCallback(
        (setActiveStep: (nextStep: string) => void) =>
            async (event: FormEvent) => {
                if (isValidForm) {
                    logEvent(SegmentEvent.TeamWizardCreatedTeam)
                    await submitTeam(event, setActiveStep)
                }
            },
        [isValidForm, submitTeam],
    )

    const values = useMemo(
        () =>
            agents
                .map((agent: Map<any, any>) => agent.get('id') as number)
                .toJS() as number[],
        [agents],
    )

    const handleOnClose = useCallback(
        (setActiveStep: WizardContextState['setActiveStep']) => () => {
            onClose()
            setActiveStep('teamCreation')
        },
        [onClose],
    )

    return (
        <Wizard steps={steps}>
            <WizardContext.Consumer>
                {(context) =>
                    context ? (
                        <Modal
                            isOpen={isOpen}
                            onClose={handleOnClose(context.setActiveStep)}
                        >
                            <div ref={ref}>
                                <WizardStep name="teamCreation">
                                    <form
                                        onSubmit={handleTeamCreationSubmit(
                                            context.setActiveStep,
                                        )}
                                    >
                                        <ModalHeader title="Create team" />
                                        <ModalBody>
                                            <Label
                                                className={css.label}
                                                isRequired
                                                htmlFor="name"
                                            >
                                                Team name
                                            </Label>
                                            <InputGroup
                                                className={css.inputGroup}
                                            >
                                                <EmojiSelect
                                                    className={css.emojiSelect}
                                                    emoji={
                                                        (emoji as BaseEmoji)
                                                            ?.native
                                                    }
                                                    onEmojiSelect={(emoji) => {
                                                        setEmoji(
                                                            Object.values(
                                                                emojiIndex.emojis,
                                                            ).find(
                                                                (value) =>
                                                                    (
                                                                        value as BaseEmoji
                                                                    )
                                                                        ?.native ===
                                                                    emoji,
                                                            ) as
                                                                | EmojiData
                                                                | undefined,
                                                        )
                                                    }}
                                                    onEmojiClear={() =>
                                                        setEmoji(undefined)
                                                    }
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
                                            <Label
                                                className={css.label}
                                                isRequired
                                            >
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
                                                            isOpen={
                                                                isMemberSelectOpen
                                                            }
                                                            onToggle={() =>
                                                                context!.onBlur()
                                                            }
                                                            ref={floatingRef}
                                                            target={targetRef}
                                                            value={memberIds}
                                                        >
                                                            <DropdownSearch
                                                                autoFocus
                                                            />
                                                            <DropdownQuickSelect
                                                                count={
                                                                    values.length
                                                                }
                                                                onRemoveAll={() =>
                                                                    setMemberIds(
                                                                        [],
                                                                    )
                                                                }
                                                                onSelectAll={() =>
                                                                    setMemberIds(
                                                                        values,
                                                                    )
                                                                }
                                                                values={values}
                                                            />
                                                            <DropdownBody>
                                                                {agents
                                                                    .toArray()
                                                                    .map(
                                                                        (
                                                                            agent: Map<
                                                                                any,
                                                                                any
                                                                            >,
                                                                        ) => (
                                                                            <UserDropdownItem
                                                                                agent={
                                                                                    agent
                                                                                }
                                                                                key={agent.get(
                                                                                    'id',
                                                                                )}
                                                                                onMemberChange={
                                                                                    handleMemberChange
                                                                                }
                                                                            />
                                                                        ),
                                                                    )}
                                                            </DropdownBody>
                                                        </Dropdown>
                                                    )}
                                                </SelectInputBoxContext.Consumer>
                                            </SelectInputBox>
                                        </ModalBody>
                                        <ModalActionsFooter>
                                            <Button
                                                intent="secondary"
                                                onClick={onClose}
                                            >
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
                                </WizardStep>
                                <WizardStep name="ruleCreation">
                                    {!!team && (
                                        <RuleCreationModalContent
                                            team={team}
                                            onClose={handleOnClose(
                                                context.setActiveStep,
                                            )}
                                        />
                                    )}
                                </WizardStep>
                            </div>
                        </Modal>
                    ) : null
                }
            </WizardContext.Consumer>
        </Wizard>
    )
}

type UserDropdownItemProps = {
    agent: Map<any, any>
    onMemberChange: (nextValue: number) => void
}

function UserDropdownItem({ agent, onMemberChange }: UserDropdownItemProps) {
    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'UserDropdownItem must be used within a DropdownContext.Provider',
        )
    }
    const { getHighlightedLabel } = dropdownContext

    const label = useMemo(
        () => getHighlightedLabel(agent.get('name') || agent.get('email')),
        [getHighlightedLabel, agent],
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
