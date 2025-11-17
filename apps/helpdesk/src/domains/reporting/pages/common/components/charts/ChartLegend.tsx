import type { Chart } from 'chart.js'
import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/charts/ChartLegend.less'
import Legend from 'domains/reporting/pages/common/components/charts/Legend'
import type { TwoDimensionalDataItem } from 'domains/reporting/pages/types'

type LinesVisibility = Record<number, boolean | undefined> | null
type Props = {
    data: TwoDimensionalDataItem[]
    chartColors: (index: number) => string
    linesVisibility: LinesVisibility
    setLinesVisibility: React.Dispatch<React.SetStateAction<LinesVisibility>>
    chart?: Chart
    displayLegend?: boolean
    toggleLegend?: boolean
    legendOnLeft?: boolean
}
export const ChartLegend = ({
    data,
    chartColors,
    linesVisibility,
    setLinesVisibility,
    chart,
    displayLegend = false,
    toggleLegend = false,
    legendOnLeft = false,
}: Props) =>
    displayLegend ? (
        <Legend
            toggleLegend={toggleLegend}
            className={classNames(css.legend, {
                [css.legendOnLeft]: legendOnLeft,
            })}
            items={data.map(({ label, tooltip, isDisabled }, index) => {
                const isChecked =
                    linesVisibility?.[index] ?? chart?.isDatasetVisible(index)

                return {
                    label,
                    tooltip,
                    isDisabled,
                    color: chartColors(index),
                    ...(toggleLegend && {
                        isChecked,
                        onChange: () => {
                            chart?.setDatasetVisibility(index, !isChecked)
                            setLinesVisibility((prevValue) => ({
                                ...prevValue,
                                [index]: !isChecked,
                            }))
                            chart?.update()
                        },
                    }),
                }
            })}
        />
    ) : null
