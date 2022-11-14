import React, {useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import _pick from 'lodash/pick'
import {fromJS} from 'immutable'
import {Collapse} from 'reactstrap'
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
import Avatar from 'pages/common/components/Avatar/Avatar'
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

import css from './RuleSuggestion.less'

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
    const [isOpen, setIsOpen] = useState(true)
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const ruleSuggestionFeatureFlag = useFlags()[FeatureFlagKey.RuleSuggestion]
    const currentUser = useAppSelector(getCurrentUser)
    const emailChannels = useAppSelector(getEmailChannels)
    const recipes = useRuleRecipes()
    if (!recipes) return null

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

    const ruleName = recipes[suggestion.slug]?.rule?.name ?? suggestion.slug

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
            const ruleName =
                recipes[suggestion.slug]?.rule?.name ?? suggestion.slug
            const {newMessage, newActions} = transformToInternalNote(
                message,
                fromJS(actions),
                `Sent via suggested rule: <a target="_blank" href="/app/settings/rules#rule-library?${suggestion.slug}">${ruleName}</a>`
            )
            message = {...newMessage, actions: newActions ?? fromJS([])}
        }

        await dispatch(sendTicketMessage(getMomentNow(), message, null))
    }

    return hasAutomationAddOn &&
        ruleSuggestionFeatureFlag &&
        (actions?.length || text) ? (
        <div className={css.container}>
            <div className={css.avatar}>
                <Avatar
                    name="Gorgias Tips"
                    size={36}
                    url={`${
                        window.GORGIAS_ASSETS_URL || ''
                    }/static/private/js/assets/img/icons/gorgias-icon-logo-white.png`}
                />
            </div>
            <header className={css.header}>
                <div>
                    <div className={css.headerTitle}>
                        <span>Gorgias Tips</span>
                        <span>Only visible to you</span>
                    </div>
                    <div className={css.headerInfo}>
                        <span>
                            Automate this ticket with the{' '}
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={`/app/settings/rules#rule-library?${suggestion.slug}`}
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
                        <Button intent="secondary" size="small">
                            Install
                        </Button>
                        <Button size="small" onClick={applySuggestion}>
                            Apply & Send
                        </Button>
                    </div>
                    <div
                        className={css.chevron}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <i className="material-icons-round">
                            {isOpen ? 'expand_less' : 'expand_more'}
                        </i>
                    </div>
                </div>
            </header>
            <div className={css.bodyContainer}>
                <Collapse isOpen={isOpen}>
                    {text?.body_html && (
                        <div className={css.textContainer}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: text.body_html,
                                }}
                            />
                        </div>
                    )}
                    <div>{/* Actions Placehold  */}</div>
                </Collapse>
            </div>
        </div>
    ) : null
}

export default RuleSuggestion
