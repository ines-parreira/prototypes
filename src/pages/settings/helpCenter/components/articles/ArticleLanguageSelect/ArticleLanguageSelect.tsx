import React, {createRef, useMemo} from 'react'
import classnames from 'classnames'

import {LocaleCode} from 'models/helpCenter/types'
import {useOpenToggle} from 'pages/common/hooks/useOpenToggle'

import {ActionButton} from './components/ActionButton'

import css from './ArticleLanguageSelect.less'

export type ActionType = 'delete' | 'view' | 'create'

export type OptionItem = {
    label: string | React.ReactNode
    value: LocaleCode
    text: string
    isComplete?: boolean
    canBeDeleted?: boolean
}

type Props = {
    selected?: LocaleCode
    list?: OptionItem[]
    onSelect: (localeCode: LocaleCode) => void
    onActionClick: (action: ActionType, currentOption: OptionItem) => void
    className?: string
}

export const ArticleLanguageSelect = ({
    selected,
    list = [],
    onSelect,
    onActionClick,
    className,
}: Props): JSX.Element => {
    const $ref = createRef<HTMLDivElement>()
    const {isOpen, onOpen, onClose} = useOpenToggle($ref, false)

    const selectedOption = useMemo(
        () => list.find((option) => option.value === selected) || null,
        [selected, list]
    )

    const handleOnSelect = (option: OptionItem) => {
        onSelect(option.value)
        onClose()
    }

    const renderActions = (option: OptionItem) => {
        const handleOnClickAction =
            (action: ActionType) => (event: React.MouseEvent) => {
                event.stopPropagation()
                onActionClick(action, option)
            }

        if (option.isComplete) {
            return (
                <div className={css.actions}>
                    {option.canBeDeleted && (
                        <ActionButton
                            className="mr-4"
                            variant="danger"
                            help="Delete language version"
                            onClick={handleOnClickAction('delete')}
                        >
                            delete
                        </ActionButton>
                    )}
                    <ActionButton
                        variant="neutral"
                        onClick={() => handleOnSelect(option)}
                    >
                        view
                    </ActionButton>
                </div>
            )
        }
        return (
            <div className={css.actions}>
                <ActionButton
                    help="Add language version"
                    onClick={() => handleOnSelect(option)}
                >
                    create
                </ActionButton>
            </div>
        )
    }

    return (
        <div ref={$ref} className={classnames(css.wrapper, className)}>
            <button
                data-testid="dropdown-select-trigger"
                className={css.trigger}
                onClick={onOpen}
            >
                <span className={css.label}>{selectedOption?.label}</span>
                <span className="material-icons">arrow_drop_down</span>
            </button>
            {isOpen && (
                <div
                    data-testid="dropdown-options"
                    className={classnames(css.dropdown, 'dropdown-options')}
                >
                    <ul>
                        {list.map((option) => (
                            <li
                                key={option.value}
                                data-testid={`option-${option.value}`}
                                onClick={() => handleOnSelect(option)}
                            >
                                <span className={css.label}>
                                    {option.label}
                                </span>
                                {renderActions(option)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
