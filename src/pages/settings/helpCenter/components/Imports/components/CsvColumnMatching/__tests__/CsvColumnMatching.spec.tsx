import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import CsvColumnMatching, {
    Props as CsvColumnMatchingProps,
} from '../CsvColumnMatching'

import {getSingleHelpCenterResponseFixture as helpCenter} from '../../../../../fixtures/getHelpCentersResponse.fixture'

import {getLocalesResponseFixture as locales} from '../../../../../fixtures/getLocalesResponse.fixtures'

import {analyseCsvResponse} from '../../../../../fixtures/analyseCsvResponse.fixture'

const props: CsvColumnMatchingProps = {
    helpCenter,
    locales,
    onCancel: jest.fn(),
    onImport: jest.fn(),
    csvColumns: analyseCsvResponse.columns,
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('<CsvColumnMatching />', () => {
    it('renders initial mappings with default help center locale', () => {
        const {container} = render(<CsvColumnMatching {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('returns the mappings when Confirm import button clicked', () => {
        const {getByText} = render(<CsvColumnMatching {...props} />)

        fireEvent.click(getByText('Confirm Import'))

        expect(props.onImport).toHaveBeenLastCalledWith([
            {
                localeCode: 'en-US',
                mappings: {
                    ArticleContent: {
                        source: {csv_column: 'body', kind: 'CSV_COLUMN'},
                    },
                    ArticleExcerpt: {source: {kind: 'AUTO_GENERATED'}},
                    ArticleSlug: {source: {kind: 'AUTO_GENERATED'}},
                    ArticleTitle: {
                        source: {csv_column: 'title', kind: 'CSV_COLUMN'},
                    },
                    CategoryName: {
                        source: {
                            csv_column: 'category_title',
                            kind: 'CSV_COLUMN',
                        },
                    },
                    CategorySlug: {source: {kind: 'AUTO_GENERATED'}},
                },
            },
        ])
    })
})
