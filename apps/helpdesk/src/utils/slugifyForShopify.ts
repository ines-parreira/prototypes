export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-') // Replace non-alphanumeric characters (excluding hyphens and underscores) with a single hyphen
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '') // Trim leading and trailing hyphens
}
