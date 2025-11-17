import { useMemo } from 'react'

import type { TooltipLabelStyle, TooltipModel } from 'chart.js'
import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/charts/ChartTooltipContent.less'
import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import { NOT_AVAILABLE_TEXT } from 'domains/reporting/pages/common/utils'

type Props = {
    tooltip: TooltipModel
    showZeroAsNA?: boolean
    withTotal?: boolean
}

export const TOTAL_LABEL = 'Total'

export const ChartTooltipContent = ({
    tooltip: { labelColors, dataPoints },
    showZeroAsNA,
    withTotal,
}: Props) => {
    const total = useMemo(() => {
        if (!withTotal) return null
        return dataPoints.reduce(
            (acc, item) => acc + Number(item.formattedValue),
            0,
        )
    }, [dataPoints, withTotal])

    return (
        <>
            {dataPoints.map((item, index) => {
                const currentLabel = labelColors[index] as unknown as Record<
                    keyof TooltipLabelStyle,
                    string
                >

                return (
                    <div key={item.dataset.label} className={css.tooltipItem}>
                        <div
                            className={css.tooltipItemBox}
                            style={{
                                backgroundColor: currentLabel.backgroundColor,
                                borderWidth: currentLabel.borderWidth,
                                borderColor: currentLabel.borderColor,
                                borderRadius:
                                    Number(currentLabel.borderRadius) || 2,
                            }}
                        />
                        <div className={classNames(css.tooltipSpaceBetween)}>
                            <TruncateCellContent
                                left
                                content={`${item.dataset.label}:`}
                                className={css.tooltipItemLabel}
                            />
                            <span className={css.tooltipItemValue}>
                                {showZeroAsNA && item.formattedValue === '0'
                                    ? NOT_AVAILABLE_TEXT
                                    : item.formattedValue}
                            </span>
                        </div>
                    </div>
                )
            })}
            {total && (
                <div className={classNames(css.tooltipTotalWrapper)}>
                    <div className={css.tooltipSeparator} />
                    <div className={css.tooltipSpaceBetween}>
                        <span>{TOTAL_LABEL}</span>
                        <span className={css.tooltipItemValue}>{total}</span>
                    </div>
                </div>
            )}
        </>
    )
}
