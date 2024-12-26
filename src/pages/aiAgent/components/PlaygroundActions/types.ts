export type PlaygroundAction = {
    label: string
    content?: string
    id: number | string
    onClick: () => void
}
