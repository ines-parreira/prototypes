import decorateComponentWithProps from 'decorate-component-with-props'

import InlineStyle from './InlineStyle'

export { default as InlineStyle } from './InlineStyle'
export { default as AddLink } from './AddLink'
export { default as AddImage } from './AddImage'
export { default as AddVideo } from './AddVideo'
export { default as AddEmoji } from './AddEmoji'
export { default as AddProductLink } from './AddProductLink'
export { default as AddDiscountCode } from './AddDiscountCode'
export { default as Translate } from './Translate'

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

export const BulletedList = decorateComponentWithProps(InlineStyle, {
    icon: 'format_list_bulleted',
    style: 'unordered-list-item',
    isBlockType: true,
    name: 'Bulleted List',
})

export const OrderedList = decorateComponentWithProps(InlineStyle, {
    icon: 'format_list_numbered',
    style: 'ordered-list-item',
    isBlockType: true,
    name: 'Ordered List',
})

export { default as HeadingPicker } from './HeadingPicker'
