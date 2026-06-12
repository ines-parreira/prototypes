const pathSegmentPattern = /([^.[\]]+)|\[([^\]]*)\]/g

function getPathSegments(path: string): string[] {
    return Array.from(path.matchAll(pathSegmentPattern), (match) => {
        return match[1] ?? match[2]
    })
}

function isArrayIndex(segment: string): boolean {
    return /^\d+$/.test(segment)
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object'
}

export function getActionPathValue<T>(
    object: unknown,
    path: string,
): T | undefined {
    return getPathSegments(path).reduce<unknown>((value, segment) => {
        if (value == null) {
            return undefined
        }

        return (value as Record<string, unknown>)[segment]
    }, object) as T | undefined
}

export function setActionPathValue(
    object: Record<string, unknown>,
    path: string,
    value: unknown,
): void {
    const segments = getPathSegments(path)
    let current: Record<string, unknown> = object

    segments.forEach((segment, index) => {
        if (index === segments.length - 1) {
            current[segment] = value
            return
        }

        const nextSegment = segments[index + 1]
        let nextValue = current[segment]

        if (!isRecord(nextValue)) {
            nextValue = isArrayIndex(nextSegment) ? [] : {}
        }

        current[segment] = nextValue
        current = nextValue as Record<string, unknown>
    })
}
