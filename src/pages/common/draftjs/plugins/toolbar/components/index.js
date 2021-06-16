import decorateComponentWithProps from 'decorate-component-with-props'

import InlineStyle from './InlineStyle.tsx'

export {default as InlineStyle} from './InlineStyle.tsx'
export {default as AddLink} from './AddLink.tsx'
export {default as AddImage} from './AddImage.tsx'
export {default as AddEmoji} from './AddEmoji.tsx'

export const Bold = decorateComponentWithProps(InlineStyle, {
    icon: 'format_bold',
    style: 'BOLD',
    name: 'Bold',
})

export const Italic = decorateComponentWithProps(InlineStyle, {
    icon: 'format_italic',
    style: 'ITALIC',
    name: 'Italic',
})

export const Underline = decorateComponentWithProps(InlineStyle, {
    icon: 'format_underline',
    style: 'UNDERLINE',
    name: 'Underline',
})
