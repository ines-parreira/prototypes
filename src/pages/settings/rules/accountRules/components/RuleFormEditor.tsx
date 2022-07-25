import classnames from 'classnames'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {
    ManagedRule,
    ManagedRuleEmptySettings,
    Rule,
    RuleDraft,
    RuleType,
} from 'state/rules/types'
import settingsCss from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    ruleCreated,
    ruleDeleted,
    ruleUpdated,
} from 'state/entities/rules/actions'
import {notify} from 'state/notifications/actions'
import {createRule, deleteRule, updateRule} from 'models/rule/resources'
import history from 'pages/history'
import {NotificationStatus} from 'state/notifications/types'

import useAppSelector from 'hooks/useAppSelector'
import {ruleRecipes as getRuleRecipes} from 'state/entities/ruleRecipes/selectors'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {ruleRecipesFetched} from 'state/entities/ruleRecipes/actions'
import {RuleTicketList} from './RuleTicketList'
import ManagedRuleEditor from './ruleEditors/ManagedRuleEditor'
import DefaultRuleEditor from './ruleEditors/DefaultRuleEditor'

import css from './ruleEditors/DefaultRuleEditor.less'

type Props = {
    rule?: Rule | ManagedRule
}

export type RuleEditorProps = {
    rule?: Rule
    handleSubmit: (rule: Partial<RuleDraft>) => void
    handleDelete: () => void
    handleDirtyForm: (isFormDirty: boolean) => void
    isSubmitting: boolean
    isDeleting: boolean
}

export type ManagedRuleEditorProps<T = ManagedRuleEmptySettings> =
    RuleEditorProps & {
        rule: ManagedRule<T>
        handleSubmit: (rule: Partial<ManagedRule<T>>) => void
    }

export const RuleFormEditor = ({rule}: Props) => {
    const dispatch = useAppDispatch()
    const ruleRecipes = useAppSelector(getRuleRecipes)

    const [{loading: isSubmitting}, handleSubmit] = useAsyncFn(
        async (ruleDraft: Partial<RuleDraft>) => {
            let newRule
            if (rule) {
                try {
                    newRule = await updateRule({
                        id: rule.id,
                        ...ruleDraft,
                    })
                    dispatch(ruleUpdated(newRule))
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Successfully updated rule',
                        })
                    )
                    history.push('/app/settings/rules')
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Failed to update rule',
                        })
                    )
                }
            } else {
                try {
                    newRule = await createRule(ruleDraft as RuleDraft)
                    dispatch(ruleCreated(newRule))
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Successfully created rule',
                        })
                    )
                    history.push('/app/settings/rules')
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Failed to create rule',
                        })
                    )
                }
            }
        },
        []
    )
    const [isFormDirty, setIsFormDirty] = useState(false)

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

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        if (!rule) {
            return
        }
        try {
            await deleteRule(rule.id)
            history.push('/app/settings/rules')
            dispatch(ruleDeleted(rule.id))
            void dispatch(
                notify({
                    message: 'Successfully deleted rule',
                    status: NotificationStatus.Success,
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
    }, [rule])

    const findRecipe = async (slug: string) => {
        const recipes = (await fetchRuleRecipes()).data
        const recipe = recipes.find((recipe) => recipe.slug === slug)
        if (recipe) {
            dispatch(ruleRecipesFetched(recipes))
        }
    }

    const title = useMemo(() => {
        if (!rule) {
            return 'Add rule'
        } else if (rule.type === RuleType.Managed) {
            const slug = (rule as ManagedRule).settings.slug
            if (!ruleRecipes[slug]) {
                void findRecipe(slug)
            } else {
                return `[${ruleRecipes[slug].recipe_tag}] ${ruleRecipes[slug].rule.name}`
            }
        }
        return rule.name
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rule, ruleRecipes])

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

    const Editor = useCallback(
        (props: RuleEditorProps | ManagedRuleEditorProps) => {
            if (!rule || !(rule.type === RuleType.Managed)) {
                return <DefaultRuleEditor {...(props as RuleEditorProps)} />
            }
            return (
                <ManagedRuleEditor
                    slug={(rule as ManagedRule).settings.slug}
                    {...(props as ManagedRuleEditorProps)}
                />
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <>
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/rules">Rules</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>{title}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container
                fluid
                className={classnames(css.container, settingsCss.pageContainer)}
            >
                <Editor
                    rule={rule}
                    isSubmitting={isSubmitting}
                    isDeleting={isDeleting}
                    handleSubmit={handleSubmit}
                    handleDelete={handleDelete}
                    handleDirtyForm={setIsFormDirty}
                />
                {!!rule && <RuleTicketList ruleId={rule.id} />}
            </Container>
        </>
    )
}
