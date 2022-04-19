import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {useAsyncFn} from 'react-use'

import Loader from '../../../../pages/common/components/Loader/Loader'
import {fetchRule} from '../../../../models/rule/resources'
import {getRulesLimitStatus} from '../../../../state/entities/rules/selectors'
import {ruleFetched} from '../../../../state/entities/rules/actions'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import history from '../../../history'

import {RootState} from '../../../../state/types'
import {RuleFormEditor} from './components/RuleFormEditor'

export function RuleDetailForm({
    rules,
    ruleFetched,
    match: {
        params: {ruleId},
    },
    notify,
}: RouteComponentProps<{ruleId?: string}> & ConnectedProps<typeof connector>) {
    const [{loading: isFetchPending}, handleFetchRule] = useAsyncFn(
        async (ruleId: number) => {
            try {
                const res = await fetchRule(ruleId)
                ruleFetched(res)
            } catch (error) {
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

export default withRouter(connector(RuleDetailForm))
