import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'

export const getOptionsFromTags = (tags: string[]): Option[] => {
    return tags.map((tag) => ({label: tag, value: tag}))
}
