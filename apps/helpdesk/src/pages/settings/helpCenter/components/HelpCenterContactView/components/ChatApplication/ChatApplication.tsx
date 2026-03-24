import React, { useMemo, useState } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'
import { List } from 'immutable'
import { Link } from 'react-router-dom'
import { Label } from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import { GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS } from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { ChatContactInfoDto } from 'models/helpCenter/types'
import { useApplications } from 'models/integration/queries'
import { IntegrationType } from 'models/integration/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TextArea from 'pages/common/forms/TextArea'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { useHelpCenterTranslation } from 'pages/settings/helpCenter/providers/HelpCenterTranslation/HelpCenterTranslation'
import settingsCss from 'pages/settings/settings.less'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { DEPRECATED_getIntegrationsByTypes } from 'state/integrations/selectors'
import { getViewLanguage } from 'state/ui/helpCenter'

import { MAX_DESCRIPTION_LENGTH } from '../../constants'
import ContactCard from '../ContactCard'
import ChatCardAvatars from './ChatCardAvatars'
import {
    convertDaysToName,
    formatBusinessHoursByLocale,
    getTimezoneAbbreviation,
} from './formatting.utils'

import helpCenterContactViewCss from '../../HelpCenterContactView.less'
import css from './ChatApplication.less'

const ChatApplication = () => {
    const {
        data: { applications } = { applications: [] },
        isSuccess: hasFetchedApplications,
    } = useApplications()

    const {
        translation: { chatAppKey, contactInfo },
        updateTranslation,
    } = useHelpCenterTranslation()
    const chatIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes(IntegrationType.GorgiasChat),
    )

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
                    const chatApplicationId: number = parseInt(
                        chat.getIn(['meta', 'app_id']) as string,
                        10,
                    )
                    const chatAppKey =
                        applications.find(({ id }) => id === chatApplicationId)
                            ?.appKey || ''

                    let chatLanguageCodes = []

                    const chatMetaLanguages: LanguageItem[] = (
                        chat.getIn(
                            ['meta', 'languages'],
                            List(),
                        ) as List<LanguageItem>
                    ).toJS()

                    if (chatMetaLanguages.length) {
                        const primaryChatLanguage = chatMetaLanguages.find(
                            ({ primary }) => primary,
                        )?.language

                        const secondaryChatLanguages = chatMetaLanguages
                            .filter(({ primary }) => !primary)
                            .map(({ language }) => language)

                        chatLanguageCodes = [
                            primaryChatLanguage,
                            ...secondaryChatLanguages,
                        ]
                    } else {
                        const chatMetaLanguage = chat.getIn([
                            'meta',
                            'language',
                        ])

                        chatLanguageCodes = [chatMetaLanguage]
                    }

                    const chatLanguageNames = chatLanguageCodes.reduce(
                        (acc: string[], languageCode) => {
                            const chatLanguage =
                                GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find(
                                    (value) =>
                                        value?.get('value') === languageCode,
                                )

                            if (chatLanguage) {
                                return [...acc, chatLanguage.get('label')]
                            }

                            return acc
                        },
                        [],
                    )

                    const chatLanguagesLabel = chatLanguageNames.length
                        ? `(${chatLanguageNames.join(', ')})`
                        : ''

                    return {
                        label: (
                            <span>
                                {chatName} {chatLanguagesLabel}
                            </span>
                        ),
                        value: chatAppKey,
                        integrationId,
                    }
                }),
        [chatIntegrations, applications],
    )

    const [isDescriptionTooLong, setIsDescriptionTooLong] = useState(false)
    const businessHours = useAppSelector(getBusinessHoursSettings)
    const currentHelpCenterLanguage = useAppSelector(getViewLanguage)
    const { description: chatCardDescription, enabled } = contactInfo.chat

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

    const handleChatApplicationIdChange = (chatAppKey: string | null) => {
        updateTranslation({ chatAppKey })
    }

    const toggleChatEnabled = () => {
        handleChatApplicationIdChange(
            chatAppKey == null && chatOptions.length > 0
                ? chatOptions[0].value
                : null,
        )
    }

    const renderBusinessHours = () => {
        if (!businessHours) return null

        const { business_hours, timezone } = businessHours.data
        const timezoneAbbreviation = getTimezoneAbbreviation(timezone)

        return business_hours.map(({ days, from_time, to_time }) => (
            <span key={days}>
                <b>{convertDaysToName(days)}</b>&nbsp;
                {formatBusinessHoursByLocale(
                    from_time,
                    currentHelpCenterLanguage,
                )}{' '}
                -&nbsp;
                {formatBusinessHoursByLocale(
                    to_time,
                    currentHelpCenterLanguage,
                )}
                &nbsp;
                {timezoneAbbreviation}
            </span>
        ))
    }

    return (
        <section className={classnames(css.container, settingsCss.mb40)}>
            <div className={helpCenterContactViewCss.leftColumn}>
                <div className={css.leftColumn}>
                    <div className={css.heading}>
                        <div>
                            <h3>Chat</h3>
                            <p>
                                Allow customers to chat with you from the Help
                                Center.
                            </p>
                        </div>
                    </div>
                    <ToggleInput
                        isToggled={!!chatAppKey}
                        onClick={toggleChatEnabled}
                        isDisabled={chatOptions.length === 0}
                        className={css.toggle}
                        caption="This makes a chat widget visible for all Help Center pages."
                    >
                        Enable chat widget{' '}
                        <i
                            id="enable-chat-widget-info"
                            className={classnames(
                                'material-icons',
                                css.tooltipIcon,
                            )}
                        >
                            info_outline
                        </i>
                        <Tooltip
                            target="enable-chat-widget-info"
                            placement="top-start"
                            innerProps={{
                                popperClassName: css.tooltip,
                                innerClassName: css['tooltip-inner'],
                            }}
                            arrowClassName={css['tooltip-arrow']}
                        >
                            Hidden when Help Center is embedded to avoid
                            duplicate chats on your website
                        </Tooltip>
                    </ToggleInput>

                    {chatOptions.length === 0 && (
                        <div className={css['warning-no-chat']}>
                            <span className="float-right">
                                <Link to="/app/settings/channels/gorgias_chat">
                                    Create Chat
                                </Link>
                            </span>
                            <span
                                className={classnames(
                                    css['warning-icon'],
                                    'mr-2',
                                )}
                            >
                                <i className="material-icons">report_problem</i>
                            </span>
                            {`You don't have any existing chat integration. Please create one to enable.`}
                        </div>
                    )}

                    {chatOptions.length > 0 && (
                        <>
                            <Label
                                disabled={!chatAppKey}
                                className="control-label"
                                for="chatIntegrationValue"
                            >
                                Select chat integration
                            </Label>
                            <SelectField
                                id="chatIntegrationValue"
                                value={chatAppKey}
                                options={chatOptions}
                                onChange={(value) =>
                                    handleChatApplicationIdChange(
                                        value as string,
                                    )
                                }
                                placeholder="Select a chat"
                                fullWidth
                                disabled={
                                    !chatAppKey || !hasFetchedApplications
                                }
                                icon="forum"
                            />
                        </>
                    )}

                    <div className={css.chatContactCard}>
                        <ToggleInput
                            className={css.toggle}
                            isToggled={enabled}
                            onClick={handleChange('enabled')}
                            aria-label="Enable chat contact card"
                            isDisabled={!chatAppKey}
                        >
                            Chat contact card{' '}
                            <i
                                id="chat-contact-card-info"
                                className={classnames(
                                    'material-icons',
                                    css.tooltipIcon,
                                )}
                            >
                                info_outline
                            </i>
                            <Tooltip
                                target="chat-contact-card-info"
                                placement="top-start"
                                innerProps={{
                                    popperClassName: css.tooltip,
                                    innerClassName: css['tooltip-inner'],
                                }}
                                arrowClassName={css['tooltip-arrow']}
                            >
                                Hidden when Help Center is embedded to avoid
                                duplicate chats on your website
                            </Tooltip>
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
