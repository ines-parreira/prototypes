import React from 'react'
import {render, screen} from '@testing-library/react'
import {
    NewTagsBlankState,
    BLANK_STATE_TEXT,
    BLANK_STATE_TITLE,
} from 'pages/stats/NewTagsBlankState'

describe('<NewTagsBlankState>', () => {
    it('should render', () => {
        render(<NewTagsBlankState />)

        expect(screen.getByText(BLANK_STATE_TEXT)).toBeInTheDocument()
        expect(screen.getByText(BLANK_STATE_TITLE)).toBeInTheDocument()
    })
})
