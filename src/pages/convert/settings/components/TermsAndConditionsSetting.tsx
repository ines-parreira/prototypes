import React, {useCallback, useEffect, useMemo} from 'react'
import classnames from 'classnames'
import {EditorState} from 'draft-js'
import {fromJS, Map} from 'immutable'
import {convertToHTML, convertFromHTML} from 'utils/editor'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import ToggleInput from 'pages/common/forms/ToggleInput'
import RichField from 'pages/common/forms/RichField/RichField'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {ErrorMessage} from 'pages/convert/settings/components/styled'
import CheckBox from 'pages/common/forms/CheckBox'
import {DisclaimerSettings} from 'pages/convert/settings/types'
import {mapIntegrationLanguagesToLanguagePicker} from 'config/integrations/gorgias_chat'
import {sanitizeHtmlDefault} from 'utils/html'
import css from './TermsAndConditionsSetting.less'

type TermsAndConditionsSettingProps = {
    disclaimerSettings: DisclaimerSettings
    onDisclaimerSettingsChange: (
        arg0: (state: DisclaimerSettings) => DisclaimerSettings
    ) => void
    onErrorChange: (value: boolean) => void
    chatIntegration: Map<any, any>
}

const defaultDisclaimerMessage =
    'By entering the email address above, you opt in to receive marketing emails from us. You can unsubscribe at any time.'

export const TermsAndConditionsSetting = ({
    disclaimerSettings,
    onDisclaimerSettingsChange,
    onErrorChange,
    chatIntegration,
}: TermsAndConditionsSettingProps) => {
    const selectedDisclaimer = useMemo(
        () =>
            disclaimerSettings.disclaimerMap[
                disclaimerSettings.selectedLanguage
            ] ?? defaultDisclaimerMessage,
        [disclaimerSettings]
    )

    const selectedDisclaimerPureText = useMemo(() => {
        const blocksFromHtml = convertFromHTML(selectedDisclaimer)
        return blocksFromHtml.getPlainText()
    }, [selectedDisclaimer])

    const disclaimerMaxLength = 280

    const [onError, errorMessage] = useMemo(() => {
        if (
            disclaimerSettings.disclaimerEnabled &&
            selectedDisclaimerPureText.length > disclaimerMaxLength
        ) {
            return [
                true,
                `The disclaimer should be under or equals to ${disclaimerMaxLength} characters.`,
            ]
        }
        return [false, '']
    }, [
        disclaimerSettings.disclaimerEnabled,
        selectedDisclaimerPureText.length,
    ])

    const onSelectedLanguageChange = useCallback(
        (value: string) => {
            onDisclaimerSettingsChange((state: DisclaimerSettings) => ({
                ...state,
                selectedLanguage: value,
            }))
        },
        [onDisclaimerSettingsChange]
    )

    const onDisclaimerEnabledChange = (value: boolean) => {
        onDisclaimerSettingsChange((state: DisclaimerSettings) => ({
            ...state,
            disclaimerEnabled: value,
        }))
    }

    const onDisclaimerMapChange = (value: EditorState) => {
        onDisclaimerSettingsChange((state: DisclaimerSettings) => {
            const newState = {...state}

            let html = convertToHTML(value.getCurrentContent())

            // Sanitize the HTML to remove unwanted tags coming from draftjs.
            // This is commonly done in the Helpdesk when extracting the HTML from the rich text editor.
            // This one is especially useful to add `noreferrer noopener` to links.
            html = sanitizeHtmlDefault(html)

            // `TicketRichField` component can return a value of '<div><br></div>'/'<div><br /></div>' when the user deletes all the text.
            if (html === `<div><br></div>'` || html === '<div><br /></div>') {
                html = ''
            }

            newState.disclaimerMap[disclaimerSettings.selectedLanguage] = html
            return newState
        })
    }

    const onPreSelectDisclaimerChange = (value: boolean) => {
        onDisclaimerSettingsChange((state: DisclaimerSettings) => ({
            ...state,
            preSelectDisclaimer: value,
        }))
    }

    useEffect(() => {
        onErrorChange(onError)
    }, [onError, onErrorChange])

    const languageOptions = mapIntegrationLanguagesToLanguagePicker(
        fromJS(chatIntegration)
    )
    const defaultLanguage = useMemo(
        () =>
            languageOptions.filter((language) => language.isDefault)[0] ||
            languageOptions[0],
        [languageOptions]
    )

    useEffect(() => {
        onSelectedLanguageChange(defaultLanguage.value)
    }, [defaultLanguage.value, onSelectedLanguageChange])

    return (
        <div className={css.settingSection}>
            <div className={css.headingSection}>
                <span className={'heading-section-semibold'}>
                    Privacy Policy Disclaimer
                </span>
                <span className={'body-regular'}>
                    Add privacy policy disclaimers to your store.
                </span>
            </div>

            <div
                className={classnames(css.bodySection, {
                    [css.disabled]: !disclaimerSettings.disclaimerEnabled,
                })}
            >
                <ToggleInput
                    isToggled={disclaimerSettings.disclaimerEnabled}
                    onClick={onDisclaimerEnabledChange}
                >
                    Email privacy policy disclaimer
                </ToggleInput>
                {disclaimerSettings.disclaimerEnabled && (
                    <>
                        <div className={css.editorTabs}>
                            <div className={onError ? css.tabsDisabled : ''}>
                                <TabNavigator
                                    activeTab={
                                        disclaimerSettings.selectedLanguage
                                    }
                                    onTabChange={onSelectedLanguageChange}
                                    tabs={languageOptions}
                                />
                            </div>
                            <div>
                                <RichField
                                    key={disclaimerSettings.selectedLanguage}
                                    onChange={onDisclaimerMapChange}
                                    value={{
                                        html: selectedDisclaimer,
                                        text: selectedDisclaimer,
                                    }}
                                    isRequired={
                                        disclaimerSettings.disclaimerEnabled
                                    }
                                    canInsertInlineImages={false}
                                    displayedActions={[
                                        ActionName.Bold,
                                        ActionName.Italic,
                                        ActionName.Underline,
                                        ActionName.Link,
                                        ActionName.Emoji,
                                    ]}
                                    maxLength={disclaimerMaxLength}
                                    className={classnames(css.richField, {
                                        [css.onError]: onError,
                                    })}
                                />
                                {onError && (
                                    <ErrorMessage>{errorMessage}</ErrorMessage>
                                )}
                            </div>
                        </div>
                        <CheckBox
                            isChecked={disclaimerSettings.preSelectDisclaimer}
                            onChange={onPreSelectDisclaimerChange}
                        >
                            Pre-select sign-up option
                        </CheckBox>
                    </>
                )}
            </div>
        </div>
    )
}
