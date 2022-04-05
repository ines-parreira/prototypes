import React, {useEffect, useState} from 'react'
import {notify} from 'reapop'
import {isEqual, intersection} from 'lodash'
import {ISO639English} from 'constants/languages'
import {fetchMacrosProperties} from 'models/macro/resources'
import {MacroPropertiesOptions, MacrosProperties} from 'models/macro/types'
import SelectFilter from 'pages/stats/common/SelectFilter'
import {NotificationStatus} from 'state/notifications/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

type Props = {
    selectedProperties: MacrosProperties
    onChange: (properties: MacrosProperties) => void
}

const MacroFilters = ({selectedProperties, onChange}: Props) => {
    const [properties, setProperties] =
        useState<MacrosProperties>(selectedProperties)
    const handleFetchMacrosProperties = async () => {
        try {
            const res = await fetchMacrosProperties(
                Object.values(MacroPropertiesOptions)
            )
            if (res) setProperties(res)
        } catch (error) {
            void notify({
                message: 'Failed to fetch macro properties',
                status: NotificationStatus.Error,
            })
        }
    }

    useEffect(() => {
        void handleFetchMacrosProperties()
    }, [])

    useEffect(() => {
        //If ticket language is not in the list of macro languages, remove language filter.
        const languages = selectedProperties.languages?.filter(Boolean)
        if (
            languages &&
            !isEqual(languages, intersection(languages, properties.languages))
        )
            onChange({...selectedProperties, languages: []})
    }, [onChange, properties, selectedProperties])

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
