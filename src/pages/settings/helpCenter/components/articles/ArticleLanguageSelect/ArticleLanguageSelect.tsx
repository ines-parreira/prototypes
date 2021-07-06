import classNames from 'classnames'
import React from 'react'

import {useOpenToggle} from '../../../../../common/hooks/useOpenToggle'

import css from './ArticleLanguageSelect.less'

type OptionItem = {
    label: string | React.ReactNode
    value: string
    isComplete?: boolean
}

type Props = {
    selected?: string | React.ReactNode
    list?: OptionItem[]
    onSelect: (ev: React.MouseEvent, value: string) => void
}

export const ArticleLanguageSelect = ({
    selected,
    list = [],
    onSelect,
}: Props): JSX.Element => {
    const $ref = React.createRef<HTMLDivElement>()
    const {isOpen, onOpen, onClose} = useOpenToggle($ref, false)

    const selectedOption = React.useMemo(() => {
        return list.find((option) => option.value === selected) || null
    }, [selected])

    const renderStatusIcon = (option: OptionItem) => {
        return (
            <span
                className={classNames(css.status, 'material-icons', {
                    [css.completed]: option.isComplete,
                })}
            >
                {option.isComplete ? 'done' : 'add'}
            </span>
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
                <span>{selectedOption?.label}</span>
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
                                <span>{option.label}</span>
                                {renderStatusIcon(option)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
