import React from 'react'

import {openChat} from '../../../../../../utils'

import css from './OpenChatButton.less'

type Props = {
    label: string
}

const OpenChatButton = ({label}: Props) => {
    return (
        <button onClick={openChat} className={css.button}>
            {label}
        </button>
    )
}

export default OpenChatButton
