import moment from 'moment'

const templateRegex = /\{\{([a-zA-Z0-9._\[\]"'\-]+)\|?([\w_]+\([^(]*\))?\}\}/g
const filterRegex = /([\w_]+)\(([^(]*)\)/
const MAX_OBJECT_RENDER_LENGTH = 4096

function LDMLToMomentFormat(pattern: string): string {
    return pattern.replace(/(\bd\b)/g, 'D').replace(/(\bdd\b)/g, 'DD')
}

const filters: Record<string, (value: string, args: string[]) => string> = {
    datetime_format: (value, args) => {
        if (!value) return value
        const pattern = LDMLToMomentFormat(args[0] ?? '')
        return moment(value).format(pattern)
    },
    fallback: (value, args) => {
        return value?.trim() ? value : (args[0] ?? '')
    },
}

function parseFilterArgs(raw: string): string[] {
    const args: string[] = []
    const re = /'([^']*)'|"([^"]*)"/g
    let match
    while ((match = re.exec(raw)) !== null) {
        args.push(match[1] ?? match[2] ?? '')
    }
    return args
}

function getByPath(obj: unknown, path: string): unknown {
    const segments = path
        .replace(/\[(-?\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)

    let current: unknown = obj
    for (const segment of segments) {
        if (current === null || current === undefined) return undefined

        if (Array.isArray(current)) {
            const index = parseInt(segment, 10)
            if (!isNaN(index)) {
                current =
                    index < 0 ? current[current.length + index] : current[index]
                continue
            }

            if (
                current.length > 0 &&
                typeof current[0] === 'object' &&
                current[0] !== null &&
                'key' in current[0]
            ) {
                const item = current.find(
                    (m: { key: string }) => m.key === segment,
                )
                current = item
                continue
            }
        }

        current = (current as Record<string, unknown>)[segment]
    }
    return current
}

export function renderTemplate(
    template: string,
    context: Record<string, unknown>,
    keepTemplateWhenEmpty: boolean = false,
): string {
    if (!template) return ''
    return template.replace(
        templateRegex,
        (match, variable: string, filter: string) => {
            try {
                let value = getByPath(context, variable)
                if (value == null) value = ''

                if (filter) {
                    const filterMatch = filterRegex.exec(filter)
                    if (filterMatch) {
                        const filterName = filterMatch[1]
                        const filterArgs = parseFilterArgs(filterMatch[2])
                        const filterFn = filters[filterName]
                        if (typeof filterFn === 'function') {
                            value = filterFn(String(value), filterArgs)
                        }
                    }
                }

                if (typeof value === 'object' && value !== null) {
                    let json = JSON.stringify(value)
                    if (json.length > MAX_OBJECT_RENDER_LENGTH) {
                        json =
                            json.slice(0, MAX_OBJECT_RENDER_LENGTH - 3) + '...'
                    }
                    return json
                }

                if (keepTemplateWhenEmpty && !value) {
                    return match
                }

                return String(value)
            } catch {
                return ''
            }
        },
    )
}
