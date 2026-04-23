import { useCallback, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { ListItem, ListSection, MultiSelectField } from '@gorgias/axiom'

import { CreateNewSegmentButton } from 'AIJourney/components/CreateNewSegmentButton/CreateNewSegmentButton'
import { SegmentsSidePanel } from 'AIJourney/components/SegmentsSidePanel/SegmentsSidePanel'
import { useJourneyContext } from 'AIJourney/providers'
import { useConditionsMetadata } from 'AIJourney/queries'
import { useAudienceLists } from 'AIJourney/queries/useAudienceLists/useAudienceLists'
import {
    AudienceListSource,
    useAudienceSegments,
} from 'AIJourney/queries/useAudienceSegments/useAudienceSegments'

const fieldProps = {
    include: {
        fieldName: 'included_audience_list_ids',
        excludeFieldName: 'excluded_audience_list_ids',
        label: 'Segments to include',
    },
    exclude: {
        fieldName: 'excluded_audience_list_ids',
        excludeFieldName: 'included_audience_list_ids',
        label: 'Segments to exclude',
    },
}

export const AudienceSelect = ({ type }: { type: 'include' | 'exclude' }) => {
    const { control, getValues, setValue } = useFormContext()
    const { currentIntegration } = useJourneyContext()

    const isAiJourneySegmentsEnabled = useFlag(
        FeatureFlagKey.AiJourneySegmentsUiEnabled,
    )

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false)

    const { fieldName, excludeFieldName, label } = fieldProps[type]

    const handleSegmentCreated = useCallback(
        (segment: { id: string }) => {
            const current: string[] = getValues(fieldName) ?? []
            setValue(fieldName, [...current, segment.id])
        },
        [fieldName, getValues, setValue],
    )

    const excludedValues: string[] =
        useWatch({ control, name: excludeFieldName }) ?? []
    const excludedValuesRef = useRef(excludedValues) // need to memoize excluded values to avoid re-creating it in every render
    excludedValuesRef.current = excludedValues

    const { data: audienceLists, isLoading: isLoadingAudienceLists } =
        useAudienceLists(currentIntegration?.id)

    const {
        data: gorgiasAudienceSegments,
        isLoading: isLoadingGorgiasAudienceSegments,
    } = useAudienceSegments(currentIntegration?.id, AudienceListSource.Gorgias)

    const {
        data: klaviyoAudienceSegments,
        isLoading: isLoadingKlaviyoAudienceSegments,
    } = useAudienceSegments(currentIntegration?.id, AudienceListSource.Klaviyo)

    const { data: schema } = useConditionsMetadata({
        enabled: isAiJourneySegmentsEnabled,
    })

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

        if (
            gorgiasAudienceSegments &&
            gorgiasAudienceSegments.data.length > 0
        ) {
            currentSections.push({
                id: 'gorgias-segment',
                name: 'Gorgias segments',
                items: gorgiasAudienceSegments.data
                    .map((e) => ({ id: e.id, name: e.name }))
                    .filter((e) => !excluded.includes(e.id)),
            })
        }

        if (
            klaviyoAudienceSegments &&
            klaviyoAudienceSegments.data.length > 0
        ) {
            currentSections.push({
                id: 'klaviyo-segment',
                name: 'Klaviyo segments',
                items: klaviyoAudienceSegments.data
                    .map((e) => ({ id: e.id, name: e.name }))
                    .filter((e) => !excluded.includes(e.id)),
            })
        }

        return currentSections
    }, [audienceLists, gorgiasAudienceSegments, klaviyoAudienceSegments])

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                render={({ field }) => (
                    <MultiSelectField
                        isSearchable
                        items={sections}
                        isOpen={isMultiSelectOpen}
                        onOpenChange={setIsMultiSelectOpen}
                        footer={
                            isAiJourneySegmentsEnabled ? (
                                <CreateNewSegmentButton
                                    onClick={() => {
                                        setIsMultiSelectOpen(false)
                                        setIsSidePanelOpen(true)
                                    }}
                                />
                            ) : undefined
                        }
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
                            isLoadingAudienceLists ||
                            isLoadingGorgiasAudienceSegments ||
                            isLoadingKlaviyoAudienceSegments
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
            {schema && (
                <SegmentsSidePanel
                    isOpen={isSidePanelOpen}
                    onClose={() => setIsSidePanelOpen(false)}
                    onSegmentCreated={handleSegmentCreated}
                    schema={schema}
                />
            )}
        </>
    )
}
