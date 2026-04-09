import { Box, Dot, Tag } from '@gorgias/axiom'

type TagsPreviewProps = {
    tags?: string
}

function splitTags(tags?: string): string[] {
    return (
        tags
            ?.split(',')
            .map((tag) => tag.trim())
            .filter(Boolean) ?? []
    )
}

export function TagsPreview({ tags }: TagsPreviewProps) {
    return (
        <Box flexDirection="row" flexWrap="wrap" gap="xxxs">
            {splitTags(tags).map((tag) => (
                <Tag key={tag} leadingSlot={<Dot color="ai-content" />}>
                    {tag}
                </Tag>
            ))}
        </Box>
    )
}
