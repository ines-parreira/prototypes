export type ArticleAttachmentSchema = {
    title: string
    summary: string
}

export function isArticleAttachment(
    attachment: Record<string, unknown>,
): attachment is ArticleAttachmentSchema {
    return Object.keys(attachment).includes('title')
}
