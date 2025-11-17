import React from 'react'

import { userEvent } from '@repo/testing'
import { render } from '@testing-library/react'

import type { AIArticleToggleOption } from 'models/helpCenter/types'
import { AIArticleToggleOptionValue } from 'models/helpCenter/types'

import { AI_ARTICLES_TOGGLE_OPTIONS } from '../../../constants'
import AIArticlesToggleButton from '../AIArticlesToggleButton'

describe('AIArticlesToggleButton', () => {
    const countArray = [3, 8, 11]

    const options: (AIArticleToggleOption & { count: number })[] =
        AI_ARTICLES_TOGGLE_OPTIONS.map((option, index) => ({
            ...option,
            label: `Label ${index + 1}`, // this way we have only strings
            count: countArray[index],
        }))

    it('renders the toggle buttons correctly', () => {
        const { getByText } = render(
            <AIArticlesToggleButton
                selectedOption={AIArticleToggleOptionValue.New}
                setSelectedOption={jest.fn()}
                options={options}
            />,
        )

        options.forEach((option) => {
            const label = option.label as string
            const button = getByText(`${label} (${option.count})`)
            expect(button).toBeInTheDocument()
        })
    })

    it('calls setSelectedOption when a button is clicked', () => {
        const setSelectedOption = jest.fn()
        const { getByText } = render(
            <AIArticlesToggleButton
                selectedOption={AIArticleToggleOptionValue.New}
                setSelectedOption={setSelectedOption}
                options={options}
            />,
        )

        const optionToClick = options[1]

        const button = getByText(
            `${optionToClick.label as string} (${optionToClick.count})`,
        )
        userEvent.click(button)

        expect(setSelectedOption).toHaveBeenCalledWith(optionToClick.value)
    })
})
