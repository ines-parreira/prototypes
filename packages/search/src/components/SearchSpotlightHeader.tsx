import type { Ref } from 'react'

import { Box, Button, SearchField, ShortcutKey, Text } from '@gorgias/axiom'

import type { SearchSection } from '../types'

type SearchSpotlightHeaderProps = {
    searchQuery: string
    searchInputRef: Ref<HTMLInputElement>
    selectedSection: SearchSection
    onSearchQueryChange: (value: string) => void
    onGoToAdvancedSearch: () => void
    placeholder: string
}

export function SearchSpotlightHeader({
    searchQuery,
    searchInputRef,
    selectedSection,
    onSearchQueryChange,
    onGoToAdvancedSearch,
    placeholder,
}: SearchSpotlightHeaderProps) {
    return (
        <Box
            alignItems="center"
            gap="md"
            pb="sm"
            style={{
                marginLeft: 'calc(var(--spacing-lg) * -1)',
                marginRight: 'calc(var(--spacing-lg) * -1)',
                paddingLeft: 'var(--spacing-lg)',
                paddingRight: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--surface-neutral-tertiary)',
            }}
        >
            <Box flexGrow={1}>
                <SearchField
                    aria-label="Search for anything"
                    placeholder={placeholder}
                    variant="secondary"
                    value={searchQuery}
                    autoFocus
                    inputRef={searchInputRef}
                    onChange={onSearchQueryChange}
                    onClear={() => {
                        onSearchQueryChange('')
                    }}
                />
            </Box>
            <Box flexShrink={0}>
                <Button
                    variant="tertiary"
                    onClick={onGoToAdvancedSearch}
                    isDisabled={selectedSection === 'calls'}
                    trailingSlot={
                        <Box gap="xxxs">
                            <ShortcutKey>⇧</ShortcutKey>
                            <ShortcutKey>↵</ShortcutKey>
                        </Box>
                    }
                >
                    <Text variant="bold">Advanced search</Text>
                </Button>
            </Box>
        </Box>
    )
}
