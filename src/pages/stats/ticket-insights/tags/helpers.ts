export const getTagName = ({
    name,
    id,
}: {
    name?: string
    id: string
}): string => {
    return name || `${id} (deleted)`
}
