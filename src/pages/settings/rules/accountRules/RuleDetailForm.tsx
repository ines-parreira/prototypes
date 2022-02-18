import React, {useMemo, useState, useEffect, useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    FormGroup,
    Label,
} from 'reactstrap'
import moment from 'moment'
import {Map, fromJS, List} from 'immutable'
import classnames from 'classnames'
import _getIn from 'lodash/get'
import esprima from 'esprima'

import {
    createRule,
    deleteRule,
    fetchRules,
    updateRule,
} from '../../../../models/rule/resources'
import {getRulesLimitStatus} from '../../../../state/entities/rules/selectors'
import {
    ruleFetched,
    rulesFetched,
    ruleCreated,
    ruleDeleted,
    ruleUpdated,
} from '../../../../state/entities/rules/actions'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    Rule,
    RuleDraft,
    RuleLimitStatus,
    RuleOperation,
} from '../../../../state/rules/types'
import {eventTypes as getEventTypes} from '../../../../state/rules/helpers'
import {getEmptyRule} from '../../../../state/rules/utils'
import history from '../../../history'

import ToggleInput from '../../../common/forms/ToggleInput'
import PageHeader from '../../../common/components/PageHeader'
import {RootState} from '../../../../state/types'
import {updateCodeAst} from '../../../common/components/ast/utils.js'
import {getSchemas} from '../../../../state/schemas/selectors'
import Loader from '../../../common/components/Loader/Loader'
import InputField from '../../../common/forms/InputField'
import settingsCss from '../../settings.less'

import {CodeASTType} from '../types'
import RuleItemButtons from '../components/RuleItemButtons'
import RuleEditor from '../components/RuleEditor'

import {RuleTicketList} from './components/RuleTicketList'

import css from './RuleDetailForm.less'

export function RuleDetailForm({
    rules,
    ruleCreated,
    ruleDeleted,
    rulesFetched,
    ruleUpdated,
    limitStatus,
    schemas,
    match: {
        params: {ruleId},
    },
    notify,
}: RouteComponentProps<{ruleId?: string}> & ConnectedProps<typeof connector>) {
    const [ruleDraft, setRuleDraft] = useState<RuleDraft>(getEmptyRule())
    const eventTypes = useMemo(() => getEventTypes(ruleDraft), [ruleDraft])
    const [title, setTitle] = useState('')

    const [{loading: isFetchPending}, handleFetchRules] = useAsyncFn(
        async () => {
            try {
                const res = await fetchRules()
                rulesFetched(res.data)
            } catch (error) {
                void notify({
                    message: 'Failed to fetch rules',
                    status: NotificationStatus.Error,
                })
                history.push('/app/settings/rules')
            }
        },
        [],
        {loading: true}
    )

    useEffect(() => {
        if (ruleId && !isFetchPending) {
            if (Object.keys(rules).findIndex((obj) => obj === ruleId) === -1) {
                void notify({
                    message: `Could not find rule with id: ${ruleId}`,
                    status: NotificationStatus.Error,
                })
                history.push('/app/settings/rules')
            }
        }
    }, [ruleId, isFetchPending])

    const [{loading: isSubmitting}, handleSubmit] = useAsyncFn(async () => {
        if (canSubmit) {
            let newRule
            if (ruleId) {
                try {
                    newRule = await updateRule({
                        ...rules[ruleId],
                        ...ruleDraft,
                    })
                    ruleUpdated(newRule)
                    void notify({
                        status: NotificationStatus.Success,
                        message: 'Successfully updated rule',
                    })
                    history.push('/app/settings/rules')
                } catch (error) {
                    void notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to update rule',
                    })
                }
            } else {
                try {
                    newRule = await createRule(ruleDraft)
                    void notify({
                        status: NotificationStatus.Success,
                        message: 'Successfully created rule',
                    })
                    history.push('/app/settings/rules')
                } catch (error) {
                    void notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to create rule',
                    })
                }
            }
        }
    }, [ruleDraft, eventTypes])

    const [{loading: isDuplicatePending}, handleRuleDuplicate] =
        useAsyncFn(async () => {
            if (!ruleId || !canDuplicate) {
                return
            }
            const newName =
                ruleDraft.name === rules[ruleId].name
                    ? `${ruleDraft.name} - copy`
                    : ruleDraft.name

            try {
                const newRule = await createRule({
                    ...ruleDraft,
                    name: newName,
                    deactivated_datetime: null,
                })
                ruleCreated(newRule)
                void notify({
                    message: `Successfully duplicated rule.`,
                    status: NotificationStatus.Success,
                })
                history.push(`/app/settings/rules/${newRule.id}`)
            } catch (error) {
                void notify({
                    message: `Failed to duplicate rule.`,
                    status: NotificationStatus.Error,
                })
            }
        }, [ruleId, ruleDraft, eventTypes])

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        if (!ruleId) {
            return
        }
        try {
            await deleteRule(parseInt(ruleId))
            ruleDeleted(parseInt(ruleId))
            void notify({
                message: 'Successfully deleted rule',
                status: NotificationStatus.Success,
            })
            history.push('/app/settings/rules')
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: 'Failed to delete rule',
            })
        }
    }, [ruleId, ruleDraft, eventTypes])

    const isFormDirty = useMemo(() => {
        if (ruleId && rules[ruleId]) {
            const {name, description, code, event_types} = rules[ruleId]
            return (
                ruleDraft.event_types !== event_types ||
                ruleDraft.name !== name ||
                ruleDraft.description !== description ||
                ruleDraft.code !== code
            )
        }
        const emptyRule = getEmptyRule()
        return (
            ruleDraft.name !== emptyRule.name ||
            ruleDraft.code !== emptyRule.code ||
            ruleDraft.description !== emptyRule.description ||
            ruleDraft.event_types !== emptyRule.event_types
        )
    }, [ruleId, ruleDraft, rules])

    const beforeLoad = useCallback(
        (e: BeforeUnloadEvent) => {
            if (isFormDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
            return
        },
        [isFormDirty]
    )

    useEffect(() => {
        const unblock = history.block((loc, action) => {
            if (isFormDirty && action !== 'POP') {
                return 'Any unsaved changes will be lost. Proceed anyway?'
            }
        })
        window.addEventListener('beforeunload', beforeLoad)

        if (isDeleting || isSubmitting) {
            unblock()
            window.removeEventListener('beforeunload', beforeLoad)
        }
        return () => {
            unblock()
            window.removeEventListener('beforeunload', beforeLoad)
        }
    }, [isFormDirty, isDeleting, beforeLoad, isSubmitting])

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
        if (limitStatus === RuleLimitStatus.Reached && !ruleId) {
            void notify({
                message: 'Cannot create a new rule: Rule limit reached',
                status: NotificationStatus.Warning,
            })
            history.push('/app/settings/rules/')
        }
    }, [ruleId, limitStatus])

    useEffect(() => {
        void handleFetchRules()
    }, [])

    useEffect(() => {
        if (ruleId && rules[ruleId]) {
            setRuleDraft(ruleDraftFromRule(rules[ruleId]))
            setTitle(rules[ruleId].name)
        }
    }, [ruleId, rules])

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
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/rules">Rules</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {ruleId ? title : 'Add rule'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container
                fluid
                className={classnames(css.container, settingsCss.pageContainer)}
            >
                {isFetchPending ? (
                    <Loader />
                ) : (
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
                        <div className={css.toggleButtonContainer}>
                            <span>
                                <ToggleInput
                                    isToggled={!ruleDraft.deactivated_datetime}
                                    onClick={toggleActivation}
                                />
                            </span>
                            <span>
                                <Label
                                    className={classnames(
                                        css.toggleLabel,
                                        'ml-2'
                                    )}
                                >
                                    {!ruleDraft.deactivated_datetime
                                        ? 'Disable rule'
                                        : 'Enable rule'}
                                </Label>
                            </span>
                        </div>

                        <RuleItemButtons
                            ruleId={ruleId ? parseInt(ruleId) : undefined}
                            canSubmit={canSubmit}
                            canDuplicate={canDuplicate}
                            isDeleting={isDeleting}
                            onDuplicate={handleRuleDuplicate}
                            onDelete={handleDelete}
                            onSubmit={handleSubmit}
                        />
                    </div>
                )}
                {ruleId && <RuleTicketList ruleId={parseInt(ruleId)} />}
            </Container>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        rules: state.entities.rules,
        limitStatus: getRulesLimitStatus(state),
        schemas: getSchemas(state),
    }),
    {
        ruleCreated,
        ruleDeleted,
        ruleFetched,
        rulesFetched,
        ruleUpdated,
        notify,
    }
)

export default withRouter(connector(RuleDetailForm))
