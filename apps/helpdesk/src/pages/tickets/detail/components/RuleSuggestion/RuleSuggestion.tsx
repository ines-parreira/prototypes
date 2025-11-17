import React, { useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { fromJS } from 'immutable'
import _pick from 'lodash/pick'
import { Tooltip } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import { UserRole } from 'config/types/user'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionName, MacroActionType } from 'models/macroAction/types'
import type { RuleAction } from 'models/rule/types'
import { RuleType } from 'models/rule/types'
import type { Ticket } from 'models/ticket/types'
import { ActionStatus } from 'models/ticket/types'
import { actionsConfig } from 'pages/common/components/ast/actions/config'
import { getAccountOwnerId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { useRuleRecipes } from 'state/entities/ruleRecipes/hooks'
import { useRules } from 'state/entities/rules/hooks'
import { getEmailChannels } from 'state/integrations/selectors'
import { sendTicketMessage } from 'state/newMessage/actions'
import type { NewMessage } from 'state/newMessage/types'
import { transformToInternalNote } from 'state/newMessage/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { ManagedRule } from 'state/rules/types'
import {
    getPreferredChannel,
    guessReceiversFromTicket,
} from 'state/ticket/utils'
import { hasRole } from 'utils'
import { getMomentNow } from 'utils/date'

import useRuleSuggestionForDemos from '../../hooks/useRuleSuggestionForDemos'
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
    actions: RuleAction[] | null
    slug: string
}

export const getRuleSuggestionContent = (
    ticket: TicketWithRuleSuggestionData,
) => {
    const suggestion = ticket.meta.rule_suggestion
    const actions = suggestion.actions
        ?.filter((action) => action.name !== 'replyToTicket')
        .filter((action) =>
            Object.values(MacroActionName).includes(action.name as any),
        )
        .map(
            (action) =>
                ({
                    arguments: action.args,
                    name: action.name as unknown as MacroActionName,
                    title: actionsConfig[action.name]?.name,
                    status: ActionStatus.Pending,
                    type: MacroActionType.User,
                }) as MacroAction,
        )

    const text = suggestion.actions?.find(
        (action) => action.name === 'replyToTicket',
    )?.args

    return { actions, text }
}

export const isSuggestionEmpty = ({
    actions,
    text,
}: ReturnType<typeof getRuleSuggestionContent>) => !actions?.length && !text

export default function RuleSuggestion({ ticket, isCollapsed }: Props) {
    const dispatch = useAppDispatch()
    const { hasAccess } = useAiAgentAccess()
    const recipes = useRuleRecipes()
    const emailChannels = useAppSelector(getEmailChannels)
    const currentUser = useAppSelector(getCurrentUser)
    const accountOwnerId = useAppSelector(getAccountOwnerId)
    const [rules, isLoadingRules] = useRules()
    const [isSending, setIsSending] = useState(false)

    const suggestion = ticket.meta.rule_suggestion
    const { actions, text } = getRuleSuggestionContent(ticket)

    const {
        shouldDisplayDemoSuggestion,
        setDemoSuggestionSettingPerUser,
        setDemoSuggestionSettingPerAccount,
    } = useRuleSuggestionForDemos(ticket.id, false)

    useEffectOnce(() => {
        if (
            !hasAccess &&
            shouldDisplayDemoSuggestion &&
            !isSuggestionEmpty({ actions, text })
        ) {
            logEvent(SegmentEvent.InTicketSuggestionForDemoViewed, {
                ticketId: ticket.id,
            })
        }
    })

    if (!shouldDisplayDemoSuggestion || isSuggestionEmpty({ actions, text }))
        return null

    const channel = getPreferredChannel(
        TicketMessageSourceType.Email,
        emailChannels,
    )

    const { to } = guessReceiversFromTicket(
        fromJS(ticket),
        TicketMessageSourceType.Email,
        emailChannels,
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
                  (rule as ManagedRule).settings.slug === suggestion.slug,
          )
        : undefined

    const applySuggestion = async () => {
        let message = {
            source: {
                from: { address: channel.get('address') },
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
            meta: { rule_suggestion_slug: suggestion.slug },
        } as unknown as NewMessage

        if (!text) {
            const { newMessage, newActions } = transformToInternalNote(
                message,
                fromJS(actions),
                `Sent via suggested rule: <a target="_blank" href="/app/settings/rules/library?${suggestion.slug}">${ruleName}</a>`,
            )
            message = { ...newMessage, actions: newActions ?? fromJS([]) }
        }

        await dispatch(sendTicketMessage(getMomentNow(), message, null))
    }

    const handleBookDemo = () => {
        if (canInstall) {
            logEvent(SegmentEvent.InTicketSuggestionForDemoBooked)
            window.open(
                'https://www.gorgias.com/demo/customers/automate?utm_source=scaled_success&utm_campaign=in_ticket_suggestions&utm_medium=product',
                '_blank',
                'noopener',
            )
        } else {
            logEvent(SegmentEvent.InTicketSuggestionForDemoRequested, {
                adminId: accountOwnerId,
            })
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        'We notified your account admin of your interest in an AI Agent demo.',
                }),
            )
        }
        handleDismiss(false)
    }

    const handleDismiss = (trackEvents: boolean) => {
        if (trackEvents) {
            logEvent(SegmentEvent.InTicketSuggestionForDemoDismissed, {
                userRole: canInstall ? 'Admin' : 'Agent',
            })
        }
        setDemoSuggestionSettingPerUser()
        if (canInstall) {
            void setDemoSuggestionSettingPerAccount()
        }
    }

    const actionsContentForAutomate = (
        <div className={css.buttons}>
            <div id={tooltipId}>
                {isLoadingRules ? (
                    <LoadingSpinner color="dark" size={25} />
                ) : (
                    (!rule || !!rule?.deactivated_datetime) && (
                        <Button
                            intent="secondary"
                            size="small"
                            onClick={() =>
                                window.open(
                                    `/app/settings/rules/library?${suggestion.slug}&install`,
                                    '_blank',
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

    const infoContentForAutomate = (
        <span className={css.info}>
            Automate this ticket with the{' '}
            <a
                target="_blank"
                rel="noreferrer"
                href={`/app/settings/rules/library?${suggestion.slug}`}
            >
                {ruleName}
            </a>{' '}
            rule! <span>Here’s a preview:</span>
        </span>
    )

    const actionsContentForNonAutomate = (
        <div className={css.buttons}>
            <Button
                intent="secondary"
                size="small"
                onClick={() => handleDismiss(true)}
            >
                Dismiss
            </Button>
            <Button size="small" onClick={handleBookDemo}>
                {canInstall ? 'Book demo' : 'Notify admin'}
            </Button>
        </div>
    )

    const infoContentForNonAutomate = (
        <span className={css.info}>
            Wish you could free up time to focus on higher impact tickets?
            Repetitive tickets like these can be fully Automated.{' '}
            {canInstall
                ? 'Book an AI Agent demo to learn more.'
                : 'Ask your account admin to book an AI Agent demo and learn more.'}
        </span>
    )
    return (
        <InTicketSuggestion
            ticketId={ticket.id}
            isCollapsed={isCollapsed}
            text={text?.body_html}
            macroActions={actions}
            actionsContent={
                hasAccess
                    ? actionsContentForAutomate
                    : actionsContentForNonAutomate
            }
            infoContent={
                hasAccess ? infoContentForAutomate : infoContentForNonAutomate
            }
        />
    )
}
