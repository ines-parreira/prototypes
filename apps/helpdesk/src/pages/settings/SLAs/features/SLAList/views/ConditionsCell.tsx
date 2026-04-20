import type { PropsWithRef } from 'react'
import React, { useMemo } from 'react'

import { Tag, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { Props as BodyCellProps } from 'pages/common/components/table/cells/BodyCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import useResolveConditions from 'pages/settings/SLAs/features/SLAForm/controllers/useResolveConditions'
import { getShortLabel } from 'pages/settings/SLAs/features/SLAForm/views/ConditionsSelect/types'

import type { UISLAPolicy } from '../types'
import CellLinkWrapper from './CellLinkWrapper'

import css from './ConditionsCell.less'

const CONDITIONS_LIMIT = 2

export default function ConditionsCell({
    policy,
    bodyCellProps,
}: {
    policy: UISLAPolicy
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) {
    const { uuid, filters } = policy
    const { conditions } = useResolveConditions(filters)

    const hasMore = conditions.length > CONDITIONS_LIMIT
    const slicedConditions = useMemo(
        () => conditions.slice(0, CONDITIONS_LIMIT),
        [conditions],
    )

    const tooltipContent = useMemo(
        () => conditions.map((c) => c.displayLabel).join(', '),
        [conditions],
    )

    const tags = (
        <div className={css.container}>
            {slicedConditions.map((item) => (
                <Tag
                    key={`${uuid}-${item.category}-${item.fieldId}-${item.value}`}
                    size="sm"
                >
                    {getShortLabel(item)}
                </Tag>
            ))}
            {hasMore && (
                <span className={css.surplus}>
                    +{conditions.length - CONDITIONS_LIMIT}
                </span>
            )}
        </div>
    )

    return (
        <BodyCell {...bodyCellProps}>
            <CellLinkWrapper to={`/app/settings/sla/${uuid}`}>
                {conditions.length > 0 ? (
                    <Tooltip trigger={<span>{tags}</span>}>
                        <TooltipContent title={tooltipContent} />
                    </Tooltip>
                ) : (
                    tags
                )}
            </CellLinkWrapper>
        </BodyCell>
    )
}
