import React, {useMemo} from 'react'
import classNames from 'classnames'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {FormText, Label} from 'reactstrap'

import warningIcon from 'assets/img/icons/warning2.svg'

import {GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS} from 'config/integrations/gorgias_chat'
import {IntegrationType} from 'models/integration/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {AlertType} from 'pages/common/components/Alert/Alert'
import {useChatHelpCenterConfiguration} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfService/hooks'
import helpCenterContactViewCss from '../../HelpCenterContactView.less'

import css from './ChatApplication.less'

type Props = {
    helpCenterId: number
}

const ChatApplication: React.FC<Props> = ({helpCenterId}) => {
    const {
        translation: {chatApplicationId},
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

    const handleChange = (chatApplicationId: number | null) => {
        updateTranslation({chatApplicationId})
    }

    const toggleChatEnabled = () => {
        handleChange(
            chatApplicationId == null && chatOptions.length > 0
                ? chatOptions[0].value
                : null
        )
    }

    const chatIntegrationId = chatOptions.find(
        (el) => el.value === chatApplicationId
    )?.integrationId

    const chatHelpCenterMismatch =
        chatHelpCenterConfiguration !== null &&
        chatHelpCenterConfiguration.enabled &&
        chatHelpCenterConfiguration.help_center_id !== helpCenterId

    return (
        <section className={helpCenterContactViewCss.leftColumn}>
            <ToggleInput
                isToggled={!!chatApplicationId}
                onClick={toggleChatEnabled}
                isDisabled={chatOptions.length === 0}
                className={css.toggle}
            >
                Enable chat widget
            </ToggleInput>
            <p>This makes a chat widget visible for all Help Center pages.</p>

            {chatOptions.length === 0 && (
                <div className={css['warning-no-chat']}>
                    <span className="float-right">
                        <Link to="/app/settings/integrations/gorgias_chat">
                            Create Chat
                        </Link>
                    </span>
                    <span className={classNames(css['warning-icon'], 'mr-2')}>
                        <i className="material-icons">report_problem</i>
                    </span>
                    You don't have any existing chat integration. Please create
                    one to enable.
                </div>
            )}

            {chatApplicationId != null && chatOptions.length > 0 && (
                <>
                    <Label className="control-label">Chat selection</Label>
                    <SelectField
                        value={chatApplicationId}
                        options={chatOptions}
                        onChange={(value) => handleChange(value as number)}
                        placeholder="Select a chat"
                        fullWidth
                    />

                    <FormText color="muted">
                        Chat that's going to be triggered when clicking here
                    </FormText>
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
                            The selected chat integration is using a different
                            Help Center for article recommendations.
                        </p>
                    </div>
                </LinkAlert>
            )}
        </section>
    )
}

export default ChatApplication
