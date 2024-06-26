import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import classnames from 'classnames'
import {Label} from '@gorgias/ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {states} from 'fixtures/states'
import InputField from 'pages/common/forms/input/InputField'
import SelectInputBox, {SelectInputBoxContext} from '../input/SelectInputBox'
import css from '../ProvinceInput/ProvinceInput.less'
import TextInput from '../input/TextInput'

type Props = {
    disabled?: boolean
    label?: string
    onChange: (nextValue: string) => void
    country: string
    name: string
    hasError?: boolean
    error?: string
    isRequired?: boolean
} & ComponentProps<typeof TextInput>

const ProvinceInput = ({
    className,
    label,
    onChange,
    country,
    name,
    hasError,
    error,
    isRequired = false,
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const floatingRef = useRef<HTMLInputElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const _getProvincesList = (country: string) => {
        const stateObj = states.find((state) => state.name === country)
        if (stateObj && stateObj.provinces) return stateObj.provinces
        return []
    }
    const [province, setProvince] = useState('')
    const [provinces, setProvinces] = useState<string[]>([])

    const handleChange = useCallback(
        (province: string) => {
            setIsDropdownOpen(false)
            setProvince(province)
            onChange(province)
        },
        [onChange]
    )

    useEffect(() => {
        setProvinces(_getProvincesList(country))
        setProvince('')
    }, [country])

    return (
        <div className={classnames(css.wrapper, className)}>
            {provinces.length ? (
                <>
                    {label && (
                        <Label className={css.label} isRequired={isRequired}>
                            {label}
                        </Label>
                    )}

                    <SelectInputBox
                        ref={inputRef}
                        floating={floatingRef}
                        label={province}
                        onToggle={setIsDropdownOpen}
                        hasError={hasError}
                        placeholder={'Select state or province...'}
                    >
                        <SelectInputBoxContext.Consumer>
                            {(context) => (
                                <Dropdown
                                    target={inputRef}
                                    isOpen={isDropdownOpen}
                                    ref={floatingRef}
                                    onToggle={() => context!.onBlur()}
                                    value={province}
                                    contained
                                >
                                    <DropdownSearch autoFocus />
                                    <DropdownBody>
                                        {provinces.map((option) => (
                                            <DropdownItem
                                                key={option}
                                                option={{
                                                    value: option,
                                                    label: option,
                                                }}
                                                onClick={handleChange}
                                                shouldCloseOnSelect
                                            />
                                        ))}
                                    </DropdownBody>
                                </Dropdown>
                            )}
                        </SelectInputBoxContext.Consumer>
                    </SelectInputBox>
                </>
            ) : (
                <InputField
                    name={name}
                    label={label}
                    className="mb-2"
                    onChange={handleChange}
                    value={province}
                    isRequired={isRequired}
                    hasError={hasError}
                    error={error}
                    placeholder={'Type state or province...'}
                    data-1p-ignore
                />
            )}
        </div>
    )
}

export default ProvinceInput
