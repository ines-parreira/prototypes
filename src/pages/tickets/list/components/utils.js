export function slugify(string) {
    return string
        .toLowerCase()
        .trim()
        .replace(/[ ]/g, '-')
}
