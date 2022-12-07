import React, {useState, useEffect} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classnames from 'classnames'
import {useMeasure} from 'react-use'
import {assetsUrl} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import {ActionStatus, Ticket} from 'models/ticket/types'
import {actionsConfig} from 'pages/common/components/ast/actions/Action'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {
    MacroAction,
    MacroActionName,
    MacroActionType,
} from 'models/macroAction/types'
import {RuleAction, RuleActionName} from 'models/rule/types'

import SuggestionHeader from './SuggestionHeader'
import SuggestionBody from './SuggestionBody'

import css from './RuleSuggestion.less'

type Props = {
    ticket: Ticket & {
        meta: Record<'rule_suggestion', RuleSuggestionData> | null
    }
    isCollapsed?: boolean
}

export type RuleSuggestionData = {
    actions: RuleAction[]
    slug: string
}

export type SuggestionStates = 'collapse' | 'expand' | 'preview' | null

export default function RuleSuggestion({ticket, isCollapsed}: Props) {
    const [suggestionState, setSuggestionState] = useState<SuggestionStates>(
        isCollapsed ? 'collapse' : null
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const {isFocused} = useAppSelector((state) => state.ui.editor)
    const isPartialUpdating = useAppSelector(
        (state) =>
            state.ticket.getIn(['_internal', 'isPartialUpdating']) as boolean
    )
    const ruleSuggestionFeatureFlag = useFlags()[FeatureFlagKey.RuleSuggestion]
    const isVirtualizationEnabled =
        useFlags()[FeatureFlagKey.TicketMessagesVirtualization]

    const [headerRef, {height: headerHeight}] = useMeasure<HTMLElement>()
    useEffect(() => {
        if (isFocused || isPartialUpdating) setSuggestionState('collapse')
    }, [isFocused, isPartialUpdating])

    const suggestion = ticket.meta?.['rule_suggestion']
    if (!suggestion) return null

    const actions = suggestion?.actions
        ?.filter((action) => action.name !== RuleActionName.ReplyToTicket)
        .filter((action) =>
            Object.values(MacroActionName).includes(action.name as any)
        )
        .map(
            (action) =>
                ({
                    arguments: action.args,
                    name: action.name as unknown as MacroActionName,
                    title: actionsConfig[action.name]?.name,
                    status: ActionStatus.Pending,
                    type: MacroActionType.User,
                } as MacroAction)
        )

    const text = suggestion?.actions?.find(
        (action) => action.name === RuleActionName.ReplyToTicket
    )?.args

    return hasAutomationAddOn &&
        ruleSuggestionFeatureFlag &&
        (actions?.length || text) ? (
        <div
            className={classnames(css.container, {
                [css.isVirtualized]: isVirtualizationEnabled,
            })}
        >
            <div className={css.avatar}>
                <Avatar
                    name="Gorgias Tips"
                    size={36}
                    url={assetsUrl('/img/icons/gorgias-icon-logo-white.png')}
                />
            </div>

            <SuggestionHeader
                onChevronToggle={() =>
                    setSuggestionState((state) =>
                        state === 'collapse' ? 'expand' : 'collapse'
                    )
                }
                innerRef={headerRef}
                slug={suggestion.slug}
                state={suggestionState}
                ticket={ticket}
                text={text}
                actions={actions}
            />

            <SuggestionBody
                state={suggestionState}
                actions={actions}
                __html={text?.body_html}
                ticketId={ticket.id}
                setSuggestionState={setSuggestionState}
            />

            {suggestionState === 'preview' ? (
                <FadeLayer
                    onClick={() => setSuggestionState('expand')}
                    gradientStart={headerHeight}
                />
            ) : null}
        </div>
    ) : null
}

function FadeLayer({
    gradientStart,
    onClick,
}: {
    gradientStart: number
    onClick: () => void
}) {
    return (
        <div
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) ${gradientStart}px, rgba(255, 255, 255, 1) 100%)`,
            }}
            className={css.fadeLayer}
        >
            <div onClick={onClick} className={css.expandButton}>
                <Button fillStyle="ghost" intent="secondary">
                    Expand
                    <i className="material-icons-round">expand_more</i>
                </Button>
            </div>
        </div>
    )
}
