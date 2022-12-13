import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useDebounce, useAsyncFn, useEffectOnce} from 'react-use'
import classnames from 'classnames'
import {Container, Breadcrumb, BreadcrumbItem} from 'reactstrap'
import _debounce from 'lodash/debounce'
import {
    Link,
    withRouter,
    RouteComponentProps,
    useHistory,
} from 'react-router-dom'
import {parse} from 'qs'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Search from 'pages/common/components/Search'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {RuleLimitStatus} from 'state/rules/types'
import {NotificationStatus} from 'state/notifications/types'
import {
    getRulesLimitStatus,
    getSortedRules,
} from 'state/entities/rules/selectors'
import {fetchRules} from 'models/rule/resources'
import {rulesFetched} from 'state/entities/rules/actions'

import {getSortedRuleRecipes} from 'state/entities/ruleRecipes/selectors'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {RuleRecipeTag} from 'models/ruleRecipe/types'
import {ruleRecipesFetched} from 'state/entities/ruleRecipes/actions'

import {notify} from 'state/notifications/actions'

import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import settingsCss from 'pages/settings/settings.less'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import SelectFilter from 'pages/stats/common/SelectFilter'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'

import RuleLibrary from './ruleLibrary/RuleLibrary'
import CreateCustomRuleFooter from './components/CreateCustomRuleFooter'

import css from './RulesView.less'

export function RulesLibraryContainer({
    location,
}: Pick<RouteComponentProps, 'location'>) {
    const currentAccount = useAppSelector(getCurrentAccountState)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const logSearch = useCallback(
        _debounce((key: string) => {
            logEvent(SegmentEvent.RuleSearch, {
                domain: currentAccount?.get('domain'),
                key,
                from: 'rules-library',
            })
        }, 400),
        [currentAccount]
    )

    const dispatch = useAppDispatch()
    const rules = useAppSelector(getSortedRules)
    const ruleRecipes = useAppSelector(getSortedRuleRecipes)
    const limitStatus = useAppSelector(getRulesLimitStatus)
    const recipeTags = Object.values(RuleRecipeTag)

    const {isLoading: isHelpCenterLoading} = useHelpCenterList({per_page: 900})
    const isReady = useMemo(() => !isHelpCenterLoading, [isHelpCenterLoading])

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

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [slug, setSlug] = useState('')
    const [autoInstall, setAutoInstall] = useState(false)
    const history = useHistory()

    useEffect(() => {
        const {install} = parse(location.search, {ignoreQueryPrefix: true})
        if (install !== undefined) setAutoInstall(true)

        const searchSlug = location.search?.substring(1)
        if (searchSlug) {
            const rule = rules.find(
                (rule) => rule.settings?.slug === searchSlug
            )
            if (rule) {
                history.replace(`/app/settings/rules/${rule.id}`)
            }
            setSlug(searchSlug)
        }
    }, [location, history, rules])

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 200, [searchTerm])

    useEffectOnce(() => {
        void handleFetchRules()
        void handleFetchRecipes()
    })

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/rules">Rules</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Rule Templates
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <div className={css.headerContainer}>
                        <SelectFilter
                            plural="rules"
                            singular="rule"
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
                            placeholder="Search rule templates..."
                            className="mr-2"
                            onChange={(query) => {
                                logSearch(query)
                                setSearchTerm(query)
                            }}
                        />
                        <Link to="/app/settings/rules/new">
                            <Button
                                className="float-right"
                                isDisabled={
                                    limitStatus === RuleLimitStatus.Reached
                                }
                            >
                                Create Custom Rule
                            </Button>
                        </Link>
                    </div>
                </PageHeader>
            </div>
            <Container
                fluid
                className={classnames(css.info, settingsCss.pageContainer)}
            >
                {limitStatus === RuleLimitStatus.Reaching && (
                    <Alert type={AlertType.Warning} icon className="mb-4">
                        You have {rules.length} out of 70 rules installed.
                    </Alert>
                )}
                {limitStatus === RuleLimitStatus.Reached && (
                    <Alert type={AlertType.Error} icon className="mb-4">
                        You have reached the 70 rule limit. Delete existing
                        rules to add more.
                    </Alert>
                )}
                {isFetchingRecipes || isFetchingRules ? (
                    <Loader />
                ) : (
                    <>
                        <RuleLibrary
                            recipes={ruleRecipes}
                            searchTerm={debouncedSearchTerm}
                            selectedTags={selectedTags}
                            activeSlug={slug}
                            isReady={isReady}
                            rules={rules}
                            autoInstall={autoInstall}
                        />
                        <CreateCustomRuleFooter />
                    </>
                )}
            </Container>
        </div>
    )
}

export default withRouter(RulesLibraryContainer)
