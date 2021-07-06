import React from 'react'

import {
    HelpCenterLocale,
    HelpCenterLocaleCode,
} from '../../../../../models/helpCenter/types'
import InputField from '../../../../common/forms/InputField.js'

const getEmojiFlag = (code: string) => {
    const flagEmojiMap: {[key: string]: string} = {
        'en-us': '🇺🇸',
        'fr-fr': '🇫🇷',
        'fr-ca': '🇨🇦',
        'cs-cz': '🇨🇿',
        'da-dk': '🇩🇰',
        'nl-nl': '🇳🇱',
        'de-de': '🇩🇪',
        'it-it': '🇮🇹',
        'no-no': '🇳🇴',
        'es-es': '🇪🇸',
        'sv-se': '🇸🇪',
    }

    return flagEmojiMap[code.toLowerCase()] || ''
}

type Props = {
    className?: string
    label?: string
    value: string
    options: HelpCenterLocale[]
    onChange: (newDefaultLocale: HelpCenterLocaleCode) => void
}

export const LanguageSelect = ({
    value,
    options,
    onChange,
    label,
    className,
}: Props) => {
    return (
        <InputField
            type="select"
            value={value}
            options={options}
            onChange={onChange}
            className={className}
            label={label}
        >
            {options.map(({code, name}) => (
                <option key={code} value={code}>
                    {`${getEmojiFlag(code)} ${name}`}
                </option>
            ))}
        </InputField>
    )
}

export default LanguageSelect
