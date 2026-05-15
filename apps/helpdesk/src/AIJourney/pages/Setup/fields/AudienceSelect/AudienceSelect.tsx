import { useCallback, useMemo, useState } from 'react'

import { ListSection, MultiSelectField, MultiSelectItem } from '@gorgias/axiom'

import { FieldPresentation } from 'AIJourney/components'
import { useAudienceLists } from 'AIJourney/queries/useAudienceLists/useAudienceLists'
import { useAudienceSegments } from 'AIJourney/queries/useAudienceSegments/useAudienceSegments'

import css from './AudienceSelect.less'

type Entry = { id: string; name: string }
type Section = {
    id: string
    name: string
    items: Entry[]
}

type AudienceSelectFieldProps = {
    name?: string
    label?: string
    value: string[]
    onChange: (value: string[]) => void
    exclude?: string[]
    isDisabled?: boolean
    required?: boolean
    onValidationChange?: (isValid: boolean) => void
    showError?: boolean
    integrationId: number | undefined
    isCampaign: boolean
}

export const AudienceSelect = ({
    name,
    value,
    isDisabled = false,
    exclude = [],
    label,
    onChange = () => {},
    required = false,
    onValidationChange = () => {},
    showError = false,
    integrationId,
    isCampaign,
}: AudienceSelectFieldProps) => {
    const [hasInteracted, setHasInteracted] = useState(false)

    const { data: audienceLists, isFetching: isFetchingAudienceLists } =
        useAudienceLists(integrationId)

    const { data: audienceSegments, isFetching: isFetchingAudienceSegments } =
        useAudienceSegments(integrationId, undefined, undefined, {
            enabled: !isCampaign,
        })

    const sections: Section[] = useMemo(() => {
        const currentSections = []

        if (audienceLists && audienceLists.data.length > 0) {
            currentSections.push({
                id: 'list',
                name: 'Lists',
                items: audienceLists.data
                    .map((e) => ({
                        id: e.id,
                        name: e.name,
                    }))
                    .filter((e) => !exclude.includes(e.id)),
            })
        }

        if (
            !isCampaign &&
            audienceSegments &&
            audienceSegments.data.length > 0
        ) {
            currentSections.push({
                id: 'segment',
                name: 'Segments',
                items: audienceSegments.data
                    .map((e) => ({
                        id: e.id,
                        name: e.name,
                    }))
                    .filter((e) => !exclude.includes(e.id)),
            })
        }

        return currentSections
    }, [audienceLists, audienceSegments, exclude, isCampaign])

    const handleChange = useCallback(
        (
            value: {
                id: string
                name: string
            }[],
        ) => {
            setHasInteracted(true)
            const ids = value.map((e) => e.id)
            onChange(ids)
            onValidationChange(ids.length > 0)
        },
        [onChange, onValidationChange],
    )

    const shouldShowError =
        required && (showError || hasInteracted) && value.length === 0

    return (
        <div className={css.audienceSelectField}>
            {name && <FieldPresentation name={name} required={required} />}
            <MultiSelectField
                isSearchable
                items={sections}
                label={label}
                maxHeight={250}
                onChange={handleChange}
                placeholder="Select audience"
                value={value.map((e) => ({ id: e, name: '', items: [] }))}
                isDisabled={
                    isFetchingAudienceLists ||
                    isFetchingAudienceSegments ||
                    isDisabled
                }
                error={
                    shouldShowError
                        ? 'At least one audience is required.'
                        : undefined
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
                            <MultiSelectItem label={option.name} />
                        )}
                    </ListSection>
                )}
            </MultiSelectField>
        </div>
    )
}
