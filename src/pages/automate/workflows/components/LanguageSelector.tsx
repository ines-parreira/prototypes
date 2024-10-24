import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo, useRef, useState} from 'react'
import {ReactCountryFlag} from 'react-country-flag'

import {FeatureFlagKey} from 'config/featureFlags'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import {
    LanguageCode,
    supportedLanguages,
} from '../models/workflowConfiguration.types'
import css from './WorkflowLanguageSelect.less'

type Props = {
    selected: LanguageCode
    languages: LanguageCode[]
    onSelect: (localeCode: LanguageCode) => void
}

const unsupportedLanguageCodes = ['en-GB', 'fi-FI', 'ja-JP', 'pt-BR']
export default function LanguageSelector({
    selected,
    languages,
    onSelect,
}: Props) {
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const enableNewLanguages = useFlags()[FeatureFlagKey.EnableNewLanguages]

    const filteredLanguages = useMemo(() => {
        let options = supportedLanguages.filter(({code}) =>
            languages.includes(code)
        )

        if (!enableNewLanguages) {
            options = options.filter(
                ({code}) => !unsupportedLanguageCodes.includes(code)
            )
        }
        return options
    }, [languages, enableNewLanguages])

    return (
        <>
            <div
                ref={targetRef}
                onClick={() => setIsSelectOpen((v) => !v)}
                className={css.select}
            >
                <div className={css.grow}>
                    <ReactCountryFlag
                        countryCode={selected.split('-')[1]}
                        className={css.countryFlag}
                    />
                    {
                        supportedLanguages.find(({code}) => code === selected)
                            ?.label
                    }
                </div>
                <i className={classNames('material-icons', css.arrowDown)}>
                    arrow_drop_down
                </i>
            </div>
            <Dropdown
                isOpen={isSelectOpen}
                onToggle={setIsSelectOpen}
                target={targetRef}
                value={selected}
            >
                <DropdownBody className={css.dropdownBody}>
                    {filteredLanguages.map(({code, label}) => (
                        <DropdownItem
                            key={code}
                            option={{
                                label,
                                value: code,
                            }}
                            onClick={(value) => {
                                onSelect(value)
                            }}
                            shouldCloseOnSelect
                        >
                            <div className={css.dropdownItem}>
                                <div className={css.grow}>
                                    <ReactCountryFlag
                                        countryCode={code.split('-')[1]}
                                        className={css.countryFlag}
                                    />
                                    {label}
                                </div>
                            </div>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
