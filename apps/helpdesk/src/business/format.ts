import { upperFirst } from '@gorgias/toolkit'

export function humanize(text: string): string {
    return upperFirst(
        String(text ?? '')
            .replace(/^[._-]+|[._-]+$/g, '')
            .replace(/([A-Z])/g, ' $1')
            .replace(/[-_.\s]+/g, ' ')
            .toLowerCase(),
    )
}
