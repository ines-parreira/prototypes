import { DND_ENTITIES } from '../components/CategoriesTable/constants'

export const getCategoryDndType = (id: number | null) => {
    return `${DND_ENTITIES.CATEGORY}${id || ''}`
}
