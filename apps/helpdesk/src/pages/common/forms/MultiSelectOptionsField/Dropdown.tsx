import { ComponentType, useState } from 'react'

import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _max from 'lodash/max'
import _min from 'lodash/min'
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

import Input from './Input'
import Menu from './Menu'
import { Option } from './types'

import css from './Dropdown.less'

type Props = {
    id?: string
    placeholder: string
    value: string
    options: Option[]
    isFocused: boolean
    isLoading?: boolean
    onChange: (option: string) => void
    onFocus: () => void
    onBlur: () => void
    onSelect: (option: Option) => void
    onDelete: () => void
    menu?: ComponentType<{ className?: string }>
    isCompact?: boolean
}

export default function Dropdown(props: Props) {
    const {
        menu: CustomDropdownMenu = DropdownMenu,
        isLoading = false,
        isFocused,
        options,
        value,
        onChange,
        onFocus,
        onBlur,
        onSelect,
        onDelete,
        placeholder,
        isCompact,
        id,
    } = props

    const [previousOptions, setPreviousOptions] = useState(options)
    const [activeIndex, setActiveIndex] = useState(0)

    if (!_isEqual(previousOptions, options)) {
        setActiveIndex(0)
        setPreviousOptions(options)
    }

    const handleInputSubmit = () => {
        const option = options[activeIndex]

        if (option) {
            onSelect(option)
        }
    }

    const handleInputUp = () => {
        setActiveIndex(_max([activeIndex - 1, 0])!)
    }

    const handleInputDown = () => {
        setActiveIndex(_min([activeIndex + 1, options.length - 1])!)
    }

    const handleOptionActivate = (index: number) => {
        setActiveIndex(index)
    }

    return (
        <div
            className={classnames(
                css.inputContainer,
                'multiSelectOptionField-dropdown',
                {
                    [css.compact]: isCompact,
                },
            )}
        >
            <UncontrolledDropdown
                isOpen={isFocused && (!!options.length || !!value)}
            >
                <DropdownToggle tag="div" data-toggle="dropdown">
                    <Input
                        id={id}
                        placeholder={placeholder}
                        value={value}
                        isFocused={isFocused}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onSubmit={handleInputSubmit}
                        onUp={handleInputUp}
                        onDown={handleInputDown}
                        onDelete={onDelete}
                        onChange={onChange}
                        isCompact={isCompact}
                    />
                </DropdownToggle>
                <CustomDropdownMenu className={css.options}>
                    <Menu
                        isLoading={isLoading}
                        options={options}
                        activeIndex={activeIndex}
                        onActivate={handleOptionActivate}
                        onSelect={onSelect}
                    />
                </CustomDropdownMenu>
            </UncontrolledDropdown>
        </div>
    )
}
