import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import {getHasAutomate} from 'state/billing/selectors'

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
import {formatDatetime} from 'utils'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useAsyncFn from 'hooks/useAsyncFn'
import {DateAndTimeFormatting} from 'constants/datetime'

import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import Tooltip from 'pages/common/components/Tooltip'
import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import css from './RuleRow.less'
import {getRuleActions} from './ruleEditors/utils'

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
    const hasAutomate = useAppSelector(getHasAutomate)
    const ruleRecipes = useAppSelector(getSortedRuleRecipes)
    const helpCenters = useAppSelector(getActiveHelpCenterList)
    const hasAgentPrivileges = useHasAgentPrivileges()
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    const [isDescriptionOpen, setDescriptionOpen] = useState(false)
    const {rulesUrl} = useIsAutomateRebranding()
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
                    name: `(Copy) ${rule.name}`,
                    description: rule.description,
                    event_types: rule.event_types,
                    code: rule.code,
                    code_ast: rule.code_ast,
                    deactivated_datetime: null,
                })
                void dispatch(ruleCreated(newRule))
                history.push(`${rulesUrl}/${newRule.id}`)
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
        if (!hasAutomate && rule.type === RuleType.Managed) {
            handleUpgrade(rule.id)
            return
        }
        void onActivate(rule.id)
    }, [hasAutomate, rule, onActivate, handleUpgrade])

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
        () => formatDatetime(rule.updated_datetime, datetimeFormat),
        [rule, datetimeFormat]
    )

    const link = useMemo(() => `${rulesUrl}/${rule.id}`, [rule, rulesUrl])

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

    const ruleActions = useMemo(() => getRuleActions(rule), [rule])

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
                                isDisabled={!hasAgentPrivileges}
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
                <>
                    <Link to={link}>
                        <div className={css.middleColumnContent}>
                            <span className={css.name}>{ruleName}</span>
                            {error && (
                                <span className={classnames('ml-2', css.error)}>
                                    <span className="material-icons mr-1">
                                        error_outline
                                    </span>
                                    {error}
                                </span>
                            )}
                            {ruleActions.includes('replyToTicket') && (
                                <div>
                                    <i
                                        className={classnames(
                                            'material-icons',
                                            css.warningIcon
                                        )}
                                        id={`copy-icon-${rule.id}`}
                                        onMouseEnter={() =>
                                            setDescriptionOpen(false)
                                        }
                                    >
                                        error
                                    </i>
                                    <Tooltip
                                        placement="top"
                                        target={`copy-icon-${rule.id}`}
                                        delay={{
                                            show: 0,
                                            hide: 500,
                                        }}
                                        autohide={false}
                                        onMouseEnter={() =>
                                            setDescriptionOpen(false)
                                        }
                                    >
                                        The rule has a “reply to customer”
                                        action which will create billable
                                        tickets. To avoid extra charges, make
                                        sure this rule is set up to reply only
                                        to intended tickets.{' '}
                                        <a
                                            href="https://docs.gorgias.com/en-US/rules---best-practices-81748#:~:text=messenger%20as%20well).-,Auto%2Dreply%20rules,-To%20further%20automate"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Learn about auto-reply rules best
                                            practices.
                                        </a>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </Link>
                </>
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
                    isDisabled={
                        !hasAgentPrivileges || rule.type === RuleType.Managed
                    }
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
                            isDisabled={!hasAgentPrivileges}
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
