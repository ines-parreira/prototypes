import React, {useRef, useState} from 'react'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

export const ADD_FILTER_BUTTON_LABEL = 'Add Filter'

export const AddFilterButton = ({
    onClick,
    options,
}: {
    onClick: (value: string) => void
    options: {label: string; value: string}[]
}) => {
    const buttonRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const onToggle = () => setIsOpen(!isOpen)
    const handleOnClick = (value: string) => {
        onClick(value)
        setIsOpen(!isOpen)
    }

    return (
        <>
            <Button
                intent={'primary'}
                onClick={onToggle}
                title={ADD_FILTER_BUTTON_LABEL}
                fillStyle={'ghost'}
                ref={buttonRef}
                size={'small'}
            >
                <ButtonIconLabel icon={'add'} position={'left'} />{' '}
                {ADD_FILTER_BUTTON_LABEL}
            </Button>
            <Dropdown isOpen={isOpen} onToggle={onToggle} target={buttonRef}>
                <DropdownBody>
                    {options.map((option) => (
                        <DropdownItem
                            key={option.value}
                            option={option}
                            onClick={handleOnClick}
                        >
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
