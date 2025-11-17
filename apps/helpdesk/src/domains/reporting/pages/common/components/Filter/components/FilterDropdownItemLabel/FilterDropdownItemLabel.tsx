import type { ReactNode } from 'react'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import _escapeRegExp from 'lodash/escapeRegExp'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/Filter/components/FilterDropdownItemLabel/FilterDropdownItemLabel.less'
import { LABEL_MAX_WIDTH } from 'domains/reporting/pages/common/components/Filter/constants'
import { highlightString } from 'domains/reporting/pages/utils'
import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'
import { sanitizeHtmlDefault } from 'utils/html'

type Props = {
    label: string
    icon?: ReactNode
}

const FilterDropdownItemLabel = ({ label, icon }: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownSearch must be used within a DropdownContext.Provider',
        )
    }

    const { query } = dropdownContext || {}

    const highlightedLabel = useMemo(() => {
        if (!query) {
            return label
        }

        return highlightString(label, _escapeRegExp(query))
    }, [label, query])

    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        const show = ref.current && ref.current.offsetWidth >= LABEL_MAX_WIDTH

        setShowTooltip(!!show)
    }, [label])

    return (
        <>
            {icon ? (
                typeof icon === 'string' ? (
                    <i className={classnames('icon material-icons', css.icon)}>
                        {icon}
                    </i>
                ) : (
                    icon
                )
            ) : null}
            <div
                ref={ref}
                className={classnames(css.label, showTooltip && css.rtlOption)}
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(highlightedLabel),
                }}
                data-testid="filter-dropdown-item-label"
            />
            {showTooltip && (
                <Tooltip
                    target={ref}
                    placement="bottom-end"
                    boundariesElement={'body'}
                    className={css.tooltip}
                >
                    <div
                        className={css.tooltipContent}
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(highlightedLabel),
                        }}
                    />
                </Tooltip>
            )}
        </>
    )
}

export default FilterDropdownItemLabel
