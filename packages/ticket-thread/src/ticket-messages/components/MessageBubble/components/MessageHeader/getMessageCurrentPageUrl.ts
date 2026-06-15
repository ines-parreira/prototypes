export function getMessageCurrentPageUrl(meta: unknown): string | null {
    if (!meta || typeof meta !== 'object' || !('current_page' in meta)) {
        return null
    }

    const currentPage = meta.current_page

    return typeof currentPage === 'string' && currentPage.length > 0
        ? currentPage
        : null
}
