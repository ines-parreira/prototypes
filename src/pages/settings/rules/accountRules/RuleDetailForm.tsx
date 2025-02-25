import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router-dom'

import useAsyncFn from 'hooks/useAsyncFn'
import {fetchRule} from 'models/rule/resources'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import {ruleFetched} from 'state/entities/rules/actions'
import {getRulesLimitStatus} from 'state/entities/rules/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {RootState} from 'state/types'

import {RuleFormEditor} from './components/RuleFormEditor'

export function RuleDetailForm({
    rules,
    ruleFetched,
    notify,
}: ConnectedProps<typeof connector>) {
    const {ruleId} = useParams<{ruleId?: string}>()
    const [{loading: isFetchPending}, handleFetchRule] = useAsyncFn(
        async (ruleId: number) => {
            try {
                const res = await fetchRule(ruleId)
                ruleFetched(res)
            } catch {
                void notify({
                    message: `Could not find rule with id: ${ruleId}`,
                    status: NotificationStatus.Error,
                })
                history.push('/app/settings/rules')
            }
        },
        []
    )
    useEffect(() => {
        if (ruleId) {
            if (Object.keys(rules).findIndex((obj) => obj === ruleId) === -1) {
                void handleFetchRule(parseInt(ruleId))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="full-width">
            {isFetchPending ? (
                <Loader />
            ) : (
                <RuleFormEditor rule={ruleId ? rules[ruleId] : undefined} />
            )}
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        rules: state.entities.rules,
        limitStatus: getRulesLimitStatus(state),
    }),
    {
        ruleFetched,
        notify,
    }
)

export default connector(RuleDetailForm)
