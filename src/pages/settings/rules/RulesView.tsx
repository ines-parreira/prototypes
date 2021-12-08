import React, {useEffect} from 'react'
import {useAsyncFn} from 'react-use'
import classnames from 'classnames'
import {Button, Container} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'

import PageHeader from '../../common/components/PageHeader'

import Video from '../../common/components/Video/Video'
import Loader from '../../common/components/Loader/Loader'
import Alert, {AlertType} from '../../common/components/Alert/Alert'

import {RuleLimitStatus} from '../../../state/rules/types'
import {NotificationStatus} from '../../../state/notifications/types'
import {RootState} from '../../../state/types'
import {rulesFetched} from '../../../state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from '../../../state/entities/rules/selectors'
import {fetchRules} from '../../../models/rule/resources'
import {notify} from '../../../state/notifications/actions'
import settingsCss from '../settings.less'

import RulesTable from './components/RulesTable'

import css from './RulesView.less'

export function RulesViewContainer({
    limitStatus,
    rulesFetched,
    notify,
    rules,
}: ConnectedProps<typeof connector>) {
    const [{loading: isFetching}, handleFetch] = useAsyncFn(async () => {
        try {
            const res = await fetchRules()
            rulesFetched(res.data)
        } catch (error) {
            void notify({
                message: 'Failed to fetch rules',
                status: NotificationStatus.Error,
            })
        }
    })

    useEffect(() => {
        void handleFetch()
    }, [])

    return (
        <div className="full-width">
            <PageHeader title="Rules">
                <Link to="/app/settings/rules/new">
                    <Button
                        color="success"
                        className="float-right"
                        disabled={limitStatus === RuleLimitStatus.Reached}
                    >
                        Create new rule
                    </Button>
                </Link>
            </PageHeader>

            <Container
                fluid
                className={classnames(
                    css.description,
                    settingsCss.pageContainer
                )}
            >
                <div className={classnames('mb-3', css.header)}>
                    <p>
                        Rules provide a way to automatically perform actions on
                        tickets, like tagging, assigning or even responding.
                        Hover a row to show the rule description. Learn more
                        about how to setup rules{' '}
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
                        Rules are executed depending on triggering events and in
                        the order they are listed on this page.{' '}
                        <a
                            href="https://docs.gorgias.com/rules/rules-faq"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Learn more about rules execution
                        </a>
                        .
                    </p>
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
                <Video videoId="0fIboyInGDg" legend="Working with rules" />
            </Container>

            {!isFetching ? (
                <RulesTable rules={rules} limitStatus={limitStatus} />
            ) : (
                <Loader />
            )}
        </div>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            rules: getSortedRules(state),
            limitStatus: getRulesLimitStatus(state),
        }
    },
    {
        rulesFetched,
        notify,
    }
)

export default withRouter(connector(RulesViewContainer))
