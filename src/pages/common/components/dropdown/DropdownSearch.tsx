import classnames from 'classnames'
import React, {
    ComponentProps,
    forwardRef,
    Ref,
    useContext,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import {
    useEffectOnce,
    usePrevious,
    useUnmount,
    useUpdateEffect,
} from 'react-use'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'

import {DropdownContext} from './Dropdown'
import css from './DropdownSearch.less'

type Props = {value?: string} & Omit<ComponentProps<typeof TextInput>, 'value'>

const DropdownSearch = forwardRef(
    (
        {
            className,
            onChange,
            placeholder = 'Search',
            prefix = <IconInput icon="search" />,
            value,
            ...other
        }: Props,
        ref: Ref<HTMLInputElement> | null | undefined
    ) => {
        const inputRef = useRef<HTMLInputElement>(null)
        useImperativeHandle(ref, () => inputRef.current!)
        const dropdownContext = useContext(DropdownContext)

        if (!dropdownContext) {
            throw new Error(
                'DropdownSearch must be used within a DropdownContext.Provider'
            )
        }
        const {onQueryChange, query} = dropdownContext
        const [localQuery, setLocalQuery] = useState(value || query)
        const previousLocalQuery = usePrevious(localQuery)

        useEffectOnce(() => {
            if (value && value !== query) {
                onQueryChange(value)
            }
        })

        useUpdateEffect(() => {
            if (value != null) {
                setLocalQuery(value)
            }
        }, [value])

        useUpdateEffect(() => {
            if (localQuery.trim() === previousLocalQuery?.trim()) {
                return
            }
            if (onChange) {
                onChange(localQuery)
            }
            onQueryChange(localQuery)
        }, [localQuery, previousLocalQuery])

        useUnmount(() => {
            onQueryChange('')
        })

        return (
            <div className={classnames(css.wrapper, className)}>
                <TextInput
                    {...other}
                    onChange={setLocalQuery}
                    placeholder={placeholder}
                    prefix={prefix}
                    ref={inputRef}
                    value={localQuery}
                />
            </div>
        )
    }
)

export default DropdownSearch
