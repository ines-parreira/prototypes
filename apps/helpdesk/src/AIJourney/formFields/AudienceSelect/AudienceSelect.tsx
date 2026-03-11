import { useMemo, useRef } from 'react'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { ListItem, ListSection, MultiSelectField } from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'
import { useAudienceLists } from 'AIJourney/queries/useAudienceLists/useAudienceLists'
import { useAudienceSegments } from 'AIJourney/queries/useAudienceSegments/useAudienceSegments'

const fieldProps = {
    include: {
        fieldName: 'included_audience_list_ids',
        excludeFieldName: 'excluded_audience_list_ids',
        label: 'Audience to include',
    },
    exclude: {
        fieldName: 'excluded_audience_list_ids',
        excludeFieldName: 'included_audience_list_ids',
        label: 'Audience to exclude',
    },
}

export const AudienceSelect = ({ type }: { type: 'include' | 'exclude' }) => {
    const { control } = useFormContext()
    const { currentIntegration } = useJourneyContext()

    const { fieldName, excludeFieldName, label } = fieldProps[type]

    const excludedValues: string[] =
        useWatch({ control, name: excludeFieldName }) ?? []
    const excludedValuesRef = useRef(excludedValues) // need to memoize excluded values to avoid re-creating it in every render
    excludedValuesRef.current = excludedValues

    const { data: audienceLists, isLoading: isLoadingAudienceLists } =
        useAudienceLists(currentIntegration?.id)

    const { data: audienceSegments, isLoading: isLoadingAudienceSegments } =
        useAudienceSegments(currentIntegration?.id)

    const sections = useMemo(() => {
        const excluded = excludedValuesRef.current
        const currentSections = []

        if (audienceLists && audienceLists.data.length > 0) {
            currentSections.push({
                id: 'list',
                name: 'Lists',
                items: audienceLists.data
                    .map((e) => ({ id: e.id, name: e.name }))
                    .filter((e) => !excluded.includes(e.id)),
            })
        }

        if (audienceSegments && audienceSegments.data.length > 0) {
            currentSections.push({
                id: 'segment',
                name: 'Segments',
                items: audienceSegments.data
                    .map((e) => ({ id: e.id, name: e.name }))
                    .filter((e) => !excluded.includes(e.id)),
            })
        }

        return currentSections
    }, [audienceLists, audienceSegments])

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
                <MultiSelectField
                    isSearchable
                    items={sections}
                    label={label}
                    maxHeight={250}
                    onChange={(value: typeof sections) =>
                        field.onChange(value.map((e) => e.id))
                    }
                    placeholder="Select audience"
                    value={(field.value ?? []).map((id: string) => ({
                        id,
                        name: '',
                        items: [],
                    }))}
                    isDisabled={
                        isLoadingAudienceLists || isLoadingAudienceSegments
                    }
                >
                    {(section) => (
                        <ListSection
                            id={section.name}
                            name={section.name}
                            items={section.items}
                        >
                            {(option) => <ListItem label={option.name} />}
                        </ListSection>
                    )}
                </MultiSelectField>
            )}
        />
    )
}
