import {
    ForwardedRef,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'

import { useAsyncFn } from '@repo/hooks'
import { history } from '@repo/routing'
import classnames from 'classnames'
import esprima from 'esprima'
import { List, Map } from 'immutable'
import _getIn from 'lodash/get'
import moment from 'moment'
import { FormGroup, Label } from 'reactstrap'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { fromAST } from 'common/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { createRule } from 'models/rule/resources'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { ErrorsContext } from 'pages/common/components/ast/Errors'
import { updateCodeAst } from 'pages/common/components/ast/utils'
import TextInput from 'pages/common/forms/input/TextInput'
import { ruleCreated } from 'state/entities/rules/actions'
import { getRulesLimitStatus } from 'state/entities/rules/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { eventTypes as getEventTypes } from 'state/rules/helpers'
import {
    Rule,
    RuleDraft,
    RuleLimitStatus,
    RuleOperation,
} from 'state/rules/types'
import { getEmptyRule } from 'state/rules/utils'
import { getSchemas } from 'state/schemas/selectors'

import RuleEditor from '../../../components/RuleEditor'
import RuleItemButtons from '../../../components/RuleItemButtons'
import { CodeASTType } from '../../../types'
import { EditorHandle, RuleEditorProps } from '../RuleFormEditor'
import { getRuleActions } from './utils'

import css from './DefaultRuleEditor.less'
import commonCss from './RuleEditor.less'

const DefaultRuleEditor = (
    {
        rule,
        handleSubmit,
        handleDelete,
        handleDirtyForm,
        isSubmitting,
        isDeleting,
    }: RuleEditorProps,
    ref: ForwardedRef<EditorHandle>,
) => {
    const { errors } = useContext(ErrorsContext)
    const [ruleDraft, setRuleDraft] = useState<RuleDraft>(getEmptyRule())
    const eventTypes = useMemo(() => getEventTypes(ruleDraft), [ruleDraft])
    const dispatch = useAppDispatch()
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const schemas = useAppSelector(getSchemas)
    const hasAgentPrivileges = useHasAgentPrivileges()

    const hasMissingFields = !!(errors.size || !ruleDraft.name)

    const canSubmit = useMemo(
        () =>
            hasAgentPrivileges &&
            !hasMissingFields &&
            !!eventTypes.length &&
            !isSubmitting,
        [hasAgentPrivileges, hasMissingFields, eventTypes, isSubmitting],
    )

    const canDuplicate = useMemo(
        () => canSubmit && limitStatus !== RuleLimitStatus.Reached,
        [canSubmit, limitStatus],
    )

    const [{ loading: isDuplicatePending }, handleRuleDuplicate] =
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
                    }),
                )
                history.push(`/app/settings/rules/${newRule.id}`)
            } catch {
                void notify({
                    message: `Failed to duplicate rule.`,
                    status: NotificationStatus.Error,
                })
            }
        }, [rule, ruleDraft, eventTypes, canDuplicate])

    useEffect(() => {
        if (rule) {
            const { name, description, code, event_types } = rule
            handleDirtyForm(
                ruleDraft.event_types !== event_types ||
                    ruleDraft.name !== name ||
                    ruleDraft.description !== description ||
                    ruleDraft.code !== code,
            )
        } else {
            const emptyRule = getEmptyRule()
            handleDirtyForm(
                ruleDraft.name !== emptyRule.name ||
                    ruleDraft.code !== emptyRule.code ||
                    ruleDraft.description !== emptyRule.description ||
                    ruleDraft.event_types !== emptyRule.event_types,
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
        setRuleDraft({ ...ruleDraft, deactivated_datetime: null })
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
            history.push('/app/settings/rules')
        }
    }, [rule, limitStatus])

    useEffect(() => {
        if (rule) {
            setRuleDraft(ruleDraftFromRule(rule))
        }
    }, [rule])

    const modifyCodeAST = (
        path: List<any>,
        value: string | Record<string, unknown> | Map<any, any> | null,
        operation: RuleOperation,
        code_ast?: CodeASTType,
        schemaDefinitionKey?: string,
    ): esprima.Program => {
        const { code, ast } = updateCodeAst(
            schemas,
            code_ast ?? ruleDraft.code_ast,
            path,
            value,
            operation,
            schemaDefinitionKey,
        )
        setRuleDraft({ ...ruleDraft, code, code_ast: ast })
        return ast
    }

    const getCondition = (path: List<any>) =>
        fromAST(_getIn(ruleDraft, ['code_ast', ...path.toJS()])) as Map<
            any,
            any
        >

    const submit = useCallback(
        () => handleSubmit(ruleDraft, hasMissingFields),
        [handleSubmit, hasMissingFields, ruleDraft],
    )

    useImperativeHandle(ref, () => ({ submit }), [submit])

    const ruleActions = useMemo(() => getRuleActions(ruleDraft), [ruleDraft])

    return (
        <div id="rule-form" className={css.form}>
            {(ruleActions.includes('replyToTicket') ||
                ruleActions.includes('applyMacro')) && (
                <div className="mb-4">
                    <Alert type={AlertType.Info} icon>
                        <span>
                            {`The rule has a "reply to customer" or "apply macro"
                            action which will create billable tickets. To avoid
                            unwanted charges, make sure this rule is set up
                            correctly and will reply only to intended tickets.`}
                            <br />
                            <a
                                href="https://docs.gorgias.com/en-US/auto-reply-rule-best-practices-435621"
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
                        setRuleDraft({ ...ruleDraft, name })
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
                        setRuleDraft({ ...ruleDraft, description })
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
                actions={{ modifyCodeAST, getCondition }}
                handleEventChanges={(event_types: string) =>
                    setRuleDraft({ ...ruleDraft, event_types })
                }
            />
            <div className={commonCss.toggleButtonContainer}>
                <span>
                    <ToggleField
                        value={!ruleDraft.deactivated_datetime}
                        onChange={toggleActivation}
                        isDisabled={!hasAgentPrivileges}
                    />
                </span>
                <span>
                    <Label
                        className={classnames(
                            commonCss.toggleLabel,
                            'mr-2 mb-0',
                        )}
                    >
                        Enable rule
                    </Label>
                </span>
            </div>
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
