const templateRegex = /\{\{([a-zA-Z0-9._\[\]"'\-]+)\}\}/g

function getByPath(obj: unknown, path: string): unknown {
    const segments = path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)

    let current: unknown = obj
    for (const segment of segments) {
        if (current === null || current === undefined) return undefined
        current = (current as Record<string, unknown>)[segment]
    }
    return current
}

export function renderTemplate(
    template: string,
    context: Record<string, unknown>,
): string {
    if (!template) return ''
    return template.replace(templateRegex, (_match, variable: string) => {
        const value = getByPath(context, variable)
        if (value == null) return ''
        return String(value)
    })
}
