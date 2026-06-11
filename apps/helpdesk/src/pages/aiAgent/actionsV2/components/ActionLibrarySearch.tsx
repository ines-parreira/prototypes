import { Box, Text, TextField } from '@gorgias/axiom'

type Props = {
    value: string
    onChange: (value: string) => void
    totalCount: number
    filteredCount: number
}

const ActionLibrarySearch = ({
    value,
    onChange,
    totalCount,
    filteredCount,
}: Props) => {
    return (
        <Box flexDirection="column" gap="xxs" my="md">
            <Box maxWidth="280px">
                <TextField
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="Search..."
                    leadingSlot="magnifying-glass"
                    aria-label="Search actions"
                />
            </Box>
            <Text
                size="sm"
                color="content-neutral-secondary"
                aria-live="polite"
            >
                Showing {filteredCount} of {totalCount} items
            </Text>
        </Box>
    )
}

export { ActionLibrarySearch }
