import { useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classNames from 'classnames'
import { ReactCountryFlag } from 'react-country-flag'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import type { LanguageCode } from '../models/workflowConfiguration.types'
import { supportedLanguages } from '../models/workflowConfiguration.types'

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
    const enableNewLanguages = useFlag(FeatureFlagKey.EnableNewLanguages)

    const sortedLanguages = useMemo(() => {
        let filteredLanguages = [
            ...supportedLanguages.filter(({ code }) =>
                available.includes(code),
            ),
            ...supportedLanguages.filter(
                ({ code }) => !available.includes(code),
            ),
        ]

        if (!enableNewLanguages) {
            const unsupportedCodes = ['en-GB', 'fi-FI', 'ja-JP', 'pt-BR']
            filteredLanguages = filteredLanguages.filter(
                ({ code }) => !unsupportedCodes.includes(code),
            )
        }
        return filteredLanguages
    }, [available, enableNewLanguages])
    const [
        languagePendingDeletionConfirmation,
        setLanguagePendingDeletionConfirmation,
    ] = useState<LanguageCode | undefined>(undefined)

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
                        supportedLanguages.find(({ code }) => code === selected)
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
                    {sortedLanguages.map(({ code, label }) => (
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
                                            <Button
                                                fillStyle="ghost"
                                                intent="destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setIsSelectOpen(false)
                                                    setLanguagePendingDeletionConfirmation(
                                                        code,
                                                    )
                                                }}
                                                size="small"
                                            >
                                                Delete
                                            </Button>
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
            <Modal
                isOpen={!!languagePendingDeletionConfirmation}
                onClose={() => {
                    setLanguagePendingDeletionConfirmation(undefined)
                }}
            >
                <ModalHeader
                    title={`Delete ${
                        supportedLanguages.find(
                            ({ code }) =>
                                code === languagePendingDeletionConfirmation,
                        )?.label ?? ''
                    }?`}
                />
                <ModalBody className={css.modalBody}>
                    Deleting will erase all content in this language. This
                    action cannot be undone after saving this flow.
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="destructive"
                        onClick={() => {
                            if (languagePendingDeletionConfirmation)
                                onDelete(languagePendingDeletionConfirmation)
                            setLanguagePendingDeletionConfirmation(undefined)
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        intent="secondary"
                        onClick={() => {
                            setLanguagePendingDeletionConfirmation(undefined)
                        }}
                    >
                        Keep
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
