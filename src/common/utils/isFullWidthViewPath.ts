export default function isFullWidthViewPath(path: string): boolean {
    return /^\/app\/tickets\/\d+$/.test(path)
}
