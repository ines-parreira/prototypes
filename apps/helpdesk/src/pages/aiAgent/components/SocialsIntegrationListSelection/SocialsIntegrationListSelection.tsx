import type { ReactNode } from 'react'
import { useMemo } from 'react'

import {
    CheckBoxField,
    ListSection,
    MultiSelectField,
    MultiSelectItem,
    MultiSelectTrigger,
    Tag,
} from '@gorgias/axiom'

import type { SocialsIntegration } from '../StoreConfigForm/types'

type SocialsIntegrationListSelectionProps = {
    onSelectionChange: (nextSelectedIds: number[]) => void
    selectedIds: number[]
    socialsItems: SocialsIntegration[]
    hasError?: boolean
    error?: string | ReactNode
    isDisabled?: boolean
    labelId?: string
}

type SocialsSection = {
    id: string
    name: string
    items: SocialsIntegration[]
}

const INSTAGRAM_SECTION_ID = 'instagram'
const INSTAGRAM_SECTION_NAME = 'Instagram DM'

const getIntegrationLabel = (integration: SocialsIntegration) => {
    const name = integration.instagramUsername || integration.pageName
    return name ? `${name} #${integration.id}` : `#${integration.id}`
}

export const SocialsIntegrationListSelection = ({
    onSelectionChange,
    selectedIds,
    socialsItems,
    hasError = false,
    error,
    isDisabled,
    labelId,
}: SocialsIntegrationListSelectionProps) => {
    const sections = useMemo<SocialsSection[]>(
        () => [
            {
                id: INSTAGRAM_SECTION_ID,
                name: INSTAGRAM_SECTION_NAME,
                items: socialsItems,
            },
        ],
        [socialsItems],
    )

    const selectedItems = useMemo(
        () =>
            socialsItems.filter((integration) =>
                selectedIds.includes(integration.id),
            ),
        [socialsItems, selectedIds],
    )

    return (
        <MultiSelectField<SocialsIntegration, SocialsSection>
            aria-labelledby={labelId}
            placeholder="Select socials integrations"
            items={sections}
            value={selectedItems}
            onChange={(next) => onSelectionChange(next.map((item) => item.id))}
            isInvalid={hasError}
            error={error}
            isDisabled={isDisabled}
            trigger={
                <MultiSelectTrigger<SocialsIntegration>>
                    {({ item, onRemove, isDisabled }) => (
                        <Tag
                            leadingSlot="channel-instagram"
                            onClose={onRemove}
                            isDisabled={isDisabled}
                        >
                            {getIntegrationLabel(item)}
                        </Tag>
                    )}
                </MultiSelectTrigger>
            }
        >
            {(section) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(integration) => (
                        <MultiSelectItem
                            leadingSlot={({ isSelected }) => (
                                <CheckBoxField value={isSelected} />
                            )}
                            textValue={getIntegrationLabel(integration)}
                            label={getIntegrationLabel(integration)}
                        />
                    )}
                </ListSection>
            )}
        </MultiSelectField>
    )
}
