import React, { useEffect, useRef, useState } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { CATEGORIES } from '../constants'

import css from './ActionsPlatformUseCaseTemplateCategory.less'

type Props = {
    value?: string | null
    onChange: (value: string) => void
    onBlur: () => void
    error?: string
}

const ActionsPlatformUseCaseTemplateCategory = ({
    value,
    onChange,
    onBlur,
    error,
}: Props) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    const label = CATEGORIES.find((category) => category === value)

    useEffect(() => {
        const element = targetRef.current

        if (!element) {
            return
        }

        element.addEventListener('blur', onBlur)

        return () => {
            element.removeEventListener('blur', onBlur)
        }
    }, [onBlur])

    return (
        <div className={css.container}>
            <Label isRequired>Category</Label>
            <SelectInputBox
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                label={label}
                hasError={!!error}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                        >
                            <DropdownBody>
                                {CATEGORIES.map((category) => (
                                    <DropdownItem
                                        key={category}
                                        option={{
                                            value: category,
                                            label: category,
                                        }}
                                        onClick={onChange}
                                        shouldCloseOnSelect
                                    />
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default ActionsPlatformUseCaseTemplateCategory
