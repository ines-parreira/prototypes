import classnames from 'classnames'
import pluralize from 'pluralize'
import React, {FormEvent, useCallback, useMemo, useRef, useState} from 'react'
import {useAsyncFn, useList, usePrevious, useUpdateEffect} from 'react-use'

import {TicketChannel} from 'business/types/ticket'
import {ISO639English} from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {createRule} from 'models/rule/resources'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextInput from 'pages/common/forms/input/TextInput'
import Label from 'pages/common/forms/Label/Label'
import {IntegrationsDetailLabel} from 'pages/common/utils/labels'
import {getMessagingIntegrations} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getEmptyRule} from 'state/rules/utils'
import {Team} from 'state/teams/types'
import {getAST} from 'utils'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import css from './RuleCreationModalContent.less'

type Props = {
    onClose: () => void
    team: Team
}

const keyOptions = [
    {label: 'Channel', value: 'ticket.channel'},
    {label: 'Integration', value: 'message.integration_id'},
    {label: 'Tag', value: 'ticket.tags.name'},
    {label: 'Language', value: 'ticket.language'},
]

type Option<T extends string | number> = {label: string; value: T}

const channelOptions = Object.values(TicketChannel).map((channel) => ({
    label: channel,
    value: channel,
}))

const languageOptions = Object.keys(ISO639English).map((languageKey) => ({
    label: ISO639English[languageKey],
    value: languageKey,
}))

function makeRuleCode(teamId: number, conditionStatement: string) {
    return `if (eq(message.from_agent, false)) {
        if (${conditionStatement}) {
            Action('setTeamAssignee', { assignee_team: ${teamId} })
        }
    }`
}

export default function RuleCreationModalContent({onClose, team}: Props) {
    const dispatch = useAppDispatch()
    const integrations = useAppSelector(getMessagingIntegrations)
    const tags = useAppSelector((state) => state.entities.tags)
    const ref = useRef<HTMLFormElement>(null)
    const defaultTeamName = useMemo(
        () => `[Auto assign] ${team.name}`,
        [team.name]
    )
    const [ruleName, setRuleName] = useState(defaultTeamName)
    const keyFloatingRef = useRef<HTMLDivElement>(null)
    const keyTargetRef = useRef<HTMLDivElement>(null)
    const [keyRule, setKeyRule] = useState(keyOptions[0]!.value)
    const previousKeyRule = usePrevious(keyRule)
    const [isKeySelectOpen, setIsKeySelectOpen] = useState(false)
    const keyLabel = useMemo(
        () => keyOptions.find((option) => option.value === keyRule)?.label,
        [keyRule]
    )
    const valueFloatingRef = useRef<HTMLDivElement>(null)
    const valueTargetRef = useRef<HTMLDivElement>(null)
    const [isValueSelectOpen, setIsValueSelectOpen] = useState(false)
    const [
        value,
        {
            clear: clearValue,
            filter: filterValue,
            push: pushValue,
            set: setValue,
        },
    ] = useList<number | string>([TicketChannel.Email])
    const hasSearch = useMemo(
        () => ['ticket.tags.name', 'ticket.language'].includes(keyRule),
        [keyRule]
    )
    const isValidForm = useMemo(
        () => !!ruleName && value.length > 0,
        [ruleName, value]
    )
    const integrationOptions = useMemo(
        () =>
            integrations
                .map((integration) => ({
                    label: (
                        <IntegrationsDetailLabel integration={integration!} />
                    ),
                    value: integration!.get('id') as number,
                }))
                .toJS() as Option<string>[],
        [integrations]
    )
    const tagOptions = useMemo(
        () =>
            Object.values(tags).map((tag) => ({
                label: tag.name,
                value: tag.name,
            })),
        [tags]
    )
    const keyPlural = useMemo(
        () => pluralize(keyLabel?.toLocaleLowerCase() || 'item'),
        [keyLabel]
    )
    const optionsDataSet = useMemo(
        () =>
            keyRule === 'ticket.channel'
                ? channelOptions
                : keyRule === 'message.integration_id'
                ? integrationOptions
                : keyRule === 'ticket.tags.name'
                ? tagOptions
                : keyRule === 'ticket.language'
                ? languageOptions
                : [],
        [integrationOptions, keyRule, tagOptions]
    )
    const valueDataSet = useMemo(
        () => optionsDataSet.map((option) => option.value),
        [optionsDataSet]
    )
    const valueLabel = useMemo(() => {
        return value.length === 0
            ? undefined
            : value.length > 3
            ? `${value.length} ${keyPlural}`
            : value
                  .reduce((acc: string[], item) => {
                      let label: string | undefined

                      if (keyRule === 'message.integration_id') {
                          const integration = integrations.find(
                              (integration) => item === integration?.get('id')
                          )

                          label = integration?.get(
                              'name',
                              integration.get('address')
                          ) as string
                      } else {
                          label = optionsDataSet.find(
                              (option) => option.value === item
                          )?.label
                      }

                      if (label != null) {
                          acc.push(label)
                      }
                      return acc
                  }, [])
                  .join(', ')
    }, [integrations, keyPlural, keyRule, optionsDataSet, value])

    useUpdateEffect(() => {
        if (previousKeyRule === keyRule) {
            return
        }

        valueTargetRef.current?.focus()
        clearValue()
    }, [clearValue, keyRule, previousKeyRule])

    const [{loading: isSubmitting}, submitRule] = useAsyncFn(async () => {
        const nextRuleCode = makeRuleCode(
            team.id,
            keyRule === 'ticket.tags.name'
                ? `containsAny(${keyRule}, [${value
                      .reduce((acc: string[], item) => {
                          acc.push(`'${item}'`)
                          return acc
                      }, [])
                      .join(', ')}])`
                : value
                      .reduce((acc: string[], item) => {
                          acc.push(
                              `eq(${keyRule}, ${
                                  typeof item === 'string' ? `'${item}'` : item
                              })`
                          )
                          return acc
                      }, [])
                      .join(' || ')
        )

        try {
            await createRule({
                ...getEmptyRule(),
                description: ` Assign all new customer-created tickets from the selected ${keyPlural} to ${team.name}`,
                name: ruleName,
                code: nextRuleCode,
                code_ast: getAST(nextRuleCode),
            })
            onClose()
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Rule created',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to create rule',
                })
            )
        }
    }, [keyPlural, keyRule, onClose, ruleName, team, value])

    const handleSubmit = useCallback(
        (event: FormEvent) => {
            event.preventDefault()
            logEvent(SegmentEvent.TeamWizardCreatedRule)
            void submitRule()
        },
        [submitRule]
    )

    const handleValueChange = useCallback(
        (nextValue: number) => {
            if (value.includes(nextValue)) {
                filterValue((value) => value !== nextValue)
            } else {
                pushValue(nextValue)
            }
        },
        [filterValue, pushValue, value]
    )

    return (
        <form onSubmit={handleSubmit} ref={ref}>
            <ModalHeader
                subtitle="Create a rule to assign new tickets to this team. You will be able to edit it later in the 'Rules' settings page"
                title="Assign tickets to this team"
            />

            <ModalBody>
                <Label className={css.label} htmlFor="name" isRequired>
                    Rule name
                </Label>

                <TextInput
                    autoFocus
                    id="name"
                    isRequired
                    onChange={setRuleName}
                    placeholder={defaultTeamName}
                    value={ruleName}
                />

                <div className={css.ruleSelectWrapper}>
                    <SelectInputBox
                        className={classnames(css.selectInput, css.keyInput)}
                        floating={keyFloatingRef}
                        label={keyLabel}
                        onToggle={setIsKeySelectOpen}
                        ref={keyTargetRef}
                    >
                        <SelectInputBoxContext.Consumer>
                            {(context) => (
                                <Dropdown
                                    isOpen={isKeySelectOpen}
                                    onToggle={() => context!.onBlur()}
                                    ref={keyFloatingRef}
                                    target={keyTargetRef}
                                    value={keyRule}
                                >
                                    <DropdownBody>
                                        {keyOptions.map((option) => (
                                            <DropdownItem
                                                autoFocus
                                                key={option.value}
                                                onClick={setKeyRule}
                                                option={option}
                                                shouldCloseOnSelect
                                            >
                                                {option.label}
                                            </DropdownItem>
                                        ))}
                                    </DropdownBody>
                                </Dropdown>
                            )}
                        </SelectInputBoxContext.Consumer>
                    </SelectInputBox>

                    <span className={css.operator}>is one of</span>

                    <SelectInputBox
                        className={css.selectInput}
                        floating={valueFloatingRef}
                        label={valueLabel}
                        placeholder={`Select ${keyPlural}`}
                        onToggle={setIsValueSelectOpen}
                        ref={valueTargetRef}
                    >
                        <SelectInputBoxContext.Consumer>
                            {(context) => (
                                <Dropdown
                                    isMultiple
                                    isOpen={isValueSelectOpen}
                                    onToggle={() => context!.onBlur()}
                                    ref={valueFloatingRef}
                                    target={valueTargetRef}
                                    value={value}
                                >
                                    {hasSearch && <DropdownSearch autoFocus />}

                                    <DropdownQuickSelect
                                        count={valueDataSet.length}
                                        onRemoveAll={() => {
                                            setValue([])
                                        }}
                                        onSelectAll={() => {
                                            setValue(valueDataSet)
                                        }}
                                        values={valueDataSet}
                                    />

                                    <DropdownBody>
                                        {optionsDataSet.map((option) => (
                                            <DropdownItem
                                                autoFocus={!hasSearch}
                                                key={option.value}
                                                onClick={handleValueChange}
                                                option={option as any}
                                            >
                                                {option.label}
                                            </DropdownItem>
                                        ))}
                                    </DropdownBody>
                                </Dropdown>
                            )}
                        </SelectInputBoxContext.Consumer>
                    </SelectInputBox>
                </div>
            </ModalBody>

            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Create rule later
                </Button>

                <Button
                    isDisabled={!isValidForm}
                    isLoading={isSubmitting}
                    type="submit"
                >
                    Create Rule
                </Button>
            </ModalActionsFooter>
        </form>
    )
}
