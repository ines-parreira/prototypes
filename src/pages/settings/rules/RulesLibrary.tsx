import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {parse} from 'qs'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Link, useLocation, useHistory} from 'react-router-dom'
import {Container, Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import useEffectOnce from 'hooks/useEffectOnce'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {fetchRules} from 'models/rule/resources'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {ruleRecipesFetched} from 'state/entities/ruleRecipes/actions'
import {getSortedRuleRecipes} from 'state/entities/ruleRecipes/selectors'
import {rulesFetched} from 'state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from 'state/entities/rules/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RuleLimitStatus} from 'state/rules/types'

import CreateCustomRuleFooter from './components/CreateCustomRuleFooter'
import RuleLibrary from './ruleLibrary/RuleLibrary'

import css from './RulesView.less'

export function RulesLibraryContainer() {
    const location = useLocation()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const hasAgentPrivileges = useHasAgentPrivileges()

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

    const {isLoading: isHelpCenterLoading} = useHelpCenterList({per_page: 900})
    const isReady = useMemo(() => !isHelpCenterLoading, [isHelpCenterLoading])

    const [{loading: isFetchingRules}, handleFetchRules] = useAsyncFn(
        async () => {
            try {
                const res = await fetchRules()
                dispatch(rulesFetched(res.data))
            } catch {
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
            } catch {
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
    const [slug, setSlug] = useState('')
    const [autoInstall, setAutoInstall] = useState(false)
    const history = useHistory()

    useEffect(() => {
        const {install, ...restSearch} = parse(location.search, {
            ignoreQueryPrefix: true,
        })
        if (install !== undefined) setAutoInstall(true)

        const [searchSlug] = Object.keys(restSearch)

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

    useDebouncedEffect(
        () => setDebouncedSearchTerm(searchTerm),
        [searchTerm],
        200
    )

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
                        <Search
                            placeholder="Search rule templates..."
                            className="mr-2"
                            onChange={(query) => {
                                logSearch(query)
                                setSearchTerm(query)
                            }}
                        />
                        <Button
                            className="float-right"
                            intent="secondary"
                            isDisabled={
                                limitStatus === RuleLimitStatus.Reached ||
                                !hasAgentPrivileges
                            }
                            onClick={() => {
                                history.push(`/app/settings/rules/new`)
                            }}
                        >
                            Create Custom Rule
                        </Button>
                    </div>
                </PageHeader>
            </div>
            <Container fluid className={classnames(css.info)}>
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
                            activeSlug={slug}
                            isReady={isReady}
                            rules={rules}
                            autoInstall={autoInstall}
                        />
                        {hasAgentPrivileges && <CreateCustomRuleFooter />}
                    </>
                )}
            </Container>
        </div>
    )
}

export default RulesLibraryContainer
