import React from 'react'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'

import CheckBox from 'pages/common/forms/CheckBox'
import css from './Legend.less'

type LegendItem = {
    label: string
    color: string
    tooltip?: string
    isChecked?: boolean
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
                      ({label, color, tooltip, isChecked, onChange}, index) => (
                          <CheckBox
                              key={`${label}-${index}`}
                              className={css.legendCheckbox}
                              isChecked={isChecked}
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
                      )
                  )
                : items.map(({label, color, tooltip}, index) => (
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
