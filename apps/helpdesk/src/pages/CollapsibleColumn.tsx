import type React from 'react'
import { useEffect, useMemo } from 'react'

import { usePanels } from '@repo/layout'
import cn from 'classnames'

import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import appCss from './App.less'
import css from './CollapsibleColumn.less'

// `App.less` has a `:global(.globalNav) :local .container` rule that adds
// `padding: xs` to anything with `appCss.container`. That outranks our
// `-closed` padding-reset, so we only opt in to `.container` while open;
// the open variant already supplies its own padding.

const DEFAULT_COLLAPSIBLE_COLUMN_WIDTH = 480

function parseColumnWidth(value: string | undefined): number {
    if (!value) return DEFAULT_COLLAPSIBLE_COLUMN_WIDTH
    const parsed = parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : DEFAULT_COLLAPSIBLE_COLUMN_WIDTH
}

export const CollapsibleColumn = () => {
    const collapsibleColumnClassName = 'collapsible-column'
    const {
        isCollapsibleColumnOpen,
        collapsibleColumnChildren,
        collapsibleColumnRef,
        collapsibleColumnWidthConfig,
    } = useCollapsibleColumn()
    const { subtractSize } = usePanels()

    const reservedWidth = useMemo(() => {
        if (!isCollapsibleColumnOpen) return 0
        return parseColumnWidth(collapsibleColumnWidthConfig?.width)
    }, [isCollapsibleColumnOpen, collapsibleColumnWidthConfig?.width])

    // Inform the enclosing <Panels> system (wayfinding layout) that this
    // column reserves horizontal space so sibling panels shrink to fit.
    // Outside a Panels context, subtractSize is a no-op.
    useEffect(() => {
        if (reservedWidth === 0) return
        return subtractSize(reservedWidth)
    }, [reservedWidth, subtractSize])

    const widthStyle = collapsibleColumnWidthConfig
        ? ({
              '--collapsible-column-width': collapsibleColumnWidthConfig.width,
              '--collapsible-column-max-width':
                  collapsibleColumnWidthConfig.maxWidth,
              '--collapsible-column-min-width':
                  collapsibleColumnWidthConfig.minWidth,
          } as React.CSSProperties)
        : undefined

    return (
        <div
            className={cn(
                'flex-column',
                isCollapsibleColumnOpen && appCss.container,
                css[collapsibleColumnClassName],
                isCollapsibleColumnOpen
                    ? css[`${collapsibleColumnClassName}-open`]
                    : css[`${collapsibleColumnClassName}-closed`],
            )}
            style={widthStyle}
        >
            <div
                className={cn(
                    'd-flex flex-grow-1',
                    appCss.contentInfobar,
                    appCss.withCollapsibleColumn,
                    css['collapsible-column-content'],
                )}
            >
                <div
                    className={cn('d-flex flex-grow-1', appCss.content)}
                    ref={collapsibleColumnRef}
                >
                    {isCollapsibleColumnOpen && collapsibleColumnChildren}
                </div>
            </div>
        </div>
    )
}
