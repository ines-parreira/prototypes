import type { ReactNode } from 'react'
import { useMemo } from 'react'

import {
    Box,
    ListSection,
    MultiSelectField,
    MultiSelectItem,
    Text,
} from '@gorgias/axiom'

import instagramLogo from 'assets/img/icons/social/instagram.svg'

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
    name: ReactNode
    items: SocialsIntegration[]
}

const INSTAGRAM_SECTION_ID = 'instagram'

// Use a bundled <img> instead of axiom's <Icon name="channel-instagram">
// because that component renders `<use href="…icons.svg#channel-instagram"/>`,
// which makes the browser re-resolve the sprite fragment every time the
// popover remounts the section header — producing a visible delay on each open.
const INSTAGRAM_SECTION_NAME = (
    <Box flexDirection="row" alignItems="center" gap="xs">
        <img src={instagramLogo} alt="" width={16} height={16} />
        <Text size="sm" variant="medium">
            Instagram DM
        </Text>
    </Box>
)

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
        >
            {(section) => (
                <ListSection
                    id={section.id}
                    name={section.name as unknown as string}
                    items={section.items}
                >
                    {(integration) => (
                        <MultiSelectItem
                            textValue={`ig - @${integration.instagramUsername}`}
                            label={
                                integration.pageName ||
                                integration.instagramUsername ||
                                String(integration.id)
                            }
                            caption={
                                integration.instagramUsername
                                    ? `@${integration.instagramUsername}`
                                    : undefined
                            }
                        />
                    )}
                </ListSection>
            )}
        </MultiSelectField>
    )
}
