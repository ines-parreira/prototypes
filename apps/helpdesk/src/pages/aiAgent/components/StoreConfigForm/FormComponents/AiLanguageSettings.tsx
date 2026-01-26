import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { FormValues, UpdateValue } from 'pages/aiAgent/types'

import MacroEditLanguage from '../../../../tickets/common/macros/components/MacroEditLanguage'

import css from './AiLanguageSettings.less'

export type AiLanguageSettingsProps = {
    aiAgentLanguage?: string | null
    updateValue: UpdateValue<FormValues>
}

const AiLanguageSettings: React.FC<AiLanguageSettingsProps> = ({
    aiAgentLanguage,
    updateValue,
}) => {
    const languageMode = aiAgentLanguage ? 'specific' : 'customers'

    const handleLanguageModeChange = (mode: 'customers' | 'specific') => {
        if (mode === 'customers') {
            updateValue('aiAgentLanguage', null)
        } else {
            updateValue('aiAgentLanguage', 'English')
        }
    }

    const handleSpecificLanguageChange = (language: string | null) => {
        updateValue('aiAgentLanguage', language)
    }

    const newToneOfVoiceEnabled = useFlag(FeatureFlagKey.AiAgentToneOfVoice)

    const showDropdown = languageMode === 'specific'

    return (
        <div>
            {!newToneOfVoiceEnabled && <h3 className={css.title}>Language</h3>}
            <div className={css.radioContainer}>
                <label
                    htmlFor="language-mode-customers"
                    className={css.radioLabel}
                >
                    <input
                        id="language-mode-customers"
                        type="radio"
                        name="languageMode"
                        value="customers"
                        checked={languageMode === 'customers'}
                        onChange={() => handleLanguageModeChange('customers')}
                        className={css.radioInput}
                    />
                    AI Agent should reply in the same language as the customer
                </label>
                <label
                    htmlFor="language-mode-specific"
                    className={css.radioLabel}
                >
                    <input
                        id="language-mode-specific"
                        type="radio"
                        name="languageMode"
                        value="specific"
                        checked={languageMode === 'specific'}
                        onChange={() => handleLanguageModeChange('specific')}
                        className={css.radioInput}
                    />
                    AI Agent should only reply in the following language
                </label>
            </div>
            {showDropdown && (
                <div className={css.dropdownContainer}>
                    <div className={css.dropdownWrapper}>
                        <MacroEditLanguage
                            language={aiAgentLanguage ?? null}
                            setLanguage={handleSpecificLanguageChange}
                            hideAutoDetect={true}
                            returnLanguageName={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default AiLanguageSettings
