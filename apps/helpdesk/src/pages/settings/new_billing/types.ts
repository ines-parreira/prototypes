export type ProductSubscriptionDescriptions = {
    [key: string]: ProductSubscriptionDescription
}

export type ProductSubscriptionDescription = {
    detailsLink?: {
        label: string
        url: string
    }
    features?: string[]
}
