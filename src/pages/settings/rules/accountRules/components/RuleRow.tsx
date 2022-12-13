import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {useAsyncFn} from 'react-use'
import moment from 'moment'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {getHasAutomationAddOn} from 'state/billing/selectors'

import {deactivateRule, createRule, deleteRule} from 'models/rule/resources'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import ToggleInput from 'pages/common/forms/ToggleInput'
import history from 'pages/history'
import {ManagedRuleDisplayName} from 'state/rules/constants'
import {
    ruleCreated,
    ruleUpdated,
    ruleDeleted,
} from 'state/entities/rules/actions'
import {getSortedRuleRecipes} from 'state/entities/ruleRecipes/selectors'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {
    AnyManagedRuleSettings,
    AutoReplyFAQSettings,
    ManagedRule,
    ManagedRuleSettings,
    ManagedRulesSlugs,
    Rule,
    RuleType,
} from 'state/rules/types'

import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import css from './RuleRow.less'

type Props = {
    rule: Rule | ManagedRule<AnyManagedRuleSettings>
    canDuplicate: boolean
    handleUpgrade: (id: number) => void
    onActivate: (id: number) => Promise<void>
    shouldDisplayError?: boolean
    isSearching?: boolean
}

export function RuleRow({
    rule,
    canDuplicate,
    handleUpgrade,
    onActivate,
    isSearching = false,
    shouldDisplayError = false,
}: Props) {
    const dispatch = useAppDispatch()
    const [error, setError] = useState<string>()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const ruleRecipes = useAppSelector(getSortedRuleRecipes)
    const helpCenters = useAppSelector(getActiveHelpCenterList)

    const [isDescriptionOpen, setDescriptionOpen] = useState(false)

    useEffect(() => {
        if (rule.type === RuleType.Managed && shouldDisplayError) {
            const settings = (rule as ManagedRule).settings
            if (settings.slug === ManagedRulesSlugs.AutoReplyFAQ) {
                const helpCenterId = (
                    settings as ManagedRuleSettings<AutoReplyFAQSettings>
                ).help_center_id
                if (
                    !helpCenters.find(
                        (helpCenter) => helpCenter.id === helpCenterId
                    )
                ) {
                    setError('No help center selected')
                } else {
                    setError('')
                }
            }
        }
    }, [rule, helpCenters, shouldDisplayError])

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
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to duplicate rule',
                    })
                )
            }
        } else {
            void dispatch(
                notify({
                    message:
                        'You have reached the 70 rule limit. Delete existing rules to add more.',
                    status: NotificationStatus.Error,
                })
            )
        }
    }

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        try {
            await deleteRule(rule.id)
            void dispatch(ruleDeleted(rule.id))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Successfully deleted rule ${rule.name}`,
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to delete rule',
                })
            )
        }
    })

    const handleActivate = useCallback(() => {
        if (!hasAutomationAddOn && rule.type === RuleType.Managed) {
            handleUpgrade(rule.id)
            return
        }
        void onActivate(rule.id)
    }, [hasAutomationAddOn, rule, onActivate, handleUpgrade])

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
    }

    const formattedUpdatedDate = useMemo(
        () => moment(rule.updated_datetime).format('YYYY-MM-DD'),
        [rule]
    )

    const link = useMemo(() => `/app/settings/rules/${rule.id}`, [rule])

    const handleToggleClick = useCallback(
        (onDisplayConfirmation: (event: MouseEvent) => void) =>
            (value: boolean, event: MouseEvent) => {
                event.stopPropagation()
                const checked = !!rule.deactivated_datetime

                if (checked) {
                    void handleActivate()
                } else {
                    onDisplayConfirmation(event)
                }
            },
        [handleActivate, rule]
    )

    const [ruleName, ruleDescription] = useMemo(() => {
        if (rule.type === RuleType.Managed) {
            const recipe = ruleRecipes.find(
                (recipe) => recipe.slug === (rule as ManagedRule).settings.slug
            )
            return recipe
                ? [
                      ManagedRuleDisplayName.get(
                          recipe.slug as ManagedRulesSlugs
                      ),
                      recipe.rule.description,
                  ]
                : [rule.name, rule.description]
        }
        return [rule.name, rule.description]
    }, [rule, ruleRecipes])

    return (
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
                        css.dragHandle,
                        {invisible: isSearching}
                    )}
                >
                    drag_indicator
                </i>
            </td>

            <td className="smallest align-middle position-relative">
                <ConfirmationPopover
                    buttonProps={{
                        intent: 'destructive',
                    }}
                    content={`You are about to deactivate ${rule.name} rule.`}
                    id={`toggle-data-${rule.id}`}
                    onConfirm={handleDeactivate}
                    placement="right"
                >
                    {({uid, onDisplayConfirmation}) => (
                        <>
                            <ToggleInput
                                isToggled={!rule.deactivated_datetime}
                                onClick={handleToggleClick(
                                    onDisplayConfirmation
                                )}
                            />
                            <div id={uid} className={css.toggleActivation} />
                        </>
                    )}
                </ConfirmationPopover>
            </td>

            <td
                className={classnames(
                    'link-full-td',
                    'align-middle',
                    css.middleColumn
                )}
                id={`rule-name-${rule.id}`}
            >
                <Link to={link}>
                    <div className={css.middleColumnContent}>
                        <span className={classnames('mr-3', css.name)}>
                            {ruleName}
                        </span>
                        {error && (
                            <span className={classnames('ml-2', css.error)}>
                                <span className="material-icons mr-1">
                                    error_outline
                                </span>
                                {error}
                            </span>
                        )}
                    </div>
                </Link>
            </td>
            <td
                className={classnames(
                    'link-full-td align-middle smallest pr-4'
                )}
            >
                <Link to={link}>
                    <div className={'text-faded'}>{formattedUpdatedDate}</div>
                </Link>
            </td>
            <td className={classnames('align-middle smallest', css.actions)}>
                <IconButton
                    className={classnames(css.actionButton, 'mr-1')}
                    fillStyle="ghost"
                    intent="secondary"
                    isDisabled={rule.type === RuleType.Managed}
                    onClick={(e) => {
                        e.stopPropagation()
                        void handleDuplicate()
                    }}
                    title="Duplicate rule"
                >
                    file_copy
                </IconButton>
                <ConfirmationPopover
                    buttonProps={{
                        intent: 'destructive',
                    }}
                    id={`delete-rule-${rule.id}`}
                    content={
                        <>
                            You are about to delete <b>{rule.name || 'this'}</b>{' '}
                            rule.
                        </>
                    }
                    onConfirm={handleDelete}
                >
                    {({uid, onDisplayConfirmation}) => (
                        <IconButton
                            className={classnames(css.actionButton, 'mr-1')}
                            onClick={onDisplayConfirmation}
                            fillStyle="ghost"
                            intent="destructive"
                            isLoading={isDeleting}
                            title="Delete rule"
                            id={uid}
                        >
                            delete
                        </IconButton>
                    )}
                </ConfirmationPopover>
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
                                {ruleDescription}
                            </div>
                        </div>
                    </PopoverBody>
                </Popover>
            ) : null}
        </tr>
    )
}
export default RuleRow
