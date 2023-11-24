import React, {
    ForwardedRef,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'
import {useAsyncFn} from 'react-use'
import {FormGroup, Label} from 'reactstrap'
import moment from 'moment'
import {Map, List} from 'immutable'
import classnames from 'classnames'
import _getIn from 'lodash/get'
import esprima from 'esprima'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {fromAST} from 'common/utils'
import {createRule} from 'models/rule/resources'
import {getRulesLimitStatus} from 'state/entities/rules/selectors'
import {ruleCreated} from 'state/entities/rules/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    Rule,
    RuleDraft,
    RuleLimitStatus,
    RuleOperation,
} from 'state/rules/types'
import {eventTypes as getEventTypes} from 'state/rules/helpers'
import {getEmptyRule} from 'state/rules/utils'
import history from 'pages/history'

import {ErrorsContext} from 'pages/common/components/ast/Errors'
import {updateCodeAst} from 'pages/common/components/ast/utils'
import {getSchemas} from 'state/schemas/selectors'
import TextInput from 'pages/common/forms/input/TextInput'
import ToggleInput from 'pages/common/forms/ToggleInput'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import UploadingSensitiveInformationDisclaimer from 'pages/automate/common/components/UploadingSensitiveInformationDisclaimer'
import {ActionType} from 'models/rule/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {CodeASTType} from '../../../types'
import RuleItemButtons from '../../../components/RuleItemButtons'
import RuleEditor from '../../../components/RuleEditor'

import {RuleEditorProps, EditorHandle} from '../RuleFormEditor'

import css from './DefaultRuleEditor.less'
import commonCss from './RuleEditor.less'
import {getRuleActions} from './utils'

const actionsWithAttachments: ActionType[] = [
    'sendEmail',
    'replyToTicket',
    'addInternalNote',
]

const DefaultRuleEditor = (
    {
        rule,
        handleSubmit,
        handleDelete,
        handleDirtyForm,
        isSubmitting,
        isDeleting,
    }: RuleEditorProps,
    ref: ForwardedRef<EditorHandle>
) => {
    const {errors} = useContext(ErrorsContext)
    const {rulesUrl} = useIsAutomateRebranding()
    const [ruleDraft, setRuleDraft] = useState<RuleDraft>(getEmptyRule())
    const eventTypes = useMemo(() => getEventTypes(ruleDraft), [ruleDraft])
    const dispatch = useAppDispatch()
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const schemas = useAppSelector(getSchemas)
    const hasAgentPrivileges = useHasAgentPrivileges()
    const showAttachmentUploadDisclaimer =
        useFlags()[FeatureFlagKey.AutomateShowAttachmentUploadDisclaimer]

    const hasMissingFields = !!(errors.size || !ruleDraft.name)

    const canSubmit = useMemo(
        () =>
            hasAgentPrivileges &&
            !hasMissingFields &&
            !!eventTypes.length &&
            !isSubmitting,
        [hasAgentPrivileges, hasMissingFields, eventTypes, isSubmitting]
    )

    const canDuplicate = useMemo(
        () => canSubmit && limitStatus !== RuleLimitStatus.Reached,
        [canSubmit, limitStatus]
    )

    const [{loading: isDuplicatePending}, handleRuleDuplicate] =
        useAsyncFn(async () => {
            if (!rule || !canDuplicate || isDuplicatePending) {
                return
            }
            const newName =
                ruleDraft.name === rule.name
                    ? `(Copy) ${ruleDraft.name}`
                    : ruleDraft.name

            try {
                const newRule = await createRule({
                    ...ruleDraft,
                    name: newName,
                    deactivated_datetime: null,
                })
                void dispatch(ruleCreated(newRule))
                void dispatch(
                    notify({
                        message: `Successfully duplicated rule.`,
                        status: NotificationStatus.Success,
                    })
                )
                history.push(`${rulesUrl}/${newRule.id}`)
            } catch (error) {
                void notify({
                    message: `Failed to duplicate rule.`,
                    status: NotificationStatus.Error,
                })
            }
        }, [rule, ruleDraft, eventTypes, canDuplicate])

    useEffect(() => {
        if (rule) {
            const {name, description, code, event_types} = rule
            handleDirtyForm(
                ruleDraft.event_types !== event_types ||
                    ruleDraft.name !== name ||
                    ruleDraft.description !== description ||
                    ruleDraft.code !== code
            )
        } else {
            const emptyRule = getEmptyRule()
            handleDirtyForm(
                ruleDraft.name !== emptyRule.name ||
                    ruleDraft.code !== emptyRule.code ||
                    ruleDraft.description !== emptyRule.description ||
                    ruleDraft.event_types !== emptyRule.event_types
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rule, ruleDraft])

    const ruleDraftFromRule = (rule: Rule): RuleDraft => {
        const {
            code,
            code_ast,
            deactivated_datetime,
            description,
            event_types,
            name,
        } = rule

        return {
            code,
            code_ast,
            deactivated_datetime,
            description,
            event_types,
            name,
        } as RuleDraft
    }

    const handleActivate = () => {
        setRuleDraft({...ruleDraft, deactivated_datetime: null})
    }

    const handleDeactivate = () => {
        setRuleDraft({
            ...ruleDraft,
            deactivated_datetime: moment.utc().toISOString(),
        })
    }

    const toggleActivation = () => {
        if (ruleDraft.deactivated_datetime) {
            handleActivate()
        } else {
            handleDeactivate()
        }
    }

    useEffect(() => {
        if (limitStatus === RuleLimitStatus.Reached && !rule) {
            void notify({
                message: 'Cannot create a new rule: Rule limit reached',
                status: NotificationStatus.Warning,
            })
            history.push(rulesUrl)
        }
    }, [rule, limitStatus, rulesUrl])

    useEffect(() => {
        if (rule) {
            setRuleDraft(ruleDraftFromRule(rule))
        }
    }, [rule])

    const modifyCodeAST = (
        path: List<any>,
        value: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation,
        code_ast?: CodeASTType
    ): esprima.Program => {
        const {code, ast} = updateCodeAst(
            schemas,
            code_ast ?? ruleDraft.code_ast,
            path,
            value,
            operation
        )
        setRuleDraft({...ruleDraft, code, code_ast: ast})
        return ast
    }

    const getCondition = (path: List<any>) =>
        fromAST(_getIn(ruleDraft, ['code_ast', ...path.toJS()])) as Map<
            any,
            any
        >

    const submit = useCallback(
        () => handleSubmit(ruleDraft, hasMissingFields),
        [handleSubmit, hasMissingFields, ruleDraft]
    )

    useImperativeHandle(ref, () => ({submit}), [submit])

    const ruleActions = useMemo(() => getRuleActions(ruleDraft), [ruleDraft])
    const hasActionsWithAttachments = useMemo(
        () =>
            ruleActions.some((action) =>
                actionsWithAttachments.includes(action)
            ),
        [ruleActions]
    )

    return (
        <div id="rule-form" className={css.form}>
            {ruleActions.includes('replyToTicket') && (
                <div className="mb-4">
                    <Alert type={AlertType.Warning} icon>
                        <span>
                            The rule has a "reply to customer" action which will
                            create billable tickets. To avoid unwanted charges,
                            make sure this rule is set up correctly and will
                            reply only to intended tickets.
                            <br />
                            <a
                                href="https://docs.gorgias.com/en-US/rules---best-practices-81748#:~:text=messenger%20as%20well).-,Auto%2Dreply%20rules,-To%20further%20automate"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn about auto-reply rules best practices.
                            </a>
                        </span>
                    </Alert>
                </div>
            )}

            <FormGroup>
                <Label
                    for="ruleName"
                    className={classnames(css.label, css.labelName)}
                >
                    Rule name
                </Label>
                <TextInput
                    id="ruleName"
                    hasError={!ruleDraft.name}
                    onChange={(name: string) =>
                        setRuleDraft({...ruleDraft, name})
                    }
                    value={ruleDraft.name}
                />
            </FormGroup>
            <FormGroup>
                <Label for="ruleDescription" className={css.label}>
                    Rule description
                </Label>
                <TextInput
                    id="ruleDescription"
                    onChange={(description: string) =>
                        setRuleDraft({...ruleDraft, description})
                    }
                    value={ruleDraft.description}
                    type="textarea"
                />
            </FormGroup>
            <Label for="ruleContainer" className={css.label}>
                Rule conditions
            </Label>
            <RuleEditor
                ruleDraft={ruleDraft}
                actions={{modifyCodeAST, getCondition}}
                handleEventChanges={(event_types: string) =>
                    setRuleDraft({...ruleDraft, event_types})
                }
            />
            <div className={commonCss.toggleButtonContainer}>
                <span>
                    <ToggleInput
                        isToggled={!ruleDraft.deactivated_datetime}
                        onClick={toggleActivation}
                        isDisabled={!hasAgentPrivileges}
                    />
                </span>
                <span>
                    <Label
                        className={classnames(
                            commonCss.toggleLabel,
                            'mr-2 mb-0'
                        )}
                    >
                        Enable rule
                    </Label>
                </span>
            </div>

            {showAttachmentUploadDisclaimer && hasActionsWithAttachments && (
                <UploadingSensitiveInformationDisclaimer
                    className={commonCss.disclaimer}
                />
            )}

            <RuleItemButtons
                ruleId={rule ? rule.id : undefined}
                canSubmit={canSubmit && !isDuplicatePending}
                canDuplicate={canDuplicate && !isDuplicatePending}
                canDelete={hasAgentPrivileges}
                isDeleting={isDeleting}
                onDuplicate={handleRuleDuplicate}
                onDelete={handleDelete}
                onSubmit={submit}
            />
        </div>
    )
}

export default forwardRef<EditorHandle, RuleEditorProps>(DefaultRuleEditor)
