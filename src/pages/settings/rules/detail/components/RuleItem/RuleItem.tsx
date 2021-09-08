import React, {useState, useMemo} from 'react'
import {SyntheticEvent} from 'react-draft-wysiwyg'
import {useAsyncFn} from 'react-use'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _getIn from 'lodash/get'
import {
    Button,
    Form as BootstrapForm,
    FormGroup,
    InputProps,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap'

import InputField from '../../../../../common/forms/InputField'
import SelectField from '../../../../../common/forms/MultiSelectField'
import {
    eventsDependencies,
    eventNameToLabel,
    events,
} from '../../../../../../config/rules'
import EditableTitle from '../../../../../common/components/EditableTitle'
import Program from '../../../../../common/components/ast/Program'
import Errors from '../../../../../common/components/ast/Errors'
import {
    eventTypes as getEventTypes,
    getArraysIntersection,
} from '../../../../../../state/rules/helpers'
import {toJS} from '../../../../../../utils'
import ToggleButton from '../../../../../common/components/ToggleButton'
import {getMomentUtcISOString} from '../../../../../../utils/date'
import {Rule} from '../../../../../../models/rule/types'
import {
    ruleUpdated,
    ruleDeleted,
    ruleAstUpdated,
    ruleCreated,
} from '../../../../../../state/entities/rules/actions'

import {
    updateRule,
    deleteRule,
    fetchRule,
    createRule,
} from '../../../../../../models/rule/resources'
import {notify} from '../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {getSchemas} from '../../../../../../state/schemas/selectors'
import {RootState} from '../../../../../../state/types'
import {RuleOperation} from '../../../../../../state/rules/types'

import {RuleItemButtons} from './RuleItemButtons'
import css from './RuleItem.less'

type OwnProps = {
    rule: Rule
    toggleOpening: (id: number | number[]) => void
    canDuplicate: boolean
    onActivate: (rule: Rule) => Promise<void>
    onDeactivate: (rule: Rule) => Promise<void>
}

export type RuleItemActions = {
    modifyCodeAST: (
        path: List<any>,
        node: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation
    ) => void
    getCondition: (path: List<any>) => Map<any, any>
}

export function RuleItemContainer({
    rule,
    onActivate,
    onDeactivate,
    toggleOpening,
    canDuplicate,
    notify,
    schemas,
    ruleCreated,
    ruleUpdated,
    ruleDeleted,
    ruleAstUpdated,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [name, setName] = useState(rule.name || '')
    const [description, setDescription] = useState(rule.description || '')
    const [eventTypes, setEventTypes] = useState<string[]>(getEventTypes(rule))
    const [showConfirmation, setShowConfirmation] = useState(false)

    const toggleConfirmation = () => {
        setShowConfirmation(!showConfirmation)
    }

    const [{loading: isSubmitting}, handleSubmit] = useAsyncFn(
        async (event: SyntheticEvent) => {
            event.preventDefault()
            if (canSubmit) {
                try {
                    const newRule = await updateRule({
                        id: rule.id,
                        name,
                        description,
                        event_types: eventTypes.join(','),
                        code: rule.code,
                        code_ast: rule.code_ast,
                        deactivated_datetime: rule.deactivated_datetime,
                    })
                    ruleUpdated(newRule)
                    void notify({
                        status: NotificationStatus.Success,
                        message: 'Successfully updated rule',
                    })
                } catch (error) {
                    void notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to update rule',
                    })
                }
            }
        },
        [rule, name, description, eventTypes]
    )

    const canSubmit = useMemo(
        () => eventTypes.length > 0 && !isSubmitting && name,
        [eventTypes, isSubmitting, name]
    )

    const [{loading: isResetting}, handleReset] = useAsyncFn(async () => {
        try {
            const resetRule = await fetchRule(rule.id)
            ruleUpdated(resetRule)
            setEventTypes(getEventTypes(resetRule))
            setName(resetRule.name)
            setDescription(resetRule.description)
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: 'Failed to reset rule',
            })
        }
    })

    const handleDeactivate = async () => {
        if (eventTypes.length) {
            await onDeactivate({...rule, event_types: eventTypes.join(',')})
        } else {
            void notify({
                message: 'Cannot update rule without any event types',
                status: NotificationStatus.Error,
            })
        }
        toggleConfirmation()
    }

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        try {
            await deleteRule(rule.id)
            ruleDeleted(rule.id)
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: 'Failed to delete rule',
            })
        }
    })

    const handleDuplicate = async () => {
        if (canDuplicate) {
            try {
                if (canSubmit) {
                    const newRule = await createRule({
                        name: name !== rule.name ? name : `${name} - copy`,
                        description,
                        event_types: eventTypes.join(','),
                        code: rule.code,
                        code_ast: rule.code_ast,
                        deactivated_datetime: getMomentUtcISOString(),
                    })
                    void handleReset()
                    toggleOpening([rule.id, newRule.id])
                    void notify({
                        status: NotificationStatus.Success,
                        message: 'Duplicated rule successfully',
                    })
                    ruleCreated(newRule)
                }
            } catch (error) {
                void notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to duplicate rule',
                })
            }
        } else {
            void notify({
                message:
                    'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
                status: NotificationStatus.Error,
            })
        }
    }

    const toggleItemStatus = async () => {
        const checked = !!rule.deactivated_datetime
        if (checked) {
            if (eventTypes.length) {
                await onActivate({
                    ...rule,
                    event_types: eventTypes.join(','),
                })
            } else {
                void notify({
                    message: 'Cannot update rule without any event types',
                    status: NotificationStatus.Error,
                })
            }
        } else {
            toggleConfirmation()
        }
    }

    const toggleId = useMemo(() => `rule-toggle-${rule.id}`, [rule])

    const modifyCodeAST = (
        path: List<any>,
        value: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation
    ): void => {
        ruleAstUpdated({
            id: rule.id,
            path: toJS(path),
            value,
            operation,
            schemas,
        })
    }

    const getCondition = (path: List<any>) =>
        fromJS(_getIn(rule, ['code_ast', ...path.toJS()])) as Map<any, any>

    let dependentEvents = getArraysIntersection(
        eventsDependencies['ticket-updated'],
        eventTypes
    )
    dependentEvents = dependentEvents.map((event) => {
        return eventNameToLabel[event]
    })

    const containsDependentEvents =
        eventTypes.includes('ticket-updated') && dependentEvents.length > 0

    return (
        <tr
            id={`${rule.id}`}
            key={rule.id}
            data-id={rule.id} // dragging info
            className={classnames('container', css.container)}
        >
            <td colSpan={3}>
                <div className={css.row}>
                    <div className={classnames(css.col, css['left-col'])}>
                        <i
                            className={classnames(
                                'material-icons',
                                css.closeRuleIcon
                            )}
                            onClick={() => toggleOpening(rule.id)}
                        >
                            keyboard_arrow_down
                        </i>
                    </div>
                    <div className={classnames(css.col, css['center-col'])}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <EditableTitle
                                title={name}
                                placeholder="Name"
                                size={'md' as InputProps['bs']}
                                className={classnames(css.name)}
                                onChange={(value) => setName(value as string)}
                            />
                        </div>
                        <FormGroup className="mb-0">
                            <InputField
                                className={css['rule-description']}
                                type="textarea"
                                placeholder="Description"
                                rows="1"
                                value={description}
                                onChange={(value) =>
                                    setDescription(value as string)
                                }
                            />
                        </FormGroup>
                    </div>
                    <div
                        className={classnames(
                            css.col,
                            css['right-col'],
                            'position-relative'
                        )}
                    >
                        <ToggleButton
                            value={!rule.deactivated_datetime}
                            onChange={toggleItemStatus}
                        />
                        <div
                            className={css['confirmation-popover']}
                            id={toggleId}
                        />
                        <Popover
                            placement="left"
                            isOpen={showConfirmation}
                            target={toggleId}
                            toggle={toggleConfirmation}
                            trigger="legacy"
                        >
                            <PopoverHeader>Are you sure?</PopoverHeader>
                            <PopoverBody>
                                <p>
                                    Are you sure you want to deactivate this
                                    rule?
                                </p>

                                <Button
                                    type="submit"
                                    color="success"
                                    onClick={handleDeactivate}
                                >
                                    Confirm
                                </Button>
                            </PopoverBody>
                        </Popover>
                    </div>
                </div>

                <div className={css.row}>
                    <div className="full-width">
                        <BootstrapForm
                            id={`rule-form-${rule.id}`}
                            onSubmit={handleSubmit}
                        >
                            <FormGroup className="mb-1">
                                <div className={css['when-container']}>
                                    <div className={css['when-btn']}>WHEN</div>
                                    <SelectField
                                        values={eventTypes}
                                        options={events.toJS()}
                                        singular="event"
                                        plural="events"
                                        onChange={setEventTypes}
                                        className={css['when-events']}
                                    />
                                    {eventTypes.length === 0 && (
                                        <Errors inline>
                                            You need to select at least one
                                            trigger
                                        </Errors>
                                    )}
                                    {containsDependentEvents && (
                                        <Errors inline>
                                            <b>{dependentEvents.join(', ')}</b>{' '}
                                            already covered by{' '}
                                            <b>ticket updated</b>
                                        </Errors>
                                    )}
                                </div>
                                <Program
                                    {...rule.code_ast}
                                    rule={fromJS(rule)}
                                    actions={{modifyCodeAST, getCondition}}
                                />
                            </FormGroup>
                        </BootstrapForm>
                    </div>
                </div>

                <div className={css.row}>
                    <RuleItemButtons
                        ruleId={rule.id}
                        shouldDisplayError={!name}
                        isSubmitDisabled={!canSubmit}
                        isResetting={isResetting}
                        isDeleting={isDeleting}
                        onDuplicate={handleDuplicate}
                        onReset={handleReset}
                        onDelete={handleDelete}
                    />
                </div>
            </td>
        </tr>
    )
}

const connector = connect(
    (state: RootState) => ({schemas: getSchemas(state)}),
    {
        ruleCreated,
        ruleAstUpdated,
        ruleUpdated,
        ruleDeleted,
        notify,
    }
)

export default connector(RuleItemContainer)
