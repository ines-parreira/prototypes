export function isFullWidthViewPath(path: string): boolean {
    return /^\/app\/tickets\/\d+/.test(path)
}
