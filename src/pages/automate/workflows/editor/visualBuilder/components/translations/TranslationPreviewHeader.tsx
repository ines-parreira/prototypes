import {Label} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {useRef, useState} from 'react'
import {ReactCountryFlag} from 'react-country-flag'

import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {supportedLanguages} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './TranslationPreviewHeader.less'

export default function TranslationPreviewHeader() {
    const {previewLanguageList, previewLanguage, setPreviewLanguage} =
        useTranslationsPreviewContext()
    const targetRef = useRef<HTMLDivElement>(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    if (previewLanguageList.length === 0) return null
    return (
        <div className={css.container}>
            <Label className={classNames(css.label, css.grow)}>
                Other languages
            </Label>
            <div
                ref={targetRef}
                onClick={() => setIsSelectOpen((v) => !v)}
                className={css.select}
            >
                <div className={classNames(css.selectOption, css.grow)}>
                    {previewLanguage && (
                        <>
                            <ReactCountryFlag
                                countryCode={previewLanguage.split('-')[1]}
                                className={css.countryFlag}
                            />
                            {
                                supportedLanguages.find(
                                    (l) => l.code === previewLanguage
                                )?.label
                            }
                        </>
                    )}
                </div>
                <i className={classNames('material-icons', css.arrowDown)}>
                    arrow_drop_down
                </i>
            </div>
            <Dropdown
                isOpen={isSelectOpen}
                onToggle={setIsSelectOpen}
                target={targetRef}
                value={previewLanguage}
            >
                <DropdownBody className={css.dropdownBody}>
                    {previewLanguageList.map((code) => (
                        <DropdownItem
                            key={code}
                            option={{
                                label:
                                    supportedLanguages.find(
                                        (l) => l.code === previewLanguage
                                    )?.label ?? '',
                                value: code,
                            }}
                            onClick={() => {
                                setPreviewLanguage(code)
                            }}
                            className={css.dropdownItem}
                            shouldCloseOnSelect
                        >
                            <div className={css.selectOption}>
                                <ReactCountryFlag
                                    countryCode={code.split('-')[1]}
                                    className={css.countryFlag}
                                />
                                {
                                    supportedLanguages.find(
                                        (l) => l.code === code
                                    )?.label
                                }
                            </div>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
