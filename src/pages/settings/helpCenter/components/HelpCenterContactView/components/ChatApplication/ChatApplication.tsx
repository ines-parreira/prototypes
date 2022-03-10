import React, {useMemo} from 'react'
import classNames from 'classnames'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {FormText, Label} from 'reactstrap'

import {GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS} from 'config/integrations/gorgias_chat'
import {IntegrationType} from 'models/integration/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import helpCenterContactViewCss from '../../HelpCenterContactView.less'

import css from './ChatApplication.less'

const ChatApplication: React.FC = () => {
    const {
        translation: {chatApplicationId},
        updateTranslation,
    } = useHelpCenterTranslation()
    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.GorgiasChat)
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
            <p>This makes a chat widget visible for all help center pages.</p>

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
        </section>
    )
}

export default ChatApplication
