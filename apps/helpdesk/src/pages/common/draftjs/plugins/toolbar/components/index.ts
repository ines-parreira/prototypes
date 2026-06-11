import decorateComponentWithProps from 'decorate-component-with-props'

import { InlineStyle } from './InlineStyle'

export { InlineStyle } from './InlineStyle'
export { DefaultExportAddLink as AddLink } from './AddLink'
export { AddImage } from './AddImage'
export { AddVideo } from './AddVideo'
export { AddEmoji } from './AddEmoji'
export { AddProductLink } from './AddProductLink'
export { AddDiscountCode } from './AddDiscountCode'
export { Translate } from './Translate'

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

export { HeadingPicker } from './HeadingPicker'
