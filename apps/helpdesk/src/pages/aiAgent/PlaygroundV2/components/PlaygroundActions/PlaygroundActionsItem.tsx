import React, { useState } from 'react'

import { Popover, PopoverBody } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import { sanitizeHtmlDefault } from 'utils/html'

import type { PlaygroundAction } from './types'

import css from './PlaygroundActionsItem.less'

type Props = {
    action: PlaygroundAction
}

export const PlaygroundActionsItem = ({ action }: Props) => {
    const appNode = useAppNode()
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const { label, content, id, onClick } = action

    return (
        <>
            <Button
                intent="secondary"
                id={`template-button-${id}`}
                onClick={onClick}
                onMouseEnter={() => {
                    setIsPreviewOpen(true)
                }}
                onMouseLeave={() => setIsPreviewOpen(false)}
                size="small"
            >
                {label}
            </Button>

            {content ? (
                <Popover
                    target={`template-button-${id}`}
                    placement="top"
                    container={appNode ?? undefined}
                    trigger="legacy"
                    isOpen={isPreviewOpen}
                    popperClassName={css.popover}
                >
                    <PopoverBody className={css.PopoverBody}>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(content),
                            }}
                        />
                    </PopoverBody>
                </Popover>
            ) : null}
        </>
    )
}
