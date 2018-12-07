import decorateComponentWithProps from 'decorate-component-with-props'
import InlineStyle from './InlineStyle'

export { default as InlineStyle } from './InlineStyle'
export { default as AddLink } from './AddLink'
export { default as AddImage } from './AddImage'
export { default as AddEmoji } from './AddEmoji'

export const Bold = decorateComponentWithProps(InlineStyle, {
    icon: 'format_bold',
    style: 'BOLD',
    name: 'Bold'
})


export const Italic = decorateComponentWithProps(InlineStyle, {
    icon: 'format_italic',
    style: 'ITALIC',
    name: 'Italic'
})

export const Underline = decorateComponentWithProps(InlineStyle, {
    icon: 'format_underline',
    style: 'UNDERLINE',
    name: 'Underline'
})
