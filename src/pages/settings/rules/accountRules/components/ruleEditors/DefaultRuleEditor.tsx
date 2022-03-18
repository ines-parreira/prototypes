import React, {useMemo, useState, useEffect} from 'react'
import {useAsyncFn} from 'react-use'
import {FormGroup, Label} from 'reactstrap'
import moment from 'moment'
import {Map, fromJS, List} from 'immutable'
import classnames from 'classnames'
import _getIn from 'lodash/get'
import esprima from 'esprima'

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

import {updateCodeAst} from 'pages/common/components/ast/utils.js'
import {getSchemas} from 'state/schemas/selectors'
import InputField from 'pages/common/forms/InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {CodeASTType} from '../../../types'
import RuleItemButtons from '../../../components/RuleItemButtons'
import RuleEditor from '../../../components/RuleEditor'

import {RuleEditorProps} from '../RuleFormEditor'

import css from './DefaultRuleEditor.less'
import commonCss from './RuleEditor.less'

export function DefaultRuleEditor({
    rule,
    handleSubmit,
    handleDelete,
    handleDirtyForm,
    isSubmitting,
    isDeleting,
}: RuleEditorProps) {
    const [ruleDraft, setRuleDraft] = useState<RuleDraft>(getEmptyRule())
    const eventTypes = useMemo(() => getEventTypes(ruleDraft), [ruleDraft])
    const dispatch = useAppDispatch()
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const schemas = useAppSelector(getSchemas)

    const [{loading: isDuplicatePending}, handleRuleDuplicate] =
        useAsyncFn(async () => {
            if (!rule || !canDuplicate) {
                return
            }
            const newName =
                ruleDraft.name === rule.name
                    ? `${ruleDraft.name} - copy`
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
                history.push(`/app/settings/rules/${newRule.id}`)
            } catch (error) {
                void notify({
                    message: `Failed to duplicate rule.`,
                    status: NotificationStatus.Error,
                })
            }
        }, [rule, ruleDraft, eventTypes])

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

    const canSubmit = useMemo(
        () =>
            !!eventTypes.length &&
            !!ruleDraft.name &&
            !isSubmitting &&
            !isDuplicatePending,
        [eventTypes, ruleDraft, isSubmitting, isDuplicatePending]
    )

    const canDuplicate = useMemo(
        () => canSubmit && limitStatus !== RuleLimitStatus.Reached,
        [canSubmit, limitStatus]
    )

    useEffect(() => {
        if (limitStatus === RuleLimitStatus.Reached && !rule) {
            void notify({
                message: 'Cannot create a new rule: Rule limit reached',
                status: NotificationStatus.Warning,
            })
            history.push('/app/settings/rules/')
        }
    }, [rule, limitStatus])

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
    ): ReturnType<typeof esprima.parse> => {
        const {code, ast} = updateCodeAst(
            schemas,
            code_ast ?? ruleDraft.code_ast,
            path,
            value,
            operation
        )
        setRuleDraft({...ruleDraft, code, code_ast: ast})
        return ast as CodeASTType
    }

    const getCondition = (path: List<any>) =>
        fromJS(_getIn(ruleDraft, ['code_ast', ...path.toJS()])) as Map<any, any>

    return (
        <div id="rule-form">
            <FormGroup>
                <Label
                    for="ruleName"
                    className={classnames(css.label, css.labelName)}
                >
                    Rule name
                </Label>
                <InputField
                    id="ruleName"
                    invalid={!ruleDraft.name}
                    onChange={(name: string) =>
                        setRuleDraft({...ruleDraft, name})
                    }
                    value={ruleDraft.name}
                />
                <Label for="ruleDescription" className={css.label}>
                    Rule description
                </Label>
                <InputField
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
                    />
                </span>
                <span>
                    <Label
                        className={classnames(commonCss.toggleLabel, 'mr-2')}
                    >
                        Enable rule
                    </Label>
                </span>
            </div>

            <RuleItemButtons
                ruleId={rule ? rule.id : undefined}
                canSubmit={canSubmit}
                canDuplicate={canDuplicate}
                isDeleting={isDeleting}
                onDuplicate={handleRuleDuplicate}
                onDelete={handleDelete}
                onSubmit={() => handleSubmit(ruleDraft)}
            />
        </div>
    )
}

export default DefaultRuleEditor
