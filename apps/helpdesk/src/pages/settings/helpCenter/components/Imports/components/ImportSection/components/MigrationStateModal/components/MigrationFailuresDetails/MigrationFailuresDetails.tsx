import React, { Fragment, useMemo, useState } from 'react'

import cn from 'classnames'

import { Badge } from '@gorgias/axiom'

import Collapse from 'pages/common/components/Collapse/Collapse'

import css from './MigrationFailuresDetails.less'

type Props = {
    title: string
    sections: MigrationFailuresSection[]
}

export interface MigrationFailuresSection {
    title: string
    items: MigrationFailuresSectionItem[]
}

export interface MigrationFailuresSectionItem {
    title: string
    message: string
}

const MigrationFailuresDetails: React.FC<Props> = ({ title, sections }) => {
    const [isOpen, setIsOpen] = useState(false)
    const totalCount = sections.reduce(
        (acc, section) => acc + section.items.length,
        0,
    )

    const visibleSections = useMemo(
        () => sections.filter(({ items }) => items.length > 0),
        [sections],
    )

    const handleToggle = () => setIsOpen((prev) => !prev)

    if (totalCount === 0) return null

    return (
        <div className={css.wrapper}>
            <div
                className={cn(css.header, {
                    [css.open]: isOpen,
                })}
                onClick={handleToggle}
            >
                <Badge className={css.headerCountBadge} type={'light-error'}>
                    <i className="material-icons mr-2">error_outline</i>
                    {totalCount}
                </Badge>

                <div className={css.headerTitle}>{title}</div>

                <i
                    className={cn(
                        'material-icons',
                        'mr-2',
                        css.headerToggleIcon,
                        {
                            [css.open]: isOpen,
                        },
                    )}
                >
                    expand_more
                </i>
            </div>
            <Collapse isOpen={isOpen}>
                <div className={css.collapseContent}>
                    {visibleSections.map((section, idx) => (
                        <Fragment key={idx}>
                            <hr className={css.separator} />
                            <table className={css.section}>
                                <caption className={css.sectionTitle}>
                                    {section.title}
                                </caption>
                                <thead>
                                    <tr>
                                        <th>Row</th>
                                        <th>Error message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.title}</td>
                                            <td className={css.sectionMessage}>
                                                {item.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Fragment>
                    ))}
                </div>
            </Collapse>
        </div>
    )
}

export default MigrationFailuresDetails
