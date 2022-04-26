import React from 'react'
import {ISO639English} from 'constants/languages'
import {MacrosProperties} from 'models/macro/types'
import SelectFilter from 'pages/stats/common/SelectFilter'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {getMacroParametersOptions} from 'state/macro/selectors'

type Props = {
    selectedProperties: MacrosProperties
    onChange: (properties: MacrosProperties) => void
}

const MacroFilters = ({selectedProperties, onChange}: Props) => {
    const properties: MacrosProperties = useAppSelector(
        getMacroParametersOptions
    ).toJS()

    const handleChange = (properties: MacrosProperties) => {
        logEvent(SegmentEvent.MacrosFilterChanged, {...properties})
        onChange(properties)
    }

    return (
        <div className="d-flex">
            <SelectFilter
                plural="languages"
                singular="language"
                onChange={(values) => {
                    const languages = values.length ? [...values, null] : []
                    handleChange({
                        ...selectedProperties,
                        languages: languages as string[],
                    })
                }}
                value={selectedProperties.languages ?? []}
                isMultiple={false}
            >
                {properties.languages
                    ?.filter((language) => !!language)
                    .map((code) => (
                        <SelectFilter.Item
                            key={code}
                            value={code}
                            label={ISO639English[code]}
                        />
                    ))}
            </SelectFilter>
            <SelectFilter
                plural="tags"
                singular="tag"
                onChange={(values) =>
                    handleChange({
                        ...selectedProperties,
                        tags: values as string[],
                    })
                }
                value={selectedProperties.tags ?? []}
            >
                {properties.tags?.map((tag) => (
                    <SelectFilter.Item key={tag} value={tag} label={tag} />
                ))}
            </SelectFilter>
        </div>
    )
}

export default MacroFilters
