import { Text } from '@gorgias/axiom'

function getReadonlyFieldValue(value: unknown, emptyFallback = 'No value') {
    if (value === null || value === undefined) {
        return emptyFallback
    }

    if (typeof value === 'string') {
        return value.trim().length > 0 ? value : emptyFallback
    }

    if (Array.isArray(value)) {
        return value.length > 0 ? String(value) : emptyFallback
    }

    if (typeof value === 'object') {
        return Object.keys(value).length > 0 ? String(value) : emptyFallback
    }

    return String(value)
}

type ReadonlyTextFieldPreviewProps = {
    value: unknown
    ariaLabel?: string
    emptyFallback?: string
}

export function ReadonlyTextFieldPreview({
    value,
    emptyFallback,
}: ReadonlyTextFieldPreviewProps) {
    return (
        <Text size="sm" color="content-neutral-default">
            {getReadonlyFieldValue(value, emptyFallback)}
        </Text>
    )
}
