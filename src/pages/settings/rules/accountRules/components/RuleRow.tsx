import React, {MouseEvent, useMemo, useState} from 'react'
import {useAsyncFn} from 'react-use'
import moment from 'moment'
import classnames from 'classnames'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {getHasAutomationAddOn} from 'state/billing/selectors'

import {deactivateRule, createRule, deleteRule} from 'models/rule/resources'
import {RuleRecipe} from 'models/ruleRecipe/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ToggleInput from 'pages/common/forms/ToggleInput'
import history from 'pages/history'
import {
    ruleCreated,
    ruleUpdated,
    ruleDeleted,
} from 'state/entities/rules/actions'
import {getSortedRuleRecipes} from 'state/entities/ruleRecipes/selectors'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {Rule, RuleType} from 'state/rules/types'

import css from './RuleRow.less'

type Props = {
    rule: Rule
    canDuplicate: boolean
    handleUpgrade: (id: number) => void
    onActivate: (id: number) => Promise<void>
}

export function RuleRow({
    rule,
    canDuplicate,
    handleUpgrade,
    onActivate,
}: Props) {
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const ruleRecipes = useAppSelector(getSortedRuleRecipes)

    const [isDescriptionOpen, setDescriptionOpen] = useState(false)
    const [showToggleConfirmation, setShowToggleConfirmation] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const isFromLibrary = useMemo(() => {
        return !!Object.values(ruleRecipes).find((recipe: RuleRecipe) => {
            const formattedName = recipe.recipe_tag
                ? `[${recipe.recipe_tag}] ${recipe.rule.name}`
                : `${recipe.rule.name}`
            return (
                formattedName === rule.name &&
                recipe.rule.code === rule.code &&
                rule.event_types === recipe.rule.event_types
            )
        })
    }, [rule, ruleRecipes])

    const toggleShowToggleConfirmation = () => {
        setShowToggleConfirmation(!showToggleConfirmation)
    }

    const toggleShowDeleteConfirmation = () => {
        setShowDeleteConfirmation(!showDeleteConfirmation)
    }

    const handleDuplicate = async () => {
        if (canDuplicate) {
            try {
                const newRule = await createRule({
                    name: `${rule.name} - copy`,
                    description: rule.description,
                    event_types: rule.event_types,
                    code: rule.code,
                    code_ast: rule.code_ast,
                    deactivated_datetime: null,
                })
                void dispatch(ruleCreated(newRule))
                history.push(`/app/settings/rules/${newRule.id}`)
                void dispatch(
                    notify({
                        message: 'Rule duplicated successfully',
                        status: NotificationStatus.Success,
                    })
                )
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

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        try {
            await deleteRule(rule.id)
            void dispatch(ruleDeleted(rule.id))
            void notify({
                status: NotificationStatus.Success,
                message: `Successfully deleted rule ${rule.name}`,
            })
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to delete rule',
                })
            )
        }
    })

    const handleActivate = () => {
        if (!hasAutomationAddOn && rule.type === RuleType.Managed) {
            handleUpgrade(rule.id)
            return
        }
        void onActivate(rule.id)
    }

    const handleDeactivate = async () => {
        try {
            const res = await deactivateRule(rule.id)
            void dispatch(ruleUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Rule deactivated successfully',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Unable to deactivate rule',
                })
            )
        }
        toggleShowToggleConfirmation()
    }

    const toggleActivation = (
        value: boolean,
        event: MouseEvent<HTMLLabelElement>
    ) => {
        event.stopPropagation()
        const checked = !!rule.deactivated_datetime
        if (checked) {
            void handleActivate()
        } else {
            toggleShowToggleConfirmation()
        }
    }

    const formattedUpdatedDate = useMemo(
        () => moment(rule.updated_datetime).format('YYYY-MM-DD'),
        [rule]
    )

    const toggleId = useMemo(() => `toggle-data-${rule.id}`, [rule])
    const link = useMemo(() => `/app/settings/rules/${rule.id}`, [rule])

    return (
        <>
            <tr
                id={rule.id.toString()}
                key={rule.id}
                data-id={rule.id} // dragging info
                className={classnames('draggable', css.row)}
                onMouseEnter={() => setDescriptionOpen(true)}
                onMouseLeave={() => setDescriptionOpen(false)}
            >
                <td
                    className="smallest align-middle"
                    onClick={(e) => e.stopPropagation()}
                >
                    <i
                        className={classnames(
                            'material-icons text-faded drag-handle',
                            css.dragHandle
                        )}
                    >
                        drag_indicator
                    </i>
                </td>

                <td className="smallest align-middle position-relative">
                    <ToggleInput
                        isToggled={!rule.deactivated_datetime}
                        onClick={toggleActivation}
                    />
                    <div className={css.toggleActivation} id={toggleId} />
                </td>

                <td
                    className={classnames(
                        'link-full-td',
                        'align-middle',
                        css['middle-column']
                    )}
                    id={`rule-name-${rule.id}`}
                >
                    <Link to={link}>
                        <div>
                            <span className={classnames('mr-2', css.name)}>
                                {rule.name}
                            </span>
                            {rule.type === 'system' && (
                                <Badge className="ml-2" type={ColorType.Error}>
                                    <i className="material-icons mr-2">
                                        warning
                                    </i>
                                    SYSTEM
                                </Badge>
                            )}
                            {isFromLibrary && (
                                <Badge
                                    className={classnames(
                                        'ml-2',
                                        css.fromLibraryBadge
                                    )}
                                    type={ColorType.Light}
                                >
                                    <i className="material-icons mr-1">
                                        auto_fix_high
                                    </i>
                                    Rule Library
                                </Badge>
                            )}
                            {rule.type === 'managed' && (
                                <Badge
                                    className={classnames(
                                        'ml-2',
                                        css.fromLibraryBadge
                                    )}
                                    type={ColorType.Grey}
                                >
                                    <i className="material-icons mr-1">
                                        auto_awesome
                                    </i>
                                    Managed Rule
                                </Badge>
                            )}
                        </div>
                    </Link>
                </td>
                <td className={classnames('link-full-td align-middle')}>
                    <Link to={link}>
                        <div className={'text-faded'}>
                            {formattedUpdatedDate}
                        </div>
                    </Link>
                </td>
                <td
                    className={classnames('align-middle smallest', css.actions)}
                >
                    <IconButton
                        className={classnames(css.actionButton, 'mr-1')}
                        intent="text"
                        onClick={(e) => {
                            e.stopPropagation()
                            void handleDuplicate()
                        }}
                        title="Duplicate rule"
                        isDisabled={rule.type === RuleType.Managed}
                    >
                        file_copy
                    </IconButton>
                    <IconButton
                        className={classnames(
                            css.actionButton,
                            css.deleteActionButton,
                            'mr-1'
                        )}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleShowDeleteConfirmation()
                        }}
                        intent="text"
                        isLoading={isDeleting}
                        title="Delete rule"
                        id={`delete-rule-${rule.id}`}
                    >
                        delete
                    </IconButton>
                </td>
                {rule.description ? (
                    <Popover
                        placement="top"
                        isOpen={isDescriptionOpen}
                        target={`rule-name-${rule.id}`}
                        trigger="legacy"
                        className={css.descriptionPopover}
                    >
                        <PopoverBody>
                            <div className={css.descriptionWrapper}>
                                <div className={css.popoverBody}>
                                    {rule.description}
                                </div>
                            </div>
                        </PopoverBody>
                    </Popover>
                ) : null}
            </tr>
            <Popover
                isOpen={showDeleteConfirmation}
                placement="left"
                target={`delete-rule-${rule.id}`}
                toggle={toggleShowDeleteConfirmation}
                trigger="legacy"
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>
                        You are about to delete <b>{rule.name || 'this'}</b>{' '}
                        rule.
                    </p>
                    <Button intent="destructive" onClick={handleDelete}>
                        Confirm
                    </Button>
                </PopoverBody>
            </Popover>
            <Popover
                position="bottom"
                isOpen={showToggleConfirmation}
                target={toggleId}
                toggle={toggleShowToggleConfirmation}
                trigger="legacy"
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>You are about to deactivate {rule.name} rule.</p>

                    <Button intent="destructive" onClick={handleDeactivate}>
                        Confirm
                    </Button>
                </PopoverBody>
            </Popover>
        </>
    )
}
export default RuleRow
