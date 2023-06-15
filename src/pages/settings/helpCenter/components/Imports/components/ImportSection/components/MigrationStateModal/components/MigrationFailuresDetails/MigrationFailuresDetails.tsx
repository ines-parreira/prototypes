import React, {Fragment, useMemo, useState} from 'react'
import cn from 'classnames'

import Collapse from 'pages/common/components/Collapse/Collapse'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './MigrationFailuresDetails.less'

type Props = {
    title: string
    sections: MigrationFailuresSection[]
}

export interface MigrationFailuresSection {
    title: string
    items: string[]
}

const MigrationFailuresDetails: React.FC<Props> = ({title, sections}) => {
    const [isOpen, setIsOpen] = useState(false)
    const totalCount = sections.reduce(
        (acc, section) => acc + section.items.length,
        0
    )

    const visibleSections = useMemo(
        () => sections.filter(({items}) => items.length > 0),
        [sections]
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
                <Badge
                    className={css.headerCountBadge}
                    type={ColorType.LightError}
                >
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
                        }
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
                            <div className={css.section}>
                                <div className={css.sectionTitle}>
                                    {section.title}
                                </div>
                                <ul className={css.sectionList}>
                                    {section.items.map((item, idx) => (
                                        <li
                                            className={css.sectionListItem}
                                            key={idx}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Fragment>
                    ))}
                </div>
            </Collapse>
        </div>
    )
}

export default MigrationFailuresDetails
