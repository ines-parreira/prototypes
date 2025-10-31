import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/charts/Legend.less'
import CheckBox from 'pages/common/forms/CheckBox'

type LegendItem = {
    label: string
    color: string
    tooltip?: string
    isChecked?: boolean
    isDisabled?: boolean
    onChange?: (value: boolean) => void
}

type Props = {
    className?: string
    items: LegendItem[]
    toggleLegend?: boolean
}

export default function Legend({
    items,
    className,
    toggleLegend = false,
}: Props) {
    const withTooltip = (label: string, tooltip?: string) => {
        const tooltipId = tooltip
            ? `legend-${tooltip.replace(/[^a-zA-Z0-9]/g, '_')}`
            : undefined

        return tooltipId ? (
            <>
                <span id={tooltipId}>{label}</span>
                <Tooltip target={tooltipId} trigger={['hover']}>
                    {tooltip}
                </Tooltip>
            </>
        ) : (
            label
        )
    }

    return (
        <div className={classNames(css.legend, className)}>
            {toggleLegend
                ? items.map(
                      (
                          {
                              label,
                              color,
                              tooltip,
                              isChecked,
                              onChange,
                              isDisabled,
                          },
                          index,
                      ) => (
                          <CheckBox
                              key={`${label}-${index}`}
                              className={css.legendCheckbox}
                              isChecked={isChecked}
                              isDisabled={isDisabled}
                              onChange={onChange}
                              {...(isChecked && {
                                  style: {
                                      backgroundColor: color,
                                      borderColor: color,
                                  },
                              })}
                          >
                              {withTooltip(label, tooltip)}
                          </CheckBox>
                      ),
                  )
                : items.map(({ label, color, tooltip }, index) => (
                      <div className={css.legendItem} key={`${label}-${index}`}>
                          <div
                              className={css.legendCaret}
                              style={{
                                  backgroundColor: color,
                              }}
                          />

                          {withTooltip(label, tooltip)}
                      </div>
                  ))}
        </div>
    )
}
