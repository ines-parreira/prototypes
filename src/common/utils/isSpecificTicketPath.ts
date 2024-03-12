export default function isSpecificTicketPath(
    path: string,
    ticketId: number
): boolean {
    if (path.startsWith(`/app/ticket/${ticketId}`)) {
        return true
    }

    const match = path.match(/\/app\/views\/\d+\/(\d+)/)
    if (match && match[1] && match[1] === `${ticketId}`) {
        return true
    }

    return false
}
