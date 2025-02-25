import React from 'react'

import { render } from '@testing-library/react'

import { PaginationItem } from '../PaginationItem'

describe('<PaginationItem />', () => {
    it('should render the page type and call the event listener', () => {
        const onClick = jest.fn()
        const { getByLabelText } = render(
            <PaginationItem type="page" page={1} onClick={onClick} />,
        )

        getByLabelText('page-1').click()

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render the arrows and call the event listeners', () => {
        const onClick = jest.fn()
        const { getByLabelText, rerender } = render(
            <PaginationItem type="next" page={null} onClick={onClick} />,
        )

        getByLabelText('next').click()
        expect(onClick).toHaveBeenCalledTimes(1)

        rerender(
            <PaginationItem type="previous" page={null} onClick={onClick} />,
        )

        getByLabelText('previous').click()
        expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('should render the ellipsis and not call any event listener', () => {
        const onClick = jest.fn()
        const { getByLabelText, rerender } = render(
            <PaginationItem
                type="start-ellipsis"
                page={null}
                onClick={onClick}
            />,
        )

        getByLabelText('start-ellipsis').click()
        expect(onClick).not.toHaveBeenCalled()

        rerender(
            <PaginationItem
                type="end-ellipsis"
                page={null}
                onClick={onClick}
            />,
        )

        getByLabelText('end-ellipsis').click()
        expect(onClick).not.toHaveBeenCalled()
    })
})
