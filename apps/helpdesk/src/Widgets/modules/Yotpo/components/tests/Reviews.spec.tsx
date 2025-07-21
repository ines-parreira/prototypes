import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { renderWithStore } from 'utils/testing'

import { reviewsCustomization } from '../Reviews'

jest.mock('react-rating-stars-component', () => () => null)

const TitleWrapper = reviewsCustomization.TitleWrapper!
const AfterTitle = reviewsCustomization.AfterTitle!
const BeforeContent = reviewsCustomization.BeforeContent!

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it.each([true, false])(
            'should render both visible and invisible reviews correctly',
            (published) => {
                const { container } = render(
                    <TitleWrapper
                        source={fromJS({ source: { published: published } })}
                    />,
                )

                expect(container.firstChild).toMatchSnapshot()
            },
        )
    })
})

jest.useFakeTimers()

describe('<AfterTitle/>', () => {
    const created_at = jest.setSystemTime(new Date('2020-12-31T00:00:00Z'))
    describe('render()', () => {
        it.each([
            { source: { created_at: created_at, score: 1.5 } },
            { source: { created_at: created_at, score: 0 } },
            { source: { created_at: created_at, score: 5 } },
        ])('should render with different score values', (props) => {
            const { source } = props
            const { container } = renderWithStore(
                <AfterTitle source={fromJS(source)} />,
                {},
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

describe('<BeforeContent/>', () => {
    describe('render()', () => {
        it('should render with no images', () => {
            const { container } = render(
                <BeforeContent
                    source={fromJS({
                        title: 'Review title',
                        content:
                            'Long review content lorem ipsum dolor sit amen...',
                        images_data: [],
                        votes_up: 0,
                        votes_down: 0,
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render images correctly', () => {
            const { container } = render(
                <BeforeContent
                    source={fromJS({
                        title: 'Review title',
                        content:
                            'Long review content lorem ipsum dolor sit amen...',
                        images_data: [
                            {
                                id: 13,
                                thumb_url:
                                    'http://s3.amazonaws.com/yotpo-images-test/Review/29/13/square.jpeg?1457513657',
                                original_url:
                                    'http://s3.amazonaws.com/yotpo-images-test/Review/29/13/original.jpeg?1457513657',
                            },
                            {
                                id: 14,
                                thumb_url:
                                    'http://s3.amazonaws.com/yotpo-images-test/Review/29/14/square.jpeg?1457513714',
                                original_url:
                                    'http://s3.amazonaws.com/yotpo-images-test/Review/29/14/original.jpeg?1457513714',
                            },
                        ],
                        votes_up: 0,
                        votes_down: 0,
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render votes up correctly', () => {
            const { container } = render(
                <BeforeContent
                    source={fromJS({
                        title: 'Review title',
                        content:
                            'Long review content lorem ipsum dolor sit amen...',
                        images_data: [],
                        votes_up: 12,
                        votes_down: 0,
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render votes down correctly', () => {
            const { container } = render(
                <BeforeContent
                    source={fromJS({
                        title: 'Review title',
                        content:
                            'Long review content lorem ipsum dolor sit amen...',
                        images_data: [],
                        votes_up: 0,
                        votes_down: 12,
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render with both votes up and down correctly', () => {
            const { container } = render(
                <BeforeContent
                    source={fromJS({
                        title: 'Review title',
                        content:
                            'Long review content lorem ipsum dolor sit amen...',
                        images_data: [],
                        votes_up: 15,
                        votes_down: 12,
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
