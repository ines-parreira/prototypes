import React, {useState} from 'react'
import {useDebounce} from 'react-use'

import {detectLanguage} from 'models/language/resources'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {ISO639English} from 'constants/languages'
import {Value} from 'pages/common/forms/SelectField/types'

import css from './MacroEdit.less'

type Props = {
    text?: string
    language: string | null
    setLanguage: (language: string | null) => void
}

const AUTODETECT = ''
const NO_LANGUAGE = 'null'

const MacroEditLanguage = ({text, language, setLanguage}: Props) => {
    const [autoDetect, setAutoDetect] = useState(false)

    useDebounce(
        () => {
            if (
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
        1000,
        [text, autoDetect]
    )

    const decorate = (text: string) => (
        <>
            <span className="material-icons mr-1">auto_awesome</span>
            {text}
        </>
    )

    const languages: {[language: string]: string | JSX.Element} = {
        [NO_LANGUAGE]: <span className="text-muted">- No language -</span>,
        [AUTODETECT]: decorate('Auto detect'),
        ...ISO639English,
    }

    if (language && autoDetect) {
        delete languages[AUTODETECT]
        languages[language] = decorate(ISO639English[language])
    }

    return (
        <SelectField
            className={
                autoDetect && language !== AUTODETECT
                    ? css.languageDetected
                    : ''
            }
            value={language ?? NO_LANGUAGE}
            placeholder="Select a language"
            fullWidth
            fixedWidth
            onChange={(value: Value) => {
                setAutoDetect(value === AUTODETECT)
                setLanguage(value === NO_LANGUAGE ? null : (value as string))
            }}
            options={Object.entries(languages).map(([key, value]) => ({
                value: key,
                label: value,
            }))}
        />
    )
}

export default MacroEditLanguage
