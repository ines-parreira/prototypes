import React from 'react'
import {screen, render, waitFor, fireEvent} from '@testing-library/react'
import {fetchMacrosProperties} from 'models/macro/resources'

import MacroFilters from '../MacroFilters'

jest.mock('models/macro/resources', () => {
    return {
        fetchMacrosProperties: jest.fn(() => ({
            languages: ['en', 'fr'],
            tags: ['tag1', 'tag2'],
        })),
    }
})

describe('<MacroFilters />', () => {
    beforeEach(() => {
        jest.resetAllMocks
    })
    const minProps = {
        selectedProperties: {
            languages: ['fr'],
            tags: ['tag1', 'tag2'],
        },
        onChange: jest.fn(),
    }
    it('should render MacroFilters', async () => {
        const {container} = render(<MacroFilters {...minProps} />)
        await waitFor(() => {
            expect(fetchMacrosProperties).toHaveBeenCalled()
        })
        expect(container.firstChild).toMatchSnapshot()
        expect(fetchMacrosProperties).toHaveBeenCalledWith([
            'languages',
            'tags',
        ])
    })

    it('should render correctly set filters after click language', async () => {
        const {getByText} = render(<MacroFilters {...minProps} />)
        await waitFor(() => {
            screen.getByText('English')
        })

        fireEvent.click(getByText('English'))
        expect(minProps.onChange).toHaveBeenCalledWith({
            languages: ['en', null],
            tags: ['tag1', 'tag2'],
        })
    })

    it('should render correctly set filters after click tags', async () => {
        const {getByText} = render(<MacroFilters {...minProps} />)
        await waitFor(() => {
            screen.getByText('English')
        })

        fireEvent.click(getByText('tag2'))
        expect(minProps.onChange).toHaveBeenCalledWith({
            languages: ['fr'],
            tags: ['tag1'],
        })
    })
})
