import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import React, {useCallback, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {Container} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useEffectOnce from 'hooks/useEffectOnce'
import {fetchRules} from 'models/rule/resources'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import Video from 'pages/common/components/Video/Video'

import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import settingsCss from 'pages/settings/settings.less'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {rulesFetched} from 'state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from 'state/entities/rules/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RuleLimitStatus} from 'state/rules/types'

import List from './accountRules/RulesList'
import CourseCard from './components/CourseCard'
import CreateRuleFooter from './components/CreateRuleFooter'
import TrackedRuleLibraryLink, {
    Source,
} from './components/TrackedRuleLibraryLink'

import css from './RulesView.less'

const customRuleBreakpoint = 3

export function RulesList() {
    const history = useHistory()
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
    const limitStatus = useAppSelector(getRulesLimitStatus)

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

    const [searchTerm, setSearchTerm] = useState('')

    useEffectOnce(() => {
        const {
            location: {hash},
        } = history

        if (hash.includes('#rule-library')) {
            history.replace(
                `/app/settings/rules/library${hash.replace(
                    '#rule-library',
                    ''
                )}`
            )
        }

        void handleFetchRules()
    })

    const customRuleCount = rules.reduce(
        (total, {type}) => total + Number(type !== 'managed'),
        0
    )

    const isCustomRuleCountBelowBreakpoint =
        customRuleCount < customRuleBreakpoint

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Rules">
                    <div className={css.headerContainer}>
                        <Search
                            placeholder="Search rules..."
                            className="mr-2"
                            onChange={(query) => {
                                logSearch(query)
                                setSearchTerm(query)
                            }}
                        />
                        {!isCustomRuleCountBelowBreakpoint && (
                            <TrackedRuleLibraryLink
                                from={Source.CreateRuleButton}
                            >
                                <Button
                                    className="float-right"
                                    isDisabled={
                                        limitStatus === RuleLimitStatus.Reached
                                    }
                                >
                                    Create rule
                                </Button>
                            </TrackedRuleLibraryLink>
                        )}
                    </div>
                </PageHeader>
            </div>
            <Container
                fluid
                className={classnames(css.info, settingsCss.pageContainer)}
            >
                <div className={css.infoContainer}>
                    <div
                        className={css.description}
                        data-candu-id="rules-list-description"
                    >
                        <p className="mb-2">
                            Automate tasks to streamline support with rules.
                        </p>
                        <a
                            className={classnames(css.link, 'd-block mb-2')}
                            href="https://docs.gorgias.com/en-US/articles/rules-18380"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <i className="material-icons">menu_book</i>{' '}
                            <span>How To Set Up Rules</span>
                        </a>
                    </div>
                    <div className="d-flex">
                        <Video
                            youtubeId="HFylY2x3T_Y"
                            legend="Working with rules"
                        />
                        <CourseCard />
                    </div>
                </div>
                {limitStatus === RuleLimitStatus.Reaching && (
                    <Alert type={AlertType.Warning} icon>
                        You have {rules.length} out of 70 rules installed.
                    </Alert>
                )}
                {limitStatus === RuleLimitStatus.Reached && (
                    <Alert type={AlertType.Error} icon>
                        You have reached the 70 rule limit. Delete existing
                        rules to add more.
                    </Alert>
                )}
            </Container>
            {isFetchingRules ? (
                <Loader />
            ) : (
                <>
                    <List
                        rules={rules}
                        limitStatus={limitStatus}
                        shouldDisplayError={isReady}
                        searchTerm={searchTerm}
                    />
                    {isCustomRuleCountBelowBreakpoint && <CreateRuleFooter />}
                </>
            )}
        </div>
    )
}

export default RulesList
