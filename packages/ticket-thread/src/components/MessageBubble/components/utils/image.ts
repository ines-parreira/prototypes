import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

export function getFileExtension(name: string | undefined): string {
    const ext = name?.split('.').pop()
    return ext && /^[a-z0-9]{2,5}$/i.test(ext) ? ext : 'File'
}

export function isImage(attachment: TicketMessageAttachment): boolean {
    const { content_type } = attachment
    return (
        !['image/heic', 'image/heif'].includes(content_type) && // We cannot render heif/heic images in the browser CF https://caniuse.com/?search=heif.
        content_type.startsWith('image/')
    )
}
