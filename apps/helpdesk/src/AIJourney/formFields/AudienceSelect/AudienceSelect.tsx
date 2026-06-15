import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { UserRole } from '@repo/permissions'
import { useCurrentUserRole } from '@repo/users'
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
        label: 'Audience to include',
    },
    exclude: {
        fieldName: 'excluded_audience_list_ids',
        excludeFieldName: 'included_audience_list_ids',
        label: 'Audience to exclude',
    },
}

type AudienceSegmentWithIdentifier = {
    id: string
    identifier?: string
    name: string
}

export const AudienceSelect = ({
    type,
    isRequired = false,
}: {
    type: 'include' | 'exclude'
    isRequired?: boolean
}) => {
    const { control, getValues, setValue } = useFormContext()
    const { currentIntegration } = useJourneyContext()

    const isAiJourneySegmentsEnabled = useFlag(
        FeatureFlagKey.AiJourneySegmentsUiEnabled,
    )

    const { hasRole } = useCurrentUserRole()
    const canWrite = hasRole(UserRole.Admin) || hasRole(UserRole.Agent)

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false)
    const [localSegments, setLocalSegments] = useState<
        { id: string; name: string }[]
    >([])
    const [pendingIdentifiers, setPendingIdentifiers] = useState<string[]>([])

    const { fieldName, excludeFieldName, label } = fieldProps[type]

    const excludedValues: string[] =
        useWatch({ control, name: excludeFieldName }) ?? []
    const excludedValuesRef = useRef(excludedValues) // need to memoize excluded values to avoid re-creating it in every render
    excludedValuesRef.current = excludedValues

    const { data: audienceLists, isFetching: isFetchingAudienceLists } =
        useAudienceLists(currentIntegration?.id)

    const {
        data: gorgiasAudienceSegments,
        isFetching: isFetchingGorgiasAudienceSegments,
    } = useAudienceSegments(currentIntegration?.id, AudienceListSource.Gorgias)

    const {
        data: klaviyoAudienceSegments,
        isFetching: isFetchingKlaviyoAudienceSegments,
    } = useAudienceSegments(currentIntegration?.id, AudienceListSource.Klaviyo)

    const { data: schema } = useConditionsMetadata({
        enabled: isAiJourneySegmentsEnabled,
    })

    const handleSegmentCreated = useCallback(
        (segment: { id: string; name: string }) => {
            const current: string[] = getValues(fieldName) ?? []
            setValue(fieldName, [...current, segment.id])
            setLocalSegments((prev) => [...prev, segment])
            setPendingIdentifiers((prev) => [...prev, segment.id])
        },
        [fieldName, getValues, setValue],
    )

    useEffect(() => {
        if (pendingIdentifiers.length === 0) return
        const gorgiasItems =
            (gorgiasAudienceSegments?.data as
                | AudienceSegmentWithIdentifier[]
                | undefined) ?? []

        const resolved: { identifier: string; actualId: string }[] = []
        for (const identifier of pendingIdentifiers) {
            const match = gorgiasItems.find((e) => e.identifier === identifier)
            if (match) resolved.push({ identifier, actualId: match.id })
        }

        if (resolved.length === 0) return

        const currentValues: string[] = getValues(fieldName) ?? []
        setValue(
            fieldName,
            currentValues.map((id) => {
                const pair = resolved.find((p) => p.identifier === id)
                return pair ? pair.actualId : id
            }),
        )

        setLocalSegments((prev) =>
            prev.map((s) => {
                const pair = resolved.find((p) => p.identifier === s.id)
                return pair ? { ...s, id: pair.actualId } : s
            }),
        )

        setPendingIdentifiers((prev) =>
            prev.filter((id) => !resolved.some((p) => p.identifier === id)),
        )
    }, [
        gorgiasAudienceSegments,
        pendingIdentifiers,
        fieldName,
        getValues,
        setValue,
    ])

    const sections = useMemo(() => {
        const excluded = excludedValuesRef.current
        const currentSections: {
            id: string
            name: string
            items: { id: string; name: string }[]
        }[] = []

        if (audienceLists && audienceLists.data.length > 0) {
            currentSections.push({
                id: 'list',
                name: 'Lists',
                items: audienceLists.data
                    .map((e) => ({ id: e.id, name: e.name }))
                    .filter((e) => !excluded.includes(e.id)),
            })
        }

        const gorgiasItems =
            (gorgiasAudienceSegments?.data as
                | AudienceSegmentWithIdentifier[]
                | undefined) ?? []
        const mergedGorgiasItems = [
            ...gorgiasItems,
            ...localSegments.filter(
                (s) =>
                    !gorgiasItems.some(
                        (e) => e.id === s.id || e.identifier === s.id,
                    ),
            ),
        ].filter((e) => !excluded.includes(e.id))

        if (mergedGorgiasItems.length > 0) {
            currentSections.push({
                id: 'gorgias-segment',
                name: 'Gorgias segments',
                items: mergedGorgiasItems.map((e) => ({
                    id: e.id,
                    name: e.name,
                })),
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
    }, [
        audienceLists,
        gorgiasAudienceSegments,
        klaviyoAudienceSegments,
        localSegments,
    ])

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                render={({ field }) => (
                    <MultiSelectField
                        isSearchable
                        isRequired={isRequired}
                        items={sections}
                        isOpen={isMultiSelectOpen}
                        onOpenChange={setIsMultiSelectOpen}
                        footer={
                            isAiJourneySegmentsEnabled && canWrite ? (
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
                            isFetchingAudienceLists ||
                            isFetchingGorgiasAudienceSegments ||
                            isFetchingKlaviyoAudienceSegments
                        }
                    >
                        {(section: {
                            id: string
                            name: string
                            items: { id: string; name: string }[]
                        }) => (
                            <ListSection
                                id={section.name}
                                name={section.name}
                                items={section.items}
                            >
                                {(option: { id: string; name: string }) => (
                                    <ListItem label={option.name} />
                                )}
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
