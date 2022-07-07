import React, {useCallback, useEffect, useState} from 'react'
import _noop from 'lodash/noop'
import {fromJS, List, Map} from 'immutable'
import _getIn from 'lodash/get'
import {Badge} from 'reactstrap'

import {toRGBA} from 'utils'
import history from 'pages/history'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import {
    AnyManagedRuleSettings,
    ManagedRule,
    Rule,
    RuleLimitStatus,
    RuleOperation,
    RuleType,
} from 'state/rules/types'
import {createRule} from 'models/rule/resources'
import {ruleCreated} from 'state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from 'state/entities/rules/selectors'

import {createTag, fetchTags} from 'models/tag/resources'
import {tagCreated} from 'state/entities/tags/actions'
import {TagDraft} from 'state/tags/types'

import {getTicketViews} from 'state/entities/views/selectors'
import {viewCreated, viewDeleted} from 'state/entities/views/actions'
import {createView, deleteView} from 'models/view/resources'
import {View, ViewDraft} from 'models/view/types'

import {getSectionIdByName} from 'state/entities/sections/selectors'
import {sectionCreated} from 'state/entities/sections/actions'
import {createSection} from 'models/section/resources'

import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {RuleRecipe, RuleRecipeTag} from 'models/ruleRecipe/types'

import {CodeASTType} from '../../types'

import {RuleRecipeModal} from './RuleRecipeModal'

import css from './RuleRecipeCard.less'

type Props = {
    recipe: RuleRecipe
    onInstall: (rule: Rule) => void
    isModalOpenOnLoad?: boolean
    isReady: boolean
}

const tagColors: {[key: string]: string} = {
    [RuleRecipeTag.AUTO_TAG]: '#20C08C',
    [RuleRecipeTag.AUTO_CLOSE]: '#D6384D',
    [RuleRecipeTag.AUTO_REPLY]: '#3373DB',
}

function RuleRecipeCard({
    recipe,
    isReady,
    isModalOpenOnLoad = false,
    onInstall = _noop,
}: Props) {
    const dispatch = useAppDispatch()

    const existingViews = useAppSelector(getTicketViews)
    const existingSections = useAppSelector(getSectionIdByName)
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const rules = useAppSelector(getSortedRules)
    const [extraDefaultSettings, setExtraDefaultSettings] = useState<
        Partial<AnyManagedRuleSettings>
    >({})
    const [isModalOpen, setModalOpen] = useState(isModalOpenOnLoad)
    const {rule, tags, recipe_tag, views_per_section} = recipe

    const handleCodeAst = (
        path: List<any>,
        value: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation,
        code_ast?: CodeASTType
    ): CodeASTType => {
        return code_ast as CodeASTType
    }

    const getCondition = (path: List<any>) =>
        fromJS(_getIn(rule, ['code_ast', ...path.toJS()])) as Map<any, any>

    const handleRule = {
        modifyCodeAST: handleCodeAst,
        getCondition,
    }

    const handleModalToggle = () => setModalOpen(!isModalOpen)

    const handleCreateTag = async (tag: TagDraft) => {
        const existingTags = await fetchTags({search: tag.name})

        // search returns a case agnostic result, so we have to check
        // for string equality
        if (
            !existingTags.data.some(
                (existingTag) => existingTag.name === tag.name
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
        const newView = await createView({...view, section_id: sectionId})
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
        views: ViewDraft[]
    ) => {
        const promises: Promise<View>[] = []
        const viewsToCreate = (
            await Promise.all(
                views.map(async (view) => {
                    const existingView = existingViews.find(
                        (existingView) => existingView.name === view.name
                    )
                    if (!existingView) {
                        return view
                    }
                    if (existingView.deactivated_datetime) {
                        await deleteView(existingView.id)
                        dispatch(viewDeleted(existingView.id))
                        return view
                    }
                })
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

    const renderTags = useCallback(() => {
        const badges = []
        if (!!recipe_tag) {
            badges.push(
                <Badge
                    key={recipe_tag}
                    cssModule={{badge: css.badge}}
                    style={{
                        color: tagColors[recipe_tag] || tagColors['default'],
                        backgroundColor: toRGBA(
                            tagColors[recipe_tag] || tagColors['default'],
                            0.05
                        ),
                    }}
                >
                    {recipe_tag}
                </Badge>
            )
        }
        if (recipe.rule.type === 'managed') {
            const text = managedRuleId ? 'Installed' : 'Managed'
            badges.push(
                <Badge
                    color="light"
                    key="managed-rule"
                    cssModule={{badge: css.badge}}
                >
                    <i className="material-icons mr-2">auto_awesome</i>
                    {text}
                </Badge>
            )
        }
        return <>{badges}</>
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipe_tag])

    const handleInstall = async (
        shouldCreateViews: boolean,
        shouldGoToRule = false
    ) => {
        void dispatch(
            notify({
                message: 'Installing rule',
                status: NotificationStatus.Loading,
                closeOnNext: true,
                dismissAfter: 0,
            })
        )

        if (limitStatus === RuleLimitStatus.Reached) {
            void dispatch(
                notify({
                    message: 'Rule limit reached',
                    status: NotificationStatus.Error,
                })
            )
            return
        }
        if (shouldCreateViews) {
            if (tags) {
                try {
                    for (let i = 0; i < tags.length; i++) {
                        await handleCreateTag(tags[i])
                    }
                } catch (error) {
                    void dispatch(
                        notify({
                            message: 'Failed to create all rule tags',
                            status: NotificationStatus.Error,
                        })
                    )
                }
            }
            if (views_per_section) {
                const promises = Object.keys(views_per_section).map((section) =>
                    handleCreateViewsAndSections(
                        section,
                        views_per_section[section]
                    )
                )
                try {
                    await Promise.all(promises)
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Failed to create all rule views',
                        })
                    )
                    return
                }
            }
        }

        const newRuleName = recipe_tag
            ? `[${recipe_tag}] ${rule.name}`
            : rule.name
        try {
            const newRuleDraft = {
                ...rule,
                name: newRuleName,
            }

            if (newRuleDraft.settings) {
                newRuleDraft.settings = {
                    ...newRuleDraft.settings,
                    ...extraDefaultSettings,
                }
            }

            const newRule = await createRule(newRuleDraft)
            void dispatch(ruleCreated(newRule))
            onInstall(newRule)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully installed rule',
                    buttons: [
                        {
                            primary: false,
                            name: 'Go!',
                            onClick: () => {
                                history.push(
                                    `/app/settings/rules/${newRule.id}`
                                )
                            },
                        },
                    ],
                })
            )
            logEvent(SegmentEvent.RuleLibraryItemInstalled, {
                ...segmentEventProps,
                views_installed: shouldCreateViews,
            })
            if (shouldGoToRule) {
                history.push(`/app/settings/rules/${newRule.id}`)
            }
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to install rule',
                })
            )
            return
        }
    }

    const managedRuleId = rules.find(
        (rule) =>
            rule.type === RuleType.Managed &&
            recipe.rule.type === RuleType.Managed &&
            (rule as ManagedRule).settings.slug ===
                (recipe.rule as ManagedRule).settings.slug
    )?.id

    const shouldInstall =
        !managedRuleId && limitStatus !== RuleLimitStatus.Reached

    const handleClick = () => {
        if (managedRuleId) {
            history.push(`/app/settings/rules/${managedRuleId}`)
        } else {
            setModalOpen(true)
        }
    }

    return (
        <div className={css.card} onClick={handleClick}>
            <div className={css.content}>
                <div className={css.title}>{rule.name}</div>
                <div className={css.description}>
                    {rule.description || 'No description available'}
                </div>
            </div>
            <div className={css.footer}>
                <div className={css.ticketCount}>
                    {recipe.triggered_count} tickets/month
                </div>
                <div className={css.tags}>
                    {recipe.recipe_tag && <div>{renderTags()}</div>}
                </div>
                <RuleRecipeModal
                    recipe={recipe}
                    handleInstall={handleInstall}
                    renderTags={renderTags}
                    handleRule={handleRule}
                    isOpen={isModalOpen}
                    onToggle={handleModalToggle}
                    shouldInstall={shouldInstall}
                    managedRuleId={managedRuleId}
                    handleDefaultSettings={setExtraDefaultSettings}
                    shouldHandleError={isReady}
                />
            </div>
        </div>
    )
}

export default RuleRecipeCard
