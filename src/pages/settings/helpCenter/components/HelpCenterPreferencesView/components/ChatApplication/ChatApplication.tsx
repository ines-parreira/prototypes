import React, {useEffect, useMemo, useState} from 'react'
import {FormText, Label} from 'reactstrap'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'
import classNames from 'classnames'
import {Link} from 'react-router-dom'

import ToggleButton from '../../../../../../common/components/ToggleButton'
import {
    HelpCenter,
    Locale,
    LocaleCode,
} from '../../../../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../../../../models/helpCenter/utils'

import SelectField from '../../../../../../common/forms/SelectField/SelectField'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

import {getLocaleSelectOptions} from '../../../../utils/localeSelectOptions'
import {getIntegrationsByTypes} from '../../../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../../../models/integration/types'

import css from './ChatApplication.less'

type Props = {
    helpCenter: HelpCenter
    availableLocales: Locale[]
    viewLanguage: LocaleCode
    onChangeLocale: (value: LocaleCode) => void
}

export const ChatApplication = ({
    helpCenter,
    availableLocales,
    viewLanguage,
    onChangeLocale,
}: Props): JSX.Element => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()
    const currentChatApplicationId = preferences.translation.chat_application_id

    const chatIntegrations = useSelector(
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
                .map((chat: Map<any, any>) => ({
                    label: chat.get('name') as string,
                    value: parseInt(
                        chat.getIn(['meta', 'app_id']) as string,
                        10
                    ),
                })),
        [chatIntegrations]
    )

    const [chatEnabled, setChatEnabled] = useState(
        currentChatApplicationId !== null &&
            currentChatApplicationId !== undefined
    )

    useEffect(() => {
        setChatEnabled(
            currentChatApplicationId !== null &&
                currentChatApplicationId !== undefined &&
                chatOptions.length > 0
        )
    }, [chatOptions, currentChatApplicationId])

    const supportedLocales = useMemo(
        () =>
            getLocaleSelectOptions(
                availableLocales,
                helpCenter.supported_locales
            ),
        [availableLocales, helpCenter.supported_locales]
    )

    const handleOnChangeLocale = (value: React.ReactText) => {
        onChangeLocale(validLocaleCode(value))
    }

    useEffect(() => {
        const translation = helpCenter.translations?.find(
            (t) => t.locale === viewLanguage
        )

        if (translation) {
            updatePreferences({translation})
        }
    }, [helpCenter, viewLanguage])

    const onEditChatApplication = (chatApplicationId: number | null) => {
        updatePreferences({
            translation: {
                ...preferences.translation,
                chat_application_id: chatApplicationId,
            },
        })
    }

    const switchChatEnabled = () => {
        let updatedChatApplicationId: number | null = null

        if (
            (currentChatApplicationId === undefined ||
                currentChatApplicationId === null) &&
            chatOptions.length > 0
        ) {
            updatedChatApplicationId = chatOptions[0].value
        }

        onEditChatApplication(updatedChatApplicationId)
    }

    return (
        <section>
            <div className={css.heading}>
                <div>
                    <h3>Chat Widget</h3>
                    <p>
                        This chat integration is going to be displayed as a
                        widget on every page of your help center.
                    </p>
                </div>
                <SelectField
                    value={viewLanguage}
                    onChange={handleOnChangeLocale}
                    options={supportedLocales}
                    style={{display: 'inline-block'}}
                />
            </div>

            <div className="d-flex mt-4">
                <ToggleButton
                    value={!!currentChatApplicationId}
                    onChange={switchChatEnabled}
                    disabled={chatOptions.length === 0}
                />
                <Label
                    className="control-label ml-2"
                    onClick={switchChatEnabled}
                >
                    Enable chat widget
                </Label>
            </div>

            <p>This makes a chat widget visible for all help center pages.</p>

            {chatOptions.length === 0 ? (
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
            ) : null}

            {chatEnabled ? (
                <>
                    <div className={classNames(css['label'], 'mt-4', 'mb-2')}>
                        Chat selection
                    </div>

                    <SelectField
                        placeholder="Select a chat"
                        value={currentChatApplicationId}
                        options={chatOptions}
                        fullWidth
                        onChange={(value) =>
                            onEditChatApplication(value as number)
                        }
                    />

                    <FormText color="muted">
                        Chat that's going to be triggered when clicking here
                    </FormText>
                </>
            ) : null}
        </section>
    )
}
