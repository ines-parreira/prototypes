import React, {useState} from 'react'
import _pick from 'lodash/pick'
import {fromJS} from 'immutable'
import {Spinner, Tooltip} from 'reactstrap'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import Button from 'pages/common/components/button/Button'
import {ActionStatus, Ticket} from 'models/ticket/types'
import {actionsConfig} from 'pages/common/components/ast/actions/Action'
import {
    MacroAction,
    MacroActionName,
    MacroActionType,
} from 'models/macroAction/types'
import {RuleAction, RuleType} from 'models/rule/types'

import {useRuleRecipes} from 'state/entities/ruleRecipes/hooks'
import {getEmailChannels} from 'state/integrations/selectors'
import {getPreferredChannel, guessReceiversFromTicket} from 'state/ticket/utils'
import {
    TicketMessageSourceType,
    TicketChannel,
    TicketVia,
} from 'business/types/ticket'
import {sendTicketMessage} from 'state/newMessage/actions'
import {NewMessage} from 'state/newMessage/types'
import {transformToInternalNote} from 'state/newMessage/utils'
import {getMomentNow} from 'utils/date'
import {getCurrentUser} from 'state/currentUser/selectors'
import {useRules} from 'state/entities/rules/hooks'
import {UserRole} from 'config/types/user'
import {ManagedRule} from 'state/rules/types'
import {hasRole} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import InTicketSuggestion from './InTicketSuggestion'

import css from './RuleSuggestion.less'

type TicketWithRuleSuggestionData = Ticket & {
    meta: Record<'rule_suggestion', RuleSuggestionData>
}

type Props = {
    ticket: TicketWithRuleSuggestionData
    isCollapsed?: boolean
}

export type RuleSuggestionData = {
    actions: RuleAction[]
    slug: string
}

export const getRuleSuggestionContent = (
    ticket: TicketWithRuleSuggestionData
) => {
    const suggestion = ticket.meta.rule_suggestion
    const actions = suggestion.actions
        ?.filter((action) => action.name !== 'replyToTicket')
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

    const text = suggestion.actions?.find(
        (action) => action.name === 'replyToTicket'
    )?.args

    return {actions, text}
}

export const isSuggestionEmpty = ({
    actions,
    text,
}: ReturnType<typeof getRuleSuggestionContent>) => !actions?.length && !text

export default function RuleSuggestion({ticket, isCollapsed}: Props) {
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const recipes = useRuleRecipes()
    const emailChannels = useAppSelector(getEmailChannels)
    const currentUser = useAppSelector(getCurrentUser)
    const [rules, isLoadingRules] = useRules()
    const [isSending, setIsSending] = useState(false)

    const suggestion = ticket.meta.rule_suggestion
    const {actions, text} = getRuleSuggestionContent(ticket)

    if (!hasAutomationAddOn || isSuggestionEmpty({actions, text})) return null

    const channel = getPreferredChannel(
        TicketMessageSourceType.Email,
        emailChannels
    )

    const {to} = guessReceiversFromTicket(
        fromJS(ticket),
        TicketMessageSourceType.Email,
        emailChannels
    )
    const ruleName = recipes?.[suggestion.slug]?.rule?.name ?? suggestion.slug

    const tooltipId = 'rule-suggestion-install-button'
    const canInstall =
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)

    const rule = rules
        ? Object.values(rules).find(
              (rule) =>
                  rule.type === RuleType.Managed &&
                  (rule as ManagedRule).settings.slug === suggestion.slug
          )
        : undefined

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
            meta: {rule_suggestion_slug: suggestion.slug},
        } as unknown as NewMessage

        if (!text) {
            const {newMessage, newActions} = transformToInternalNote(
                message,
                fromJS(actions),
                `Sent via suggested rule: <a target="_blank" href="/app/automation/rules/library?${suggestion.slug}">${ruleName}</a>`
            )
            message = {...newMessage, actions: newActions ?? fromJS([])}
        }

        await dispatch(sendTicketMessage(getMomentNow(), message, null))
    }

    const actionsContent = (
        <div className={css.buttons}>
            <div id={tooltipId}>
                {isLoadingRules ? (
                    <Spinner color="dark" width="25px" />
                ) : (
                    (!rule || !!rule?.deactivated_datetime) && (
                        <Button
                            intent="secondary"
                            size="small"
                            onClick={() =>
                                window.open(
                                    `/app/automation/rules/library?${suggestion.slug}&install`,
                                    '_blank'
                                )
                            }
                            isDisabled={!canInstall}
                        >
                            {!!rule?.deactivated_datetime
                                ? 'Activate Rule'
                                : 'Install Rule'}
                        </Button>
                    )
                )}
                {!canInstall && (
                    <Tooltip target={tooltipId} boundariesElement="viewport">
                        Reach out to an admin to install this rule.
                    </Tooltip>
                )}
            </div>
            <Button
                size="small"
                onClick={() => {
                    if (isSending) return
                    setIsSending(true)
                    void applySuggestion()
                }}
                isDisabled={isSending}
            >
                Apply Rule & Send
            </Button>
        </div>
    )

    return (
        <InTicketSuggestion
            ticket={ticket}
            isCollapsed={isCollapsed}
            text={text?.body_html}
            macroActions={actions}
            actionsContent={actionsContent}
            infoContent={
                <span className={css.info}>
                    Automate this ticket with the{' '}
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={`/app/automation/rules/library?${suggestion.slug}`}
                    >
                        {ruleName}
                    </a>{' '}
                    rule! <span>Here’s a preview:</span>
                </span>
            }
        />
    )
}
