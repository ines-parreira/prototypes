import React from 'react'
import classNames from 'classnames'

import CheckBox from 'pages/common/forms/CheckBox'
import css from './Legend.less'

type LegendItem = {
    label: string
    color: string
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
    return (
        <div className={classNames(css.legend, className)}>
            {toggleLegend
                ? items.map(({label, color, isChecked, onChange}) => (
                      <CheckBox
                          key={label}
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
                          {label}
                      </CheckBox>
                  ))
                : items.map(({label, color}) => (
                      <div className={css.legendItem} key={label}>
                          <div
                              className={css.legendCaret}
                              style={{
                                  backgroundColor: color,
                              }}
                          />

                          {label}
                      </div>
                  ))}
        </div>
    )
}
