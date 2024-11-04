import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useMemo} from 'react'

import useId from 'hooks/useId'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './MigrationQuickSummary.less'

type Props = {
    title: string
    providerName: string
    entries: QuickSummaryEntry[]
}

export interface QuickSummaryEntry {
    label: string

    exported: number
    imported: number
    failed: number

    // Don't hide even if all of above are zeros
    showAlways?: boolean
}

const MigrationQuickSummary: React.FC<Props> = ({
    title,
    providerName,
    entries,
}) => {
    const uniqueId = useId()

    const visibleEntries = useMemo(
        () =>
            entries.filter(
                ({exported, imported, failed, showAlways}) =>
                    showAlways || exported || imported || failed
            ),
        [entries]
    )

    const getBadgeId = (
        entryIdx: number,
        type: 'exported' | 'imported' | 'failed'
    ) => `quick-summary-tooltip-${uniqueId}-${entryIdx}-${type}`

    return (
        <div className={css.wrapper}>
            <div className={css.title}>{title}</div>
            <div>
                {visibleEntries.map((entry, idx) => {
                    return (
                        <div className={css.entry} key={idx}>
                            <div className={css.entryLabel}>{entry.label}</div>
                            <div className={css.entryStats}>
                                {/* Always show exported, even if 0 */}
                                <Badge
                                    id={getBadgeId(idx, 'exported')}
                                    type={ColorType.Blue}
                                >
                                    <i className="material-icons mr-2">
                                        upload
                                    </i>
                                    {entry.exported}
                                </Badge>
                                {entry.imported > 0 && (
                                    <Badge
                                        id={getBadgeId(idx, 'imported')}
                                        type={ColorType.LightSuccess}
                                    >
                                        <i className="material-icons mr-2">
                                            check_circle
                                        </i>
                                        {entry.imported}
                                    </Badge>
                                )}
                                {entry.failed > 0 && (
                                    <Badge
                                        id={getBadgeId(idx, 'failed')}
                                        type={ColorType.LightError}
                                    >
                                        <i className="material-icons mr-2">
                                            error_outline
                                        </i>
                                        {entry.failed}
                                    </Badge>
                                )}
                                <Tooltip
                                    placement="left"
                                    target={getBadgeId(idx, 'exported')}
                                >
                                    Exported from {providerName}
                                </Tooltip>
                                {entry.imported > 0 && (
                                    <Tooltip
                                        placement="left"
                                        target={getBadgeId(idx, 'imported')}
                                    >
                                        Successfully imported
                                    </Tooltip>
                                )}
                                {entry.failed > 0 && (
                                    <Tooltip
                                        placement="left"
                                        target={getBadgeId(idx, 'failed')}
                                    >
                                        Failed to import
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MigrationQuickSummary
