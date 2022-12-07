import React, {Ref, useState, useEffect} from 'react'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'
import {getPreferredChannel, guessReceiversFromTicket} from 'state/ticket/utils'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import Button from 'pages/common/components/button/Button'
import {sendTicketMessage} from 'state/newMessage/actions'
import {setRuleSuggestionState} from 'state/ticket/actions'
import {NewMessage} from 'state/newMessage/types'
import {transformToInternalNote} from 'state/newMessage/utils'
import {getMomentNow} from 'utils/date'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getEmailChannels} from 'state/integrations/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {MacroAction} from 'models/macroAction/types'
import {Ticket} from 'models/ticket/types'
import {useRuleRecipes} from 'state/entities/ruleRecipes/hooks'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'
import Tooltip from 'pages/common/components/Tooltip'
import {ManagedRule, RuleType} from 'state/rules/types'
import {useRules} from 'state/entities/rules/hooks'
import Spinner from 'pages/common/components/Spinner'
import {RuleSuggestionData, SuggestionStates} from './RuleSuggestion'
import css from './SuggestionHeader.less'

type Props = {
    innerRef: Ref<HTMLElement>
    state: SuggestionStates
    slug: string
    onChevronToggle: () => void
    ticket: Ticket & {
        meta: Record<'rule_suggestion', RuleSuggestionData> | null
    }
    text?: MacroAction['arguments']
    actions: MacroAction[]
}

export default function SuggestionHeader({
    innerRef,
    state,
    slug,
    onChevronToggle,
    ticket,
    text,
    actions,
}: Props) {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const emailChannels = useAppSelector(getEmailChannels)
    const recipes = useRuleRecipes()
    const [isSending, setIsSending] = useState(false)
    const [rules, isLoadingRules] = useRules()

    const channel = getPreferredChannel(
        TicketMessageSourceType.Email,
        emailChannels
    )

    const {to} = guessReceiversFromTicket(
        fromJS(ticket),
        TicketMessageSourceType.Email,
        emailChannels
    )

    const ruleName = recipes?.[slug]?.rule?.name ?? slug

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
            meta: {rule_suggestion_slug: slug},
        } as unknown as NewMessage

        if (!text) {
            const {newMessage, newActions} = transformToInternalNote(
                message,
                fromJS(actions),
                `Sent via suggested rule: <a target="_blank" href="/app/settings/rules#rule-library?${slug}">${ruleName}</a>`
            )
            message = {...newMessage, actions: newActions ?? fromJS([])}
        }

        await dispatch(sendTicketMessage(getMomentNow(), message, null))
    }

    useEffect(() => {
        if (state === null) {
            dispatch(setRuleSuggestionState('pending'))
        } else if (state === 'collapse') {
            dispatch(setRuleSuggestionState('ignored'))
        }
    }, [state, dispatch])

    const tooltipId = 'rule-suggestion-install-button'
    const canInstall =
        hasRole(currentUser, UserRole.Admin) ||
        hasRole(currentUser, UserRole.Agent)

    const rule = rules
        ? Object.values(rules).find(
              (rule) =>
                  rule.type === RuleType.Managed &&
                  (rule as ManagedRule).settings.slug === slug
          )
        : undefined

    return (
        <header ref={innerRef} className={css.container}>
            <div className={css.infoContainer}>
                <div className={css.title}>
                    <span>Gorgias Tips</span>
                    <span>Only visible to you</span>
                </div>
                <div className={css.info}>
                    <span>
                        Automate this ticket with the{' '}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={`/app/settings/rules#rule-library?${slug}`}
                        >
                            {ruleName}
                        </a>{' '}
                        rule!{' '}
                    </span>
                    <span>Here’s a preview:</span>
                </div>
            </div>
            <div className={css.buttonsContainer}>
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
                                            `/app/settings/rules?install#rule-library?${slug}`,
                                            '_blank'
                                        )
                                    }
                                    isDisabled={!canInstall}
                                >
                                    {!!rule?.deactivated_datetime
                                        ? 'Activate'
                                        : 'Install'}
                                </Button>
                            )
                        )}
                        {!canInstall && (
                            <Tooltip
                                target={tooltipId}
                                boundariesElement="viewport"
                            >
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
                        Apply & Send
                    </Button>
                </div>
                <div className={css.chevron} onClick={onChevronToggle}>
                    <i className="material-icons-round">
                        {state === 'preview' || state === 'expand'
                            ? 'expand_less'
                            : 'expand_more'}
                    </i>
                </div>
            </div>
        </header>
    )
}
