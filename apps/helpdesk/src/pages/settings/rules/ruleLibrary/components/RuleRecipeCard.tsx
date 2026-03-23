import React, { useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import _getIn from 'lodash/get'
import { Badge } from 'reactstrap'

import successIcon from 'assets/img/icons/success.svg'
import { fromAST } from 'common/utils'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { IntegrationType } from 'models/integration/constants'
import type { StoreIntegration } from 'models/integration/types'
import { createRule } from 'models/rule/resources'
import type { RuleDraft } from 'models/rule/types'
import type { RuleRecipe } from 'models/ruleRecipe/types'
import { createSection } from 'models/section/resources'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { createTag, fetchTags } from 'models/tag/resources'
import type { TagDraft } from 'models/tag/types'
import { createView, deleteView } from 'models/view/resources'
import type { View, ViewDraft } from 'models/view/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { ruleCreated } from 'state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from 'state/entities/rules/selectors'
import { sectionCreated } from 'state/entities/sections/actions'
import { getSectionIdByName } from 'state/entities/sections/selectors'
import { tagCreated } from 'state/entities/tags/actions'
import { viewCreated, viewDeleted } from 'state/entities/views/actions'
import { getTicketViews } from 'state/entities/views/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type {
    AnyManagedRuleSettings,
    ManagedRule,
    RuleOperation,
} from 'state/rules/types'
import { RuleLimitStatus, RuleType } from 'state/rules/types'
import { compare } from 'utils'

import type { CodeASTType } from '../../types'
import { RuleTemplateRecipeSlugs, tagColors } from '../constants'
import { AiAgentRequirements } from './installationModals/components/AiAgentRequirement'
import { RuleRecipeModal } from './RuleRecipeModal'

import css from './RuleRecipeCard.less'

type Props = {
    recipe: RuleRecipe
    isInstalled: boolean
    isModalOpenOnLoad?: boolean
    isReady: boolean
    autoInstall?: boolean
}

function RuleRecipeCard({
    recipe,
    isReady,
    isInstalled,
    isModalOpenOnLoad = false,
    autoInstall,
}: Props) {
    const dispatch = useAppDispatch()
    const existingViews = useAppSelector(getTicketViews)
    const existingSections = useAppSelector(getSectionIdByName)
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const rules = useAppSelector(getSortedRules)
    const hasAgentPrivileges = useHasAgentPrivileges()
    const [extraDefaultSettings, setExtraDefaultSettings] = useState<
        Partial<AnyManagedRuleSettings>
    >({})
    const [isModalOpen, setModalOpen] = useState(isModalOpenOnLoad)
    const { hasAccess } = useAiAgentAccess()
    const { rule, tags, recipe_tag, views_per_section } = recipe
    const isBehindPaywall = rule.type === RuleType.Managed && !hasAccess
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify),
    )
    const sortedShopifyIntegrations = useMemo(
        () => [...shopifyIntegrations].sort((a, b) => compare(a.name, b.name)),
        [shopifyIntegrations],
    )

    const firstShopifyIntegration = sortedShopifyIntegrations[0]

    // TODO: add link to the helpdesk when it will be ready
    const aiAgentLink =
        firstShopifyIntegration && hasAccess
            ? `/app/automation/shopify/${getShopNameFromStoreIntegration(
                  firstShopifyIntegration as StoreIntegration,
              )}/ai-agent`
            : undefined

    const handleCodeAst = (
        _path: List<any>,
        _value: Maybe<string | Record<string, unknown>>,
        _operation: RuleOperation,
        code_ast?: CodeASTType,
    ): CodeASTType => {
        return code_ast as CodeASTType
    }

    const getCondition = (path: List<any>) =>
        fromAST(_getIn(rule, ['code_ast', ...path.toJS()])) as Map<any, any>

    const handleRule = {
        modifyCodeAST: handleCodeAst,
        getCondition,
    }

    const handleModalToggle = () => setModalOpen(!isModalOpen)

    const handleCreateTag = async (tag: TagDraft) => {
        const existingTags = await fetchTags({ search: tag.name })

        // search returns a case agnostic result, so we have to check
        // for string equality
        if (
            !existingTags.data.data.some(
                (existingTag) => existingTag.name === tag.name,
            )
        ) {
            const newTag = await createTag(tag)
            dispatch(tagCreated(newTag))
        }
    }

    const segmentEventProps = {
        rule: rule.name,
        account_id: currentAccount.get('domain'),
    }

    useEffect(() => {
        if (isModalOpen) {
            logEvent(SegmentEvent.RuleLibraryItemShown, segmentEventProps)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen])

    const handleCreateOrFetchSection = async (sectionName: string) => {
        let sectionId = existingSections[sectionName]
        if (!sectionId) {
            const newSection = await createSection({
                name: sectionName,
                private: false,
            })
            dispatch(sectionCreated(newSection))
            sectionId = newSection.id
        }
        return sectionId
    }

    const createSectionedView = async (view: ViewDraft, sectionId: number) => {
        const newView = await createView({ ...view, section_id: sectionId })
        dispatch(viewCreated(newView))
        return newView
    }

    const createNonSectionedView = async (view: ViewDraft) => {
        const newView = await createView(view)
        dispatch(viewCreated(newView))
        return newView
    }

    const handleCreateViewsAndSections = async (
        sectionName: string,
        views: ViewDraft[],
    ) => {
        const promises: Promise<View>[] = []
        const viewsToCreate = (
            await Promise.all(
                views.map(async (view) => {
                    const existingView = existingViews.find(
                        (existingView) => existingView.name === view.name,
                    )
                    if (!existingView) {
                        return view
                    }
                    if (existingView.deactivated_datetime) {
                        await deleteView(existingView.id)
                        dispatch(viewDeleted(existingView.id))
                        return view
                    }
                }),
            )
        ).filter((view) => view) as ViewDraft[]
        if (sectionName === 'none') {
            viewsToCreate.forEach((view) => {
                promises.push(createNonSectionedView(view))
            })
        } else {
            const sectionId = await handleCreateOrFetchSection(sectionName)
            viewsToCreate.forEach((view) => {
                promises.push(createSectionedView(view, sectionId))
            })
        }
        return Promise.all(promises)
    }

    const handleInstall = async (
        shouldCreateViews: boolean,
        installFromSuggestion = false,
    ) => {
        void dispatch(
            notify({
                message: 'Installing rule',
                status: NotificationStatus.Loading,
                closeOnNext: true,
                dismissAfter: 0,
            }),
        )

        if (limitStatus === RuleLimitStatus.Reached) {
            void dispatch(
                notify({
                    message: 'Rule limit reached',
                    status: NotificationStatus.Error,
                }),
            )
            return
        }
        if (shouldCreateViews) {
            if (tags) {
                try {
                    for (let i = 0; i < tags.length; i++) {
                        await handleCreateTag(tags[i])
                    }
                } catch {
                    void dispatch(
                        notify({
                            message: 'Failed to create all rule tags',
                            status: NotificationStatus.Error,
                        }),
                    )
                }
            }
            if (views_per_section) {
                const promises = Object.keys(views_per_section).map((section) =>
                    handleCreateViewsAndSections(
                        section,
                        views_per_section[section],
                    ),
                )
                try {
                    await Promise.all(promises)
                } catch {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Failed to create all rule views',
                        }),
                    )
                    return
                }
            }
        }

        const newRuleName = recipe_tag
            ? `[${recipe_tag}] ${rule.name}`
            : rule.name
        try {
            let newRuleDraft = {
                ...rule,
                name: newRuleName,
            }

            if (newRuleDraft.settings) {
                newRuleDraft.settings = {
                    ...newRuleDraft.settings,
                    ...extraDefaultSettings,
                }
            }

            if (installFromSuggestion)
                newRuleDraft = {
                    ...newRuleDraft,
                    meta: { via_suggestion: true },
                } as RuleDraft

            const newRule = await createRule(newRuleDraft)
            void dispatch(ruleCreated(newRule))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully installed rule',
                }),
            )
            logEvent(SegmentEvent.RuleLibraryItemInstalled, {
                ...segmentEventProps,
                views_installed: shouldCreateViews,
            })
            history.push(`/app/settings/rules/${newRule.id}`)
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to install rule',
                }),
            )
            return
        }
    }

    const managedRule = rules.find(
        (rule) =>
            rule.type === RuleType.Managed &&
            recipe.rule.type === RuleType.Managed &&
            (rule as ManagedRule).settings.slug ===
                (recipe.rule as ManagedRule).settings.slug,
    )
    const managedRuleId = managedRule?.id

    const shouldInstall =
        !managedRuleId &&
        limitStatus !== RuleLimitStatus.Reached &&
        hasAgentPrivileges

    const handleClick = () => {
        if (managedRuleId) {
            history.push(`/app/settings/rules/${managedRuleId}`)
        } else {
            setModalOpen(true)
        }
    }
    if (isModalOpen && shouldInstall && autoInstall && !isBehindPaywall) {
        void handleInstall(true, true)
        logEvent(SegmentEvent.RuleSuggestion, {
            rule: rule.name,
            event_type: 'installed',
        })
        setModalOpen(false)
    }

    return (
        <div className={css.card} onClick={handleClick}>
            <div className={css.header}>
                {recipe.recipe_tag && (
                    <Badge
                        key={recipe_tag}
                        cssModule={{ badge: css.badge }}
                        style={tagColors[recipe_tag]}
                    >
                        {recipe_tag}
                    </Badge>
                )}
                {isInstalled &&
                    managedRule?.deactivated_datetime == null &&
                    rule?.type === RuleType.Managed && (
                        <img src={successIcon} alt="installed" />
                    )}
            </div>
            <div className={css.content}>
                <div className={css.title}>{rule.name}</div>
                <div className={css.description}>
                    {rule.description || 'No description available'}
                </div>
            </div>
            <div>
                {recipe.slug === RuleTemplateRecipeSlugs.AutoTagAiIgnore ||
                recipe.slug === RuleTemplateRecipeSlugs.ReopenLowCSATAiAgent ? (
                    <div className={css.ticketCount}>
                        <AiAgentRequirements aiAgentLink={aiAgentLink} />
                    </div>
                ) : (
                    <div
                        className={classnames(css.ticketCount, {
                            [css.important]: recipe.triggered_count >= 20,
                        })}
                    >
                        Target up to {recipe.triggered_count} tickets/month
                    </div>
                )}
                <RuleRecipeModal
                    recipe={recipe}
                    handleInstall={handleInstall}
                    handleRule={handleRule}
                    isOpen={isModalOpen}
                    onToggle={handleModalToggle}
                    shouldInstall={shouldInstall}
                    managedRuleId={managedRuleId}
                    handleDefaultSettings={setExtraDefaultSettings}
                    shouldHandleError={isReady}
                    aiAgentLink={aiAgentLink}
                />
            </div>
        </div>
    )
}

export default RuleRecipeCard
