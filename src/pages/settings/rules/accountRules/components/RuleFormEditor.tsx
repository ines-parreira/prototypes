import classnames from 'classnames'
import React, {useCallback, useMemo, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Navbar, Nav} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {
    ManagedRule,
    ManagedRuleEmptySettings,
    Rule,
    RuleDraft,
    RuleType,
} from 'state/rules/types'
import settingsCss from 'pages/settings/settings.less'

import {ErrorsCollector} from 'pages/common/components/ast/Errors'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import PageHeader from 'pages/common/components/PageHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {
    ruleCreated,
    ruleDeleted,
    ruleUpdated,
} from 'state/entities/rules/actions'
import {notify} from 'state/notifications/actions'
import {createRule, deleteRule, updateRule} from 'models/rule/resources'
import history from 'pages/history'
import {NotificationStatus} from 'state/notifications/types'

import {ManagedRuleDisplayName} from 'state/rules/constants'

import TrackedRuleLibraryLink, {
    Source,
} from '../../components/TrackedRuleLibraryLink'
import AutoresponderViewButton from '../../components/AutoresponderViewButton'

import {RuleTicketList} from './RuleTicketList'
import ManagedRuleEditor from './ruleEditors/ManagedRuleEditor'
import DefaultRuleEditor from './ruleEditors/DefaultRuleEditor'

import css from './RuleFormEditor.less'

type Props = {
    rule?: Rule | ManagedRule
}

type NavbarProps = {
    activeTab: string
    handleTabChange: (tab: string) => void
}

export type EditorHandle = {
    submit: () => void
}

export type RuleEditorProps = {
    rule?: Rule
    handleSubmit: (rule: Partial<RuleDraft>, hasMissingFields?: boolean) => void
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

const RuleNavbar = ({activeTab, handleTabChange}: NavbarProps) => (
    <Navbar className={css.navbar}>
        <Nav
            key={'settings'}
            onClick={() => handleTabChange('settings')}
            className={classnames(css.item, {
                [css.active]: activeTab === 'settings',
            })}
        >
            Rule settings
        </Nav>
        <Nav
            key={'tickets'}
            onClick={() => handleTabChange('tickets')}
            className={classnames(css.item, {
                [css.active]: activeTab === 'tickets',
            })}
        >
            Affected tickets
        </Nav>
    </Navbar>
)

export const RuleFormEditor = ({rule}: Props) => {
    const editor = useRef<EditorHandle>(null)

    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = useState('settings')
    const hasAgentPrivileges = useHasAgentPrivileges()

    const [{loading: isSubmitting}, handleSubmit] = useAsyncFn(
        async (ruleDraft: Partial<RuleDraft>, hasMissingFields = false) => {
            if (hasMissingFields) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Complete required fields in order to save',
                    })
                )
                return
            }

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
        [rule]
    )
    const [isFormDirty, setIsFormDirty] = useState(false)

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

    const title = useMemo(() => {
        if (!rule) {
            return 'Add rule'
        }
        if (rule.type === RuleType.Managed) {
            const slug = (rule as ManagedRule).settings.slug
            const ruleDisplayName = ManagedRuleDisplayName.get(slug)
            if (ruleDisplayName) return ruleDisplayName
        }
        return rule.name
    }, [rule])

    const Editor = useCallback(
        (props: RuleEditorProps | ManagedRuleEditorProps) => {
            if (!rule || !(rule.type === RuleType.Managed)) {
                return (
                    <ErrorsCollector>
                        <DefaultRuleEditor
                            ref={editor}
                            {...(props as RuleEditorProps)}
                        />
                    </ErrorsCollector>
                )
            }
            return (
                <ManagedRuleEditor
                    ref={editor}
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
            <UnsavedChangesPrompt
                onSave={() => editor.current?.submit()}
                when={
                    hasAgentPrivileges &&
                    isFormDirty &&
                    !isSubmitting &&
                    !isDeleting
                }
            />
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/rules">Rules</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>{title}</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                {rule?.type === RuleType.Managed && (
                    <AutoresponderViewButton
                        recipeSlug={(rule as ManagedRule).settings.slug}
                    />
                )}
            </PageHeader>
            {rule && (
                <RuleNavbar
                    activeTab={activeTab}
                    handleTabChange={setActiveTab}
                />
            )}

            {activeTab === 'settings' || !rule ? (
                <div className={settingsCss.pageContainer}>
                    <div className={css.container}>
                        <Editor
                            rule={rule}
                            isSubmitting={isSubmitting}
                            isDeleting={isDeleting}
                            handleSubmit={handleSubmit}
                            handleDelete={handleDelete}
                            handleDirtyForm={setIsFormDirty}
                        />
                        {!rule && (
                            <div className={css.cardContainer}>
                                <div className={css.card}>
                                    <p
                                        className={classnames(
                                            css.cardTitle,
                                            'mb-1'
                                        )}
                                    >
                                        Need some inspiration?
                                    </p>
                                    <p>
                                        Start with a pre-made rule template and
                                        adapt it to fit your needs.
                                    </p>
                                    <TrackedRuleLibraryLink
                                        from={Source.BrowseTemplatesCard}
                                    >
                                        <Button className={css.cardButton}>
                                            Browse Templates
                                        </Button>
                                    </TrackedRuleLibraryLink>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <RuleTicketList ruleId={rule.id} />
            )}
        </>
    )
}
