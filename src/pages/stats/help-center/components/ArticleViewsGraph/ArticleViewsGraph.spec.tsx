import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import moment from 'moment'
import {CoreScaleOptions, Scale} from 'chart.js'
import ArticleViewsGraph, {renderXTickLabel} from './ArticleViewsGraph'

const renderComponent = (
    props: Partial<ComponentProps<typeof ArticleViewsGraph>>
) => {
    return render(<ArticleViewsGraph data={[]} isLoading={false} {...props} />)
}

describe('<ArticleViewsGraph />', () => {
    it('should render', () => {
        renderComponent({})

        expect(screen.getByText('Article views')).toBeInTheDocument()
    })

    it('should show loading state', () => {
        renderComponent({isLoading: true})

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    describe('renderXTickLabel', () => {
        it('should return valid date', () => {
            expect(
                renderXTickLabel.call(
                    {
                        getLabelForValue: () => moment('2023-10-06'),
                    } as unknown as Scale<CoreScaleOptions>,
                    '',
                    0
                )
            ).toEqual('Oct 6')
        })

        it('should return input when date is invalid', () => {
            expect(
                renderXTickLabel.call(
                    {
                        getLabelForValue: () => 'invalid date',
                    } as unknown as Scale<CoreScaleOptions>,
                    '',
                    0
                )
            ).toEqual('invalid date')
        })
    })
})
