import { useState } from 'react'

import classnames from 'classnames'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import InputField from 'pages/common/forms/input/InputField'

import css from './DropdownButtonWithSearch.less'

export interface Option {
    value: string
    label: string
}

interface DropdownButtonWithSearch {
    label: string
    /*
     * Material Icon to be displayed on the button toggle
     */
    materialIconLabel?: string
    options: any[]
    placeholder?: string
    variant: 'primary' | 'secondary' | 'none'
    /*
     * Whether to persist the dropdown menu on option selection
     */
    persist?: boolean
    displayResetSearchIcon?: boolean
    textNotFound?: string
    /*
     * Whether to display the dropdown menu with large width (272px)
     */
    withLargeMenu?: boolean
    disabled?: boolean
    onSelectOptionChange: (option: Option) => void
}

const DropdownButtonWithSearch: React.FC<DropdownButtonWithSearch> = (
    props,
) => {
    const [isOpen, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([])

    const handleOnToggle = () => {
        if (isOpen) {
            setSearch('')
        }
        setOpen(!isOpen)
    }

    const filteredList: Option[] = props.options.filter((option: Option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
    )

    const onSelectOption = (ev: React.MouseEvent, option: Option) => {
        setSelectedOptions([...selectedOptions, option])
        props.onSelectOptionChange(option)
    }

    const handleOnSearchItem = (value: string) => {
        setSearch(value)
    }

    return (
        <Dropdown
            isOpen={isOpen}
            toggle={handleOnToggle}
            setActiveFromChild
            className={css.dropdown}
        >
            <DropdownToggle
                className={
                    props.variant === 'none' ? css.optionPickerToggleNone : ''
                }
                type="button"
                color={props.variant}
                disabled={props.disabled}
            >
                {props.materialIconLabel && (
                    <>
                        <i className="material-icons" style={{ fontSize: 20 }}>
                            {props.materialIconLabel}
                        </i>{' '}
                    </>
                )}
                {props.label}
            </DropdownToggle>
            <DropdownMenu
                className={classnames({
                    [css.optionDropdownMenuLarge]: props.withLargeMenu,
                })}
                right
                modifiers={{
                    setMaxHeight: {
                        enabled: true,
                        order: 890,
                        fn: (data) => {
                            return {
                                ...data,
                                styles: {
                                    ...data.styles,
                                    overflow: 'auto',
                                    maxHeight: `300px`,
                                },
                            }
                        },
                    },
                }}
            >
                <div className={css.dropdownHeader}>
                    <InputField
                        value={search}
                        autoFocus
                        placeholder={props.placeholder || 'Search'}
                        onChange={handleOnSearchItem}
                        prefix={
                            <i
                                className="material-icons"
                                style={{
                                    fontSize: 20,
                                    color: '#AFAFAF',
                                }}
                            >
                                search
                            </i>
                        }
                        suffix={
                            props.displayResetSearchIcon &&
                            search && (
                                <i
                                    className="material-icons"
                                    onClick={() => handleOnSearchItem('')}
                                    style={{
                                        fontSize: 16,
                                        color: '#AFAFAF',
                                        cursor: 'pointer',
                                    }}
                                >
                                    close
                                </i>
                            )
                        }
                    />
                </div>
                {filteredList.map((option: Option) => (
                    <DropdownItem
                        key={option.value}
                        onClick={(ev) => onSelectOption(ev, option)}
                        toggle={!!!props.persist}
                        className={css.optionDropdownItem}
                    >
                        {option.label}
                    </DropdownItem>
                ))}
                {!filteredList.length && (
                    <DropdownItem>
                        {props.textNotFound ?? 'No option found'}
                    </DropdownItem>
                )}
            </DropdownMenu>
        </Dropdown>
    )
}

export default DropdownButtonWithSearch
