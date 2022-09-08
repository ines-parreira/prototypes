import React, {useMemo, useState} from 'react'
import classNames from 'classnames'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Label} from 'reactstrap'

import warningIcon from 'assets/img/icons/warning2.svg'

import {GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS} from 'config/integrations/gorgias_chat'
import {ChatContactInfoDto} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'
import {getViewLanguage} from 'state/ui/helpCenter'
import useAppSelector from 'hooks/useAppSelector'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {AlertType} from 'pages/common/components/Alert/Alert'
import {useChatHelpCenterConfiguration} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfService/hooks'
import TextArea from 'pages/common/forms/TextArea'

import helpCenterContactViewCss from '../../HelpCenterContactView.less'
import ContactCard from '../ContactCard'
import {MAX_DESCRIPTION_LENGTH} from '../../constants'
import ChatCardAvatars from './ChatCardAvatars'

import css from './ChatApplication.less'
import {
    convertDaysToName,
    formatBusinessHoursByLocale,
    getTimezoneAbbreviation,
} from './formatting.utils'

type Props = {
    helpCenterId: number
}

const ChatApplication: React.FC<Props> = ({helpCenterId}) => {
    const {
        translation: {chatApplicationId, contactInfo},
        updateTranslation,
    } = useHelpCenterTranslation()
    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.GorgiasChat)
    )
    const {chatHelpCenterConfiguration} =
        useChatHelpCenterConfiguration(chatApplicationId)

    const chatOptions = useMemo(
        () =>
            chatIntegrations
                .toArray()
                .filter((chat: Map<any, any>) => {
                    const deactivatedDatetime = chat.get('deactivated_datetime')

                    return !deactivatedDatetime
                })
                .map((chat: Map<any, any>) => {
                    const chatName: string = chat.get('name')
                    const integrationId: number = chat.get('id')
                    const chatAppId: number = parseInt(
                        chat.getIn(['meta', 'app_id']) as string,
                        10
                    )
                    const chatLanguageCode: string = chat.getIn([
                        'meta',
                        'language',
                    ])
                    const chatLanguage =
                        GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find(
                            (value) => value?.get('value') === chatLanguageCode
                        )
                    const chatLanguageName =
                        chatLanguage !== undefined
                            ? `(${chatLanguage.get('label') as string})`
                            : ''

                    return {
                        label: (
                            <span>
                                {chatName} {chatLanguageName}
                            </span>
                        ),
                        value: chatAppId,
                        integrationId,
                    }
                }),
        [chatIntegrations]
    )

    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const businessHours = useAppSelector(getBusinessHoursSettings)
    const currentHelpCenterLanguage = useAppSelector(getViewLanguage)
    const {description: chatCardDescription, enabled} = contactInfo.chat

    const handleChange =
        <TKey extends keyof ChatContactInfoDto>(key: TKey) =>
        (value: ChatContactInfoDto[TKey]) => {
            updateTranslation({
                contactInfo: {
                    ...contactInfo,
                    chat: {
                        ...contactInfo.chat,
                        [key]: value,
                    },
                },
            })
        }

    const handleChatApplicationIdChange = (
        chatApplicationId: number | null
    ) => {
        updateTranslation({chatApplicationId})
    }

    const toggleChatEnabled = () => {
        handleChatApplicationIdChange(
            chatApplicationId == null && chatOptions.length > 0
                ? chatOptions[0].value
                : null
        )
    }

    const renderBusinessHours = () => {
        if (!businessHours) return null

        const {business_hours, timezone} = businessHours.data
        const timezoneAbbreviation = getTimezoneAbbreviation(timezone)

        return business_hours.map(({days, from_time, to_time}) => (
            <span key={days}>
                <b>{convertDaysToName(days)}</b>&nbsp;
                {formatBusinessHoursByLocale(
                    from_time,
                    currentHelpCenterLanguage
                )}{' '}
                -&nbsp;
                {formatBusinessHoursByLocale(
                    to_time,
                    currentHelpCenterLanguage
                )}
                &nbsp;
                {timezoneAbbreviation}
            </span>
        ))
    }

    const chatIntegrationId = chatOptions.find(
        (el) => el.value === chatApplicationId
    )?.integrationId

    const chatHelpCenterMismatch =
        chatHelpCenterConfiguration !== null &&
        chatHelpCenterConfiguration.enabled &&
        chatHelpCenterConfiguration.help_center_id !== helpCenterId

    return (
        <section className={css.container}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <div className={css.leftColumn}>
                    <div className={css.heading}>
                        <div>
                            <h3>Chat</h3>
                            <p>
                                Allow customers to reach out to you through chat
                                from the help center.
                            </p>
                        </div>
                    </div>
                    <ToggleInput
                        isToggled={!!chatApplicationId}
                        onClick={toggleChatEnabled}
                        isDisabled={chatOptions.length === 0}
                        className={css.toggle}
                        caption="This makes a chat widget visible for all Help Center pages."
                    >
                        Enable chat widget
                    </ToggleInput>

                    {chatOptions.length === 0 && (
                        <div className={css['warning-no-chat']}>
                            <span className="float-right">
                                <Link to="/app/settings/integrations/gorgias_chat">
                                    Create Chat
                                </Link>
                            </span>
                            <span
                                className={classNames(
                                    css['warning-icon'],
                                    'mr-2'
                                )}
                            >
                                <i className="material-icons">report_problem</i>
                            </span>
                            You don't have any existing chat integration. Please
                            create one to enable.
                        </div>
                    )}

                    {chatOptions.length > 0 && (
                        <>
                            <Label
                                disabled={!chatApplicationId}
                                className="control-label"
                            >
                                Select chat integration
                            </Label>
                            <SelectField
                                value={chatApplicationId}
                                options={chatOptions}
                                onChange={(value) =>
                                    handleChatApplicationIdChange(
                                        value as number
                                    )
                                }
                                placeholder="Select a chat"
                                fullWidth
                                disabled={!chatApplicationId}
                                icon="forum"
                            />
                        </>
                    )}

                    {chatHelpCenterMismatch && chatIntegrationId !== undefined && (
                        <LinkAlert
                            actionLabel="Go To Chat Settings"
                            type={AlertType.Warning}
                            className={css.alert}
                            actionHref={`/app/settings/integrations/gorgias_chat/${chatIntegrationId}/automation`}
                        >
                            <div className={css.alertContent}>
                                <img src={warningIcon} alt="warning icon" />
                                <p className={css.alertMessage}>
                                    The selected chat integration is using a
                                    different Help Center for article
                                    recommendations.
                                </p>
                            </div>
                        </LinkAlert>
                    )}

                    <div className={css.chatContactCard}>
                        <ToggleInput
                            className={css.toggle}
                            isToggled={enabled}
                            onClick={handleChange('enabled')}
                            aria-label="Enable chat contact card"
                            isDisabled={!chatApplicationId}
                        >
                            Chat contact card
                        </ToggleInput>
                        <TextArea
                            label="Card description"
                            rows={1}
                            value={chatCardDescription}
                            onChange={(value: string) => {
                                if (value.length > MAX_DESCRIPTION_LENGTH) {
                                    setIsDescriptionTooLong(true)
                                    return
                                }
                                setIsDescriptionTooLong(false)

                                handleChange('description')(value)
                            }}
                            isDisabled={!enabled}
                            error={
                                isDescriptionTooLong
                                    ? `Description should be no longer than ${MAX_DESCRIPTION_LENGTH} characters`
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>
            <ContactCard
                icon="forum"
                title="Chat"
                helpText="Chat card preview"
                disabled={!enabled}
                className={css.card}
            >
                <div className={css.content}>
                    <ChatCardAvatars />
                    {chatCardDescription}
                    {renderBusinessHours()}
                </div>
            </ContactCard>
        </section>
    )
}

export default ChatApplication
