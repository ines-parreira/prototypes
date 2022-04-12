import React, {ReactNode} from 'react'
import {Button} from 'reactstrap'

import PopoverModal from 'pages/common/components/PopoverModal'

import css from './HeaderWithInfo.less'

type Props = {
    title: string
    description: ReactNode
    helpUrl: string
}

export default function HeaderWithInfo({title, description, helpUrl}: Props) {
    return (
        <h1 className="align-items-center">
            <span>{title}</span>
            <PopoverModal className="ml-3" placement="bottom-start">
                <p className={css.learnMoreContent}>{description}</p>
                <Button
                    className={css.titleTooltipButton}
                    color="secondary"
                    type="button"
                    onClick={() => {
                        window.open(helpUrl, '_blank', 'noopener')!.focus()
                    }}
                >
                    Learn More <i className="material-icons">arrow_forward</i>
                </Button>
            </PopoverModal>
        </h1>
    )
}
