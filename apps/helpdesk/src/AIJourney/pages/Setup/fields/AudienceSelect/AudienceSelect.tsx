import { useCallback, useMemo } from 'react'

import { ListItem, ListSection, MultiSelectField } from '@gorgias/axiom'

import { FieldPresentation } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'
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
    name: string
    value: string[]
    onChange: (value: string[]) => void
    exclude?: string[]
    isDisabled?: boolean
}

export const AudienceSelect = ({
    name,
    value,
    isDisabled = false,
    exclude = [],
    onChange = () => {},
}: AudienceSelectFieldProps) => {
    const { currentIntegration } = useJourneyContext()

    const { data: audienceLists, isLoading: isLoadingAudienceLists } =
        useAudienceLists(currentIntegration?.id)

    const { data: audienceSegments, isLoading: isLoadingAudienceSegments } =
        useAudienceSegments(currentIntegration?.id)

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

        if (audienceSegments && audienceSegments.data.length > 0) {
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
    }, [audienceLists, audienceSegments, exclude])

    const handleChange = useCallback(
        (
            value: {
                id: string
                name: string
            }[],
        ) => {
            onChange(value.map((e) => e.id))
        },
        [onChange],
    )

    return (
        <div className={css.audienceSelectField}>
            <FieldPresentation name={name} />
            <MultiSelectField
                isSearchable
                items={sections}
                maxHeight={250}
                onChange={handleChange}
                placeholder="Select audience"
                value={value.map((e) => ({ id: e, name: '', items: [] }))}
                isDisabled={
                    isLoadingAudienceLists ||
                    isLoadingAudienceSegments ||
                    isDisabled
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
        </div>
    )
}
