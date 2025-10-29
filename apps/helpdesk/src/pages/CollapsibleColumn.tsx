import cn from 'classnames'

import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import appCss from './App.less'
import css from './CollapsibleColumn.less'

export const CollapsibleColumn = () => {
    const collapsibleColumnClassName = 'collapsible-column'
    const {
        isCollapsibleColumnOpen,
        collapsibleColumnChildren,
        collapsibleColumnRef,
    } = useCollapsibleColumn()

    return (
        <div
            className={cn(
                'flex-column',
                appCss.container,
                css[collapsibleColumnClassName],
                isCollapsibleColumnOpen
                    ? css[`${collapsibleColumnClassName}-open`]
                    : css[`${collapsibleColumnClassName}-closed`],
            )}
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
