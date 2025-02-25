import React from 'react'

import classNames from 'classnames'

import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'

import css from './LevelOfCoverage.less'

export enum CoverageLevel {
    BEGINNER = 'beginner',
    ADVANCED = 'advanced',
}

type LevelOfCoverageProps = {
    coverageRate: number
    onCoverageRateChange: (value: number) => void
}

export const BEGINNER_COVERAGE_RATE = 0.25
export const ADVANCED_COVERAGE_RATE = 1

export const getEffectiveCoverageLevel = (coverageRate: number) => {
    return coverageRate > BEGINNER_COVERAGE_RATE
        ? CoverageLevel.ADVANCED
        : CoverageLevel.BEGINNER
}

export const getEffectiveTicketSampleRate = (ticketSampleRate: number) => {
    const effectiveCoverageLevel = getEffectiveCoverageLevel(ticketSampleRate)

    return effectiveCoverageLevel === CoverageLevel.BEGINNER
        ? BEGINNER_COVERAGE_RATE
        : ADVANCED_COVERAGE_RATE
}

export const LevelOfCoverage = ({
    coverageRate,
    onCoverageRateChange,
}: LevelOfCoverageProps) => {
    const effectiveCoverageLevel = getEffectiveCoverageLevel(coverageRate)

    return (
        <div className={css.container}>
            <div className={classNames(['body-semibold', css.title])}>
                Level of coverage
            </div>

            <div className={css.radioButtonGroup}>
                <PreviewRadioButton
                    value="level-of-coverage-beginner"
                    isSelected={
                        effectiveCoverageLevel === CoverageLevel.BEGINNER
                    }
                    label="Beginner"
                    caption="Recommended to start. Allows AI Agent to access fewer tickets, giving you time to become familiar with AI Agent and monitor its responses at your own pace."
                    onClick={() => {
                        onCoverageRateChange(BEGINNER_COVERAGE_RATE)
                    }}
                />
                <PreviewRadioButton
                    value="level-of-coverage-advanced"
                    isSelected={
                        effectiveCoverageLevel === CoverageLevel.ADVANCED
                    }
                    label="Advanced"
                    caption="Recommended once you are comfortable with AI Agent’s responses to customers and want more tickets to be handled by AI Agent."
                    onClick={() => {
                        onCoverageRateChange(ADVANCED_COVERAGE_RATE)
                    }}
                />
            </div>
        </div>
    )
}
