import React from 'react'

import {LocaleCode} from '../../../../../../models/helpCenter/types'
import {useOpenToggle} from '../../../../../common/hooks/useOpenToggle'

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
    onSelect: (ev: React.MouseEvent, value: LocaleCode) => void
    // TODO: Remove the optional flag once the articles and categories are using this
    onClickAction?: (
        ev: React.MouseEvent,
        action: ActionType,
        currentOption: OptionItem
    ) => void
}

export const ArticleLanguageSelect = ({
    selected,
    list = [],
    onSelect,
    onClickAction,
}: Props): JSX.Element => {
    const $ref = React.createRef<HTMLDivElement>()
    const {isOpen, onOpen, onClose} = useOpenToggle($ref, false)

    const selectedOption = React.useMemo(() => {
        return list.find((option) => option.value === selected) || null
    }, [selected, list])

    const handleOnClickAction = React.useCallback(
        (
            ev: React.MouseEvent,
            action: ActionType,
            currentOption: OptionItem
        ) => {
            onClickAction && onClickAction(ev, action, currentOption)
        },
        [onClickAction]
    )

    const renderActions = (option: OptionItem) => {
        if (option.isComplete) {
            return (
                <div className={css.actions}>
                    {option.canBeDeleted && (
                        <ActionButton
                            className="mr-4"
                            variant="danger"
                            help="Delete language version"
                            onClick={(ev) =>
                                handleOnClickAction(ev, 'delete', option)
                            }
                        >
                            delete
                        </ActionButton>
                    )}
                    <ActionButton
                        variant="neutral"
                        onClick={(ev) =>
                            handleOnClickAction(ev, 'view', option)
                        }
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
                    onClick={(ev) => handleOnClickAction(ev, 'create', option)}
                >
                    create
                </ActionButton>
            </div>
        )
    }

    const handleOnSelect = (
        ev: React.MouseEvent<HTMLLIElement>,
        option: OptionItem
    ) => {
        onSelect && onSelect(ev, option.value)
        onClose()
    }

    return (
        <div ref={$ref} className={css.wrapper}>
            <button
                data-testid="dropdown-select-trigger"
                className={css.trigger}
                onClick={onOpen}
            >
                <span className={css.label}>{selectedOption?.label}</span>
                <span className="material-icons">arrow_drop_down</span>
            </button>
            {isOpen && (
                <div data-testid="dropdown-options" className={css.dropdown}>
                    <ul>
                        {list.map((option) => (
                            <li
                                key={option.value}
                                data-testid={`option-${option.value}`}
                                onClick={(ev) => handleOnSelect(ev, option)}
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
