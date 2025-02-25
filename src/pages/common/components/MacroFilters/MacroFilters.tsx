import React, { ComponentProps } from 'react'

import { ISO639English } from 'constants/languages'
import useAppSelector from 'hooks/useAppSelector'
import { MacrosProperties } from 'models/macro/types'
import SelectFilter from 'pages/stats/common/SelectFilter'
import TemplateTypeFilterDropdown from 'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown'
import { TemplateTypeFilterOption } from 'pages/tickets/detail/components/ReplyArea/types'
import { getMacroParametersOptions } from 'state/macro/selectors'

type Props = {
    tagDropdownMenuProps?: ComponentProps<
        typeof SelectFilter
    >['dropdownMenuProps']
    selectedProperties: MacrosProperties
    onChange: (properties: MacrosProperties) => void
    size?: 'sm' | 'lg'
}

const MacroFilters = ({
    tagDropdownMenuProps,
    selectedProperties,
    onChange,
    size,
}: Props) => {
    const properties: MacrosProperties = useAppSelector(
        getMacroParametersOptions,
    ).toJS()

    return (
        <div className="d-flex">
            <TemplateTypeFilterDropdown
                value={TemplateTypeFilterOption.Macros}
            />
            <SelectFilter
                plural="languages"
                singular="language"
                onChange={(values) => {
                    const languages = values.length ? [...values, null] : []
                    onChange({
                        languages: languages as string[],
                    })
                }}
                value={(selectedProperties.languages as string[]) ?? []}
                isMultiple={false}
                size={size}
            >
                {properties.languages
                    ?.filter((language) => !!language)
                    .map((code) => (
                        <SelectFilter.Item
                            key={code}
                            value={code as string}
                            label={code ? ISO639English[code] : ''}
                        />
                    ))}
            </SelectFilter>
            <SelectFilter
                plural="tags"
                singular="tag"
                onChange={(values) =>
                    onChange({
                        tags: values as string[],
                    })
                }
                value={(selectedProperties.tags as string[]) ?? []}
                size={size}
                dropdownMenuProps={tagDropdownMenuProps}
            >
                {properties.tags?.map((tag) => (
                    <SelectFilter.Item
                        key={tag}
                        value={tag as string}
                        label={tag ?? ''}
                    />
                ))}
            </SelectFilter>
        </div>
    )
}

export default MacroFilters
