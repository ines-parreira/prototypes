import React, { useEffect } from 'react'

import { history } from '@repo/routing'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAsyncFn } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import { fetchRule } from 'models/rule/resources'
import Loader from 'pages/common/components/Loader/Loader'
import { ruleFetched } from 'state/entities/rules/actions'
import { getRulesLimitStatus } from 'state/entities/rules/selectors'
import type { RootState } from 'state/types'

import { RuleFormEditor } from './components/RuleFormEditor'

export function RuleDetailForm({
    rules,
    ruleFetched,
}: ConnectedProps<typeof connector>) {
    const { ruleId } = useParams<{ ruleId?: string }>()
    const [{ loading: isFetchPending }, handleFetchRule] = useAsyncFn(
        async (ruleId: number) => {
            try {
                const res = await fetchRule(ruleId)
                ruleFetched(res)
            } catch {
                toast.error(`Could not find rule with id: ${ruleId}`)
                history.push('/app/settings/rules')
            }
        },
        [],
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
    },
)

export default connector(RuleDetailForm)
