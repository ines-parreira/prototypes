import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import _pick from 'lodash/pick'
import {fromJS} from 'immutable'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import {sendTicketMessage} from 'state/newMessage/actions'
import {getMomentNow} from 'utils/date'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import {getCurrentUser} from 'state/currentUser/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {ActionStatus, Ticket} from 'models/ticket/types'
import {actionsConfig} from 'pages/common/components/ast/actions/Action'
import {NewMessage} from 'state/newMessage/types'
import {
    MacroAction,
    MacroActionName,
    MacroActionType,
} from 'models/macroAction/types'
import {getEmailChannels} from 'state/integrations/selectors'
import {getPreferredChannel, guessReceiversFromTicket} from 'state/ticket/utils'
import {transformToInternalNote} from 'state/newMessage/utils'
import {useRuleRecipes} from 'state/entities/ruleRecipes/hooks'
import {RuleAction, RuleActionName} from 'models/rule/types'

type Props = {
    ticket: Ticket & {
        meta: Record<'rule_suggestion', RuleSuggestionData> | null
    }
}

type RuleSuggestionData = {
    actions: RuleAction[]
    slug: string
}

const RuleSuggestion = ({ticket}: Props) => {
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const ruleSuggestionFeatureFlag = useFlags()[FeatureFlagKey.RuleSuggestion]
    const currentUser = useAppSelector(getCurrentUser)
    const emailChannels = useAppSelector(getEmailChannels)
    const [loadingRecipes, recipes] = useRuleRecipes()
    if (loadingRecipes) return null

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

    const channel = getPreferredChannel(
        TicketMessageSourceType.Email,
        emailChannels
    )

    const {to} = guessReceiversFromTicket(
        fromJS(ticket),
        TicketMessageSourceType.Email,
        emailChannels
    )

    const applySuggestion = async () => {
        let message = {
            source: {
                from: {address: channel.get('address')},
                to: to,
                type: TicketMessageSourceType.Email,
                extra: {},
            },
            channel: TicketChannel.Email,
            sender: _pick(currentUser.toJS(), ['email', 'id', 'name']),
            body_text: text?.body_text ?? '',
            body_html: text?.body_html ?? '',
            attachments: [],
            actions: fromJS(actions),
            public: true,
            macros: [],
            via: TicketVia.Helpdesk,
            from_agent: true,
        } as unknown as NewMessage

        if (!text) {
            // TODO: Add deeplink to rule
            const ruleName =
                recipes[suggestion.slug]?.rule?.name ?? suggestion.slug
            const {newMessage, newActions} = transformToInternalNote(
                message,
                fromJS(actions),
                `Sent via suggested rule: ${ruleName}`
            )
            message = {...newMessage, actions: newActions ?? fromJS([])}
        }

        await dispatch(sendTicketMessage(getMomentNow(), message, null))
    }

    return hasAutomationAddOn &&
        ruleSuggestionFeatureFlag &&
        (actions?.length || text) ? (
        <div>
            <span>Gorgias tips placeholder: </span>
            <Button size="small" onClick={applySuggestion}>
                Apply & Send
            </Button>
        </div>
    ) : null
}

export default RuleSuggestion
