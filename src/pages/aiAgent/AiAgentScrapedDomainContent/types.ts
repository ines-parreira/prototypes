import { Components } from 'rest_api/help_center_api/client.generated'

export type ScrapedContent = {
    // to be completed in the next iteration
    // https://linear.app/gorgias/issue/AIKNL-88/implement-functionality-for-pages-content-tab
    // https://linear.app/gorgias/issue/AIKNL-89/implement-functionality-for-product-content-tab
    id: number
    title: string
    image?: {
        src: string
    } | null
}

export type IngestionLog = Components.Schemas.IngestionLogDto
