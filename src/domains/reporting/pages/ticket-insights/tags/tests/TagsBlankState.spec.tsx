import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    BLANK_STATE_TEXT,
    BLANK_STATE_TITLE,
    TagsBlankState,
} from 'domains/reporting/pages/ticket-insights/tags/TagsBlankState'

describe('<TagsBlankState>', () => {
    it('should render', () => {
        render(<TagsBlankState />)

        expect(screen.getByText(BLANK_STATE_TEXT)).toBeInTheDocument()
        expect(screen.getByText(BLANK_STATE_TITLE)).toBeInTheDocument()
    })
})
