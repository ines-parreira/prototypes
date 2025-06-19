import React, { useState } from 'react'

import { ISO639English } from 'constants/languages'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import { detectLanguage } from 'models/language/resources'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'

import css from './MacroEdit.less'

type Props = {
    text?: string
    language: string | null
    setLanguage: (language: string | null) => void
    hideAutoDetect?: boolean
    returnLanguageName?: boolean
}

const AUTODETECT = ''
const NO_LANGUAGE = 'null'

const MacroEditLanguage = ({
    text,
    language,
    setLanguage,
    hideAutoDetect,
    returnLanguageName = false,
}: Props) => {
    const [autoDetect, setAutoDetect] = useState(false)

    useDebouncedEffect(
        () => {
            if (
                hideAutoDetect ||
                !text ||
                text.length < 10 ||
                (!autoDetect && language !== AUTODETECT)
            )
                return
            setAutoDetect(true)

            void detectLanguage(text).then((language) => {
                if (language) setLanguage(language)
            })
        },
        [text, autoDetect, hideAutoDetect],
        1000,
    )

    const decorate = (text: string) => (
        <>
            <span className="material-icons mr-1">auto_awesome</span>
            {text}
        </>
    )

    const languages: { [language: string]: string | JSX.Element } = {
        [NO_LANGUAGE]: <span className="text-muted">- No language -</span>,
        ...(hideAutoDetect ? {} : { [AUTODETECT]: decorate('Auto detect') }),
        ...ISO639English,
    }

    if (language && autoDetect) {
        delete languages[AUTODETECT]
        languages[language] = decorate(ISO639English[language])
    }

    // Create a reverse mapping of language names to codes
    const languageNameToCode: { [name: string]: string } = {}
    Object.entries(ISO639English).forEach(([code, name]) => {
        languageNameToCode[name] = code
    })

    // Find the code for the current language if it's a name
    const currentLanguageCode =
        language && language in ISO639English
            ? language
            : language && language in languageNameToCode
              ? languageNameToCode[language]
              : language

    return (
        <SelectField
            className={
                autoDetect && language !== AUTODETECT
                    ? css.languageDetected
                    : ''
            }
            value={currentLanguageCode ?? NO_LANGUAGE}
            placeholder="Select a language"
            fullWidth
            fixedWidth
            onChange={(value: Value) => {
                setAutoDetect(!hideAutoDetect && value === AUTODETECT)
                const newValue =
                    value === NO_LANGUAGE ? null : (value as string)

                if (returnLanguageName) {
                    // If we want to return the language name, we need to find the code first
                    const selectedCode =
                        newValue &&
                        (newValue in ISO639English
                            ? newValue
                            : languageNameToCode[newValue])
                    if (selectedCode) {
                        setLanguage(ISO639English[selectedCode])
                    } else {
                        setLanguage(newValue)
                    }
                } else {
                    // If we want to return the code, we need to find the code from the name if needed
                    const selectedCode =
                        newValue &&
                        (newValue in ISO639English
                            ? newValue
                            : languageNameToCode[newValue])
                    setLanguage(selectedCode || newValue)
                }
            }}
            options={Object.entries(languages).map(([key, value]) => ({
                value: key,
                label: value,
            }))}
        />
    )
}

export default MacroEditLanguage
