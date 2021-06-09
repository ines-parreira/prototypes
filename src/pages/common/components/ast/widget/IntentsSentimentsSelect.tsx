import React, {useMemo} from 'react'

import MultiSelectField from '../../../forms/MultiSelectField.js'
import type {Option} from '../../../forms/MultiSelectOptionsField/types'

type OwnProps = {
    options: string[]
    hiddenOptions?: string[]
    deprecatedOptions?: string[]
    className?: string
    singular: string
    plural: string
    onChange: (options: string[]) => void
    values: string[]
}

export const IntentsSentimentsSelect = ({
    options,
    className,
    onChange,
    values,
    singular,
    plural,
    hiddenOptions = [],
    deprecatedOptions = [],
}: OwnProps) => {
    const hasDeprecated = useMemo(() => {
        return (values || []).some((value) => deprecatedOptions.includes(value))
    }, [deprecatedOptions, values])

    const displayedOptions: Option[] = useMemo(
        () =>
            options
                .filter((option) => !hiddenOptions.includes(option))
                .map((option) => ({
                    label: option,
                    value: option,
                    isDeprecated: deprecatedOptions.includes(option),
                })),
        [deprecatedOptions, options]
    )

    return (
        <>
            <MultiSelectField
                className={className}
                style={{
                    display: 'inline-block',
                    paddingBottom: '2px',
                }}
                options={displayedOptions}
                singular={singular}
                plural={plural}
                values={values}
                onChange={onChange}
            />
            {hasDeprecated && (
                <span className="text-danger ml-2">
                    <span className="material-icons mr-1">warning</span>
                    Deprecated items: {deprecatedOptions.join(',')}
                </span>
            )}
        </>
    )
}

export default IntentsSentimentsSelect
