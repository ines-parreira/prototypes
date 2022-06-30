import React, {ComponentProps, CSSProperties} from 'react'
import {Picker} from 'emoji-mart'
import classNames from 'classnames'

import css from './EmojiPicker.less'

type Props = {
    className?: string
    style?: CSSProperties
} & ComponentProps<typeof Picker>

const EmojiPicker = (props: Props) => (
    <div className={classNames(css.wrapper, props.className)}>
        <Picker
            autoFocus
            native
            color="#0d87dd"
            perLine={8}
            sheetSize={16}
            {...props}
        />
    </div>
)

export default EmojiPicker
