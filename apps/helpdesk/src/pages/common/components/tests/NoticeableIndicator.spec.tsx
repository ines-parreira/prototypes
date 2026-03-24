// import { userEvent } from '@repo/testing'
import React from 'react'

import { reportError } from '@repo/logging'
import { addBreadcrumb } from '@sentry/react'
import { act, render, waitFor } from '@testing-library/react'

// import {assumeMock} from 'utils/testing'

import NoticeableIndicator from '../NoticeableIndicator'

jest.mock('@sentry/react', () => ({ addBreadcrumb: jest.fn() }))

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

describe('NoticeableIndicator', () => {
    let noticeableOn: jest.Mock
    let noticeableDestroy: jest.Mock
    let noticeableRender: jest.Mock

    beforeEach(() => {
        window.noticeableWidgetId = 'noticeable-widget-id'

        noticeableOn = jest.fn()
        noticeableDestroy = jest.fn(() => Promise.resolve())
        noticeableRender = jest.fn(() => Promise.resolve())
        window.noticeable = {
            do: jest.fn(),
            on: noticeableOn,
            destroy: noticeableDestroy,
            render: noticeableRender,
        }
    })

    it('should render nothing if there are no publications', () => {
        const { container } = render(<NoticeableIndicator />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render the noticeable widget', async () => {
        render(<NoticeableIndicator />)
        expect(window.noticeable.render).toHaveBeenCalledWith(
            'widget',
            'noticeable-widget-id',
        )
        await waitFor(() => {
            expect(addBreadcrumb).toHaveBeenCalledWith({
                category: 'noticeable',
                message: 'widget rendered',
            })
        })
    })

    it('should report an error if', async () => {
        const err = new Error('Rejected')
        noticeableRender.mockRejectedValue(err)

        render(<NoticeableIndicator />)
        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(err)
        })
    })

    it('should report an error if the widget fails to render', async () => {
        const err = new Error('Oops')
        window.noticeable.render = () => {
            throw err
        }

        render(<NoticeableIndicator />)
        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(err)
        })
    })

    it('should update the count when updated', () => {
        const result = render(<NoticeableIndicator />)
        expect(window.noticeable.on).toHaveBeenCalledWith(
            'widget:publication:unread_count:changed',
            'noticeable-widget-id',
            expect.any(Function),
        )

        const [[, , listener]] = noticeableOn.mock.calls as [
            [unknown, unknown, (e: Record<string, any>) => void],
        ]
        act(() => {
            listener({ detail: { value: 1 } })
        })
        expect(addBreadcrumb).toHaveBeenCalledWith({
            category: 'noticeable',
            message: 'widget unread_count changed',
        })
        expect(
            result.container.querySelector('#noticeable-widget-notification'),
        ).toBeInTheDocument()
    })

    it('should destroy the noticeable widget on unmount', async () => {
        const { unmount } = render(<NoticeableIndicator />)
        unmount()

        expect(noticeableDestroy).toHaveBeenCalledWith(
            'widget',
            'noticeable-widget-id',
        )
        await waitFor(() => {
            expect(addBreadcrumb).toHaveBeenCalledWith({
                category: 'noticeable',
                message: 'widget destroyed',
            })
        })
    })
})
