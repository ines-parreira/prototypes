import { Chart } from 'chart.js'
import classNames from 'classnames'

import Legend from 'pages/stats/common/components/charts/Legend'
import { TwoDimensionalDataItem } from 'pages/stats/types'

import css from './ChartLegend.less'

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
            items={data.map(({ label, tooltip, isDisabled }, index) => ({
                label,
                tooltip,
                isDisabled,
                color: chartColors(index),
                ...(toggleLegend && {
                    isChecked:
                        linesVisibility?.[index] ??
                        chart?.isDatasetVisible(index),
                    onChange: () => {
                        chart?.setDatasetVisibility(
                            index,
                            !chart.isDatasetVisible(index),
                        )
                        setLinesVisibility((prevValue) => ({
                            ...prevValue,
                            [index]: chart?.isDatasetVisible(index),
                        }))
                        chart?.update()
                    },
                }),
            }))}
        />
    ) : null
