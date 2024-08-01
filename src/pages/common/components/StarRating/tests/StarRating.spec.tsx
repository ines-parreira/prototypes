import React from 'react'
import ReactStar from 'react-rating-stars-component'
import {render} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'

import {DEFAULT_SIZE, STAR_COLORS} from '../constants'
import StartRating from '../StarRating'

jest.mock('react-rating-stars-component', () => {
    return jest.fn(() => <div data-testid="mocked-react-stars"></div>)
})
const ReactStartMock = assumeMock(ReactStar)

describe('<StarRating/>', () => {
    it('should have sane defaults', () => {
        const ratingValue = 3

        render(<StartRating value={ratingValue} />)

        expect(getLastMockCall(ReactStartMock)[0]).toEqual(
            expect.objectContaining({
                size: DEFAULT_SIZE,
                edit: false,
                value: ratingValue,
                color: STAR_COLORS.DEFAULT,
                activeColor: STAR_COLORS.ACTIVE,
            })
        )
    })

    it('should pass props to the underlying component', () => {
        const ratingValue = 3
        const size = 10
        const edit = true
        const color = 'red'
        const activeColor = 'blue'

        render(
            <StartRating
                value={ratingValue}
                size={size}
                edit={edit}
                color={color}
                activeColor={activeColor}
            />
        )

        expect(getLastMockCall(ReactStartMock)[0]).toEqual(
            expect.objectContaining({
                size,
                edit,
                value: ratingValue,
                color,
                activeColor,
            })
        )
    })
})
