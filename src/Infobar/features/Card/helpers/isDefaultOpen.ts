import {Template} from 'models/widget/types'

type Params = {
    isEditing: boolean
    parentTemplate?: Template
    isFirstOfList?: boolean
}

export function isDefaultOpen({
    isEditing,
    parentTemplate,
    isFirstOfList,
}: Params) {
    if (!parentTemplate || isEditing || isFirstOfList) return true
    const type = parentTemplate.type
    if (type === 'wrapper' || type === 'card') {
        return true
    }
    return false
}
