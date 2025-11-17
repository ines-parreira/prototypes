import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'
import { Button } from 'reactstrap'

import PopoverModal from 'pages/common/components/PopoverModal'

import css from './HeaderTitle.less'

type Props = {
    title: ReactNode
    description?: ReactNode
    helpUrl?: string
    className?: string
}

export default function HeaderTitle({
    title,
    description,
    helpUrl,
    className,
}: Props) {
    return (
        <h1 className={classnames('align-items-center', className)}>
            <span>{title}</span>

            {description && (
                <PopoverModal className="ml-3" placement="bottom-start">
                    <p className={css.learnMoreContent}>{description}</p>

                    {helpUrl && (
                        <Button
                            className={css.titleTooltipButton}
                            color="secondary"
                            type="button"
                            onClick={() => {
                                const windowRef = window.open(
                                    helpUrl,
                                    '_blank',
                                    'noopener',
                                )
                                windowRef?.focus()
                            }}
                        >
                            Learn More{' '}
                            <i className="material-icons">arrow_forward</i>
                        </Button>
                    )}
                </PopoverModal>
            )}
        </h1>
    )
}
