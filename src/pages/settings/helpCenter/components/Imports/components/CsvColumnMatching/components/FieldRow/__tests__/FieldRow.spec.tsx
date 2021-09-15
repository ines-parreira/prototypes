import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {Props as FieldRowProps} from '../FieldRow'

import {FieldRow} from '..'

const props: FieldRowProps = {
    fieldName: 'Article Title',
    currentMapping: {
        source: {
            kind: 'CSV_COLUMN',
            csv_column: 'article_name',
        },
    },
    csvColumnsByName: new Map([
        [
            'article_id',
            {
                name: 'article_id',
                samples: ['ftsrt', 'bstts', 'dvst7', 'e78ts', 'fff77'],
            },
        ],
        [
            'article_name',
            {
                name: 'article_name',
                samples: ['toto', 'titi', 'tata', 'toutou', 'tutu'],
            },
        ],
    ]),
    onChangeMapping: jest.fn(),
    isRequired: false,
    preview: ['What is Gorgias?', 'Customer data privacy'],
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('<FieldRow />', () => {
    it('renders field row', () => {
        const {container} = render(<FieldRow {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('returns undefined mapping if - No selection - is clicked in options', () => {
        const {getByText} = render(<FieldRow {...props} />)

        fireEvent.click(getByText('- No selection -'))

        expect(props.onChangeMapping).toHaveBeenLastCalledWith(undefined)
    })
})
