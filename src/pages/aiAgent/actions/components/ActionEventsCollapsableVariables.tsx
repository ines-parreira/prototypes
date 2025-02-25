import React, { useState } from 'react'

import classnames from 'classnames'

import Collapse from 'pages/common/components/Collapse/Collapse'
import { JSONValue } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import css from './ActionEventSidePanel.less'

export default function CollapsableVariables({
    title,
    body,
}: {
    title: string
    body?: JSONValue
}) {
    const [isOpen, setIsOpen] = useState(false)

    const handleCollapse = () => {
        setIsOpen((prev) => !prev)
    }

    return (
        <>
            {body && Object.keys(body).length > 0 && (
                <div className={css.variableCollapsable}>
                    <p onClick={handleCollapse}>
                        <i
                            className={classnames('material-icons', {
                                [css.collapsed]: isOpen,
                            })}
                        >
                            play_arrow
                        </i>
                        {title}
                    </p>
                    <Collapse isOpen={isOpen}>
                        <pre>{JSON.stringify(body, null, 2)}</pre>
                    </Collapse>
                </div>
            )}
        </>
    )
}
