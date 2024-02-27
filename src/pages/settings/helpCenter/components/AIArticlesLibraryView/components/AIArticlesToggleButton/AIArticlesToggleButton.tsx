import React from 'react'
import classNames from 'classnames'

import * as ToggleButton from 'pages/common/components/ToggleButton'
import {
    AIArticleToggleOptionValue,
    AIArticleToggleOption,
} from 'models/helpCenter/types'

import css from './AIArticlesToggleButton.less'

type AIArticlesToggleButtonProps = {
    selectedOption: string
    setSelectedOption: React.Dispatch<
        React.SetStateAction<AIArticleToggleOptionValue>
    >
    options: (AIArticleToggleOption & {count: number})[]
}

const AIArticlesToggleButton = ({
    selectedOption,
    setSelectedOption,
    options,
}: AIArticlesToggleButtonProps) => {
    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={selectedOption}
            onChange={setSelectedOption}
        >
            {options.map((option) => (
                <ToggleButton.Option
                    key={option.value}
                    className={classNames(css.option, {
                        [css.active]: option.value === selectedOption,
                    })}
                    value={option.value}
                >
                    {option.label} ({option.count})
                </ToggleButton.Option>
            ))}
        </ToggleButton.Wrapper>
    )
}

export default AIArticlesToggleButton
