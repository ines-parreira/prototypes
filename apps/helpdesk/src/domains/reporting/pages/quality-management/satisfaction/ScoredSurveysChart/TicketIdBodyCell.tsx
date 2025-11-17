import React, { useRef } from 'react'

import { Link } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'
import type { Props as BodyCellProps } from 'pages/common/components/table/cells/BodyCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

const TOOLTIP_CONTENT = 'Open ticket in new tab'

export type Props = Omit<BodyCellProps, 'children' | 'ref'> & {
    ticketId: string | null
}

export default function TicketIdBodyCell({
    ticketId,
    width,
    height,
    innerClassName,
    justifyContent,
}: Props) {
    const IconButtonRef = useRef<HTMLButtonElement>(null)
    return (
        <BodyCell
            width={width}
            height={height}
            innerClassName={innerClassName}
            justifyContent={justifyContent}
        >
            <Link
                to={`/app/ticket/${ticketId}#satisfactionSurvey`}
                target="_blank"
                rel="noopener noreferrer"
                role="link"
            >
                <IconButton
                    ref={IconButtonRef}
                    intent="secondary"
                    fillStyle="ghost"
                    size="small"
                >
                    open_in_new
                </IconButton>
            </Link>
            <Tooltip target={IconButtonRef} placement="top">
                {TOOLTIP_CONTENT}
            </Tooltip>
        </BodyCell>
    )
}
