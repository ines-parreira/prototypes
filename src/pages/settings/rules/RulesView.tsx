import React, {useEffect, useState} from 'react'
import {useDebounce, useAsyncFn} from 'react-use'
import classnames from 'classnames'
import {Container} from 'reactstrap'
import {Link, withRouter, RouteComponentProps} from 'react-router-dom'
import history from 'pages/history'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import Video from 'pages/common/components/Video/Video'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Search from 'pages/common/components/Search'

import {RuleLimitStatus} from 'state/rules/types'
import {NotificationStatus} from 'state/notifications/types'
import {rulesFetched} from 'state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from 'state/entities/rules/selectors'
import {fetchRules} from 'models/rule/resources'

import {getSortedRuleRecipes} from 'state/entities/ruleRecipes/selectors'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {RuleRecipeTag} from 'models/ruleRecipe/types'
import {ruleRecipesFetched} from 'state/entities/ruleRecipes/actions'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {notify} from 'state/notifications/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import settingsCss from 'pages/settings/settings.less'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import SelectFilter from 'pages/stats/common/SelectFilter'

import RulesList from './accountRules/RulesList'
import RuleLibrary from './ruleLibrary/RuleLibrary'
import RuleTabSelect from './components/RuleTabSelect'

import css from './RulesView.less'

export enum RuleTabs {
    AccountRules = 'account-rules',
    RuleLibrary = 'rule-library',
}

export function RulesViewContainer({
    location,
}: Pick<RouteComponentProps, 'location'>) {
    const dispatch = useAppDispatch()
    const rules = useAppSelector(getSortedRules)
    const ruleRecipes = useAppSelector(getSortedRuleRecipes)
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const recipeTags = Object.values(RuleRecipeTag)

    const [{loading: isFetchingRules}, handleFetchRules] = useAsyncFn(
        async () => {
            try {
                const res = await fetchRules()
                dispatch(rulesFetched(res.data))
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch rules',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    )
    const [{loading: isFetchingRecipes}, handleFetchRecipes] = useAsyncFn(
        async () => {
            try {
                const res = await fetchRuleRecipes()
                dispatch(ruleRecipesFetched(res.data))
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch template rules',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    )

    const [activeTab, setActiveTab] = useState(RuleTabs.AccountRules)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [hasUnseenRules, setHasUnseenRules] = useState(false)
    const [slug, setSlug] = useState('')

    const segmentEventProps = {account_id: currentAccount.get('domain')}

    useEffect(() => {
        const [tab, ...splitSlug] = location.hash.substring(1).split('?')
        if (Object.values(RuleTabs).includes(tab as RuleTabs)) {
            setActiveTab(tab as RuleTabs)
        }
        if (tab === RuleTabs.RuleLibrary && splitSlug.length) {
            setSlug(splitSlug.join('?'))
        }
    }, [location])

    const goToLibrary = () => {
        history.push(`#${RuleTabs.RuleLibrary}`)
        logEvent(SegmentEvent.RuleLibraryVisited, segmentEventProps)
    }

    const handleTabChange = (tab: RuleTabs) => {
        history.push(`#${tab}`)
        if (tab === RuleTabs.RuleLibrary) {
            logEvent(SegmentEvent.RuleLibraryVisited, segmentEventProps)
        }
    }

    const isSearching = searchTerm !== ''

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 200, [searchTerm])

    useEffect(() => {
        void handleFetchRules()
        void handleFetchRecipes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (activeTab === RuleTabs.AccountRules) {
            setHasUnseenRules(false)
        }
    }, [activeTab, hasUnseenRules, setHasUnseenRules])

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Rules">
                    <div className={css.headerContainer}>
                        {activeTab === RuleTabs.RuleLibrary && (
                            <>
                                <SelectFilter
                                    plural="rule types"
                                    singular="rule type"
                                    onChange={(values) =>
                                        setSelectedTags(values as string[])
                                    }
                                    value={selectedTags}
                                >
                                    {recipeTags.map((tag) => (
                                        <SelectFilter.Item
                                            key={tag}
                                            value={tag}
                                            label={tag}
                                        />
                                    ))}
                                </SelectFilter>
                                <Search
                                    placeholder="Search rule library..."
                                    className="mr-2"
                                    onChange={(query) => setSearchTerm(query)}
                                />
                            </>
                        )}
                        <Link to="/app/settings/rules/new">
                            <Button
                                className="float-right"
                                isDisabled={
                                    limitStatus === RuleLimitStatus.Reached
                                }
                            >
                                Create rule
                            </Button>
                        </Link>
                    </div>
                </PageHeader>
                <RuleTabSelect
                    handleTabChange={handleTabChange}
                    activeTab={activeTab}
                    hasUnseenRules={hasUnseenRules}
                />
            </div>
            <Container
                fluid
                className={classnames(
                    css.description,
                    settingsCss.pageContainer
                )}
            >
                <div
                    className={css.header}
                    data-candu-id="rules-list-description"
                >
                    {activeTab === RuleTabs.AccountRules && (
                        <>
                            <p>
                                Rules provide a way to automatically perform
                                actions on tickets, like tagging, assigning or
                                even responding. Hover a row to show the rule
                                description. Learn more about how to setup rules{' '}
                                <a
                                    href="https://docs.gorgias.com/rules"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    in our docs
                                </a>
                                .
                            </p>

                            <p>
                                Rules are executed depending on triggering
                                events and in the order they are listed on this
                                page.{' '}
                                <a
                                    href="https://docs.gorgias.com/rules/rules-faq"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Learn more about rules execution
                                </a>
                                .
                            </p>
                            <p>
                                If you need inspiration to automate your
                                workflows don't hesitate to visit our{' '}
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        goToLibrary()
                                    }}
                                >
                                    rule library
                                </a>
                                !
                            </p>
                        </>
                    )}
                    {activeTab === RuleTabs.RuleLibrary && (
                        <div
                            className={classnames(css.libraryHeader, {
                                [css.hasWarning]:
                                    limitStatus !== RuleLimitStatus.NonReaching,
                            })}
                        >
                            {isSearching ? (
                                <>
                                    <p className={css.searchHeader}>
                                        Results for "
                                        <span className={css.searchTerm}>
                                            {searchTerm}
                                        </span>
                                        "
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1>Rule Library</h1>
                                    <p>
                                        Below are some rule examples that you
                                        can install in your account. Once
                                        installed you can visit your rule
                                        setting page to adapt it to your need.{' '}
                                        <a
                                            href="https://docs.gorgias.com/rules/rule-library-new"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Learn more
                                        </a>
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                    {limitStatus === RuleLimitStatus.Reaching && (
                        <Alert
                            type={AlertType.Warning}
                            icon
                            className={settingsCss.mb16}
                        >
                            You are using
                            <b> {rules.length} rules of 70 </b>
                            allowed on Gorgias. To add more rules, please delete
                            any inactive rules.
                        </Alert>
                    )}
                    {limitStatus === RuleLimitStatus.Reached && (
                        <Alert
                            type={AlertType.Error}
                            icon
                            className={settingsCss.mb16}
                        >
                            <b>Your account has reached the rule limit.</b> To
                            add more rules, please delete any inactive rules.
                        </Alert>
                    )}
                </div>
                {activeTab === RuleTabs.AccountRules && (
                    <Video videoId="zo2Ui0RPscU" legend="Working with rules" />
                )}
            </Container>
            {activeTab === RuleTabs.AccountRules ? (
                <>
                    {isFetchingRules ? (
                        <Loader />
                    ) : (
                        <RulesList
                            rules={rules}
                            limitStatus={limitStatus}
                            handleGoToLibrary={goToLibrary}
                        />
                    )}
                </>
            ) : (
                <>
                    {isFetchingRecipes ? (
                        <Loader />
                    ) : (
                        <RuleLibrary
                            recipes={ruleRecipes}
                            searchTerm={debouncedSearchTerm}
                            selectedTags={selectedTags}
                            onInstall={(rule) => setHasUnseenRules(!!rule)}
                            activeSlug={slug}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default withRouter(RulesViewContainer)
