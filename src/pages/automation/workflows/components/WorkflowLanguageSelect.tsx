import React, {useCallback, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import {ReactCountryFlag} from 'react-country-flag'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Button from 'pages/common/components/button/Button'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import {
    LanguageCode,
    supportedLanguages,
} from '../models/workflowConfiguration.types'

import css from './WorkflowLanguageSelect.less'

type Props = {
    selected: LanguageCode
    available: LanguageCode[]
    onSelect: (localeCode: LanguageCode) => void
    onDelete: (localeCode: LanguageCode) => void
    className?: string
}

export default function WorkflowLanguageSelect({
    selected,
    available,
    onSelect,
    onDelete,
}: Props) {
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const [floatingElement, setFloatingElement] = useState<HTMLElement | null>(
        null
    )
    const onFloatingRefChange = useCallback((node: HTMLElement | null) => {
        setFloatingElement(node)
    }, [])
    const sortedLanguages = useMemo(
        () => [
            ...supportedLanguages.filter(({code}) => available.includes(code)),
            ...supportedLanguages.filter(({code}) => !available.includes(code)),
        ],
        [available]
    )

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
                ref={onFloatingRefChange}
                isOpen={isSelectOpen}
                onToggle={setIsSelectOpen}
                target={targetRef}
                value={selected}
            >
                <DropdownBody className={css.dropdownBody}>
                    {sortedLanguages.map(({code, label}) => (
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
                                {(available.length >= 2 ||
                                    selected !== code) && (
                                    <div className={css.actions}>
                                        {available.includes(code) ? (
                                            <ConfirmationPopover
                                                buttonProps={{
                                                    intent: 'destructive',
                                                }}
                                                title={`Delete ${label}?`}
                                                content="Deleting will erase all content in this language, including saved and published content.
                                                This action cannot be undone."
                                                onConfirm={() => {
                                                    onDelete(code)
                                                    setIsSelectOpen(false)
                                                }}
                                                onCancel={() => {
                                                    setIsSelectOpen(false)
                                                }}
                                                confirmLabel="Delete"
                                                cancelButtonProps={{
                                                    intent: 'secondary',
                                                    value: 'Keep',
                                                }}
                                                showCancelButton
                                                containerElement={
                                                    floatingElement?.parentElement ??
                                                    undefined
                                                }
                                            >
                                                {({
                                                    uid,
                                                    onDisplayConfirmation,
                                                }) => (
                                                    <Button
                                                        id={uid}
                                                        fillStyle="ghost"
                                                        intent="destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onDisplayConfirmation()
                                                        }}
                                                        size="small"
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </ConfirmationPopover>
                                        ) : (
                                            <Button
                                                fillStyle="ghost"
                                                intent="primary"
                                                onClick={() => {
                                                    onSelect(code)
                                                    setIsSelectOpen(false)
                                                }}
                                                size="small"
                                            >
                                                Create
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
