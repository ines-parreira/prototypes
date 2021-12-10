import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {ContentType} from '../../../../../../../../../../../../../models/api/types'

import Body from '../Body'

describe('<Body/>', () => {
    const onChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with a json textarea', () => {
        const {container} = render(
            <Body
                onChange={onChange}
                body={{
                    content_type: ContentType.Json,
                    [ContentType.Json]: '',
                }}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with parameter fields', () => {
        const {container} = render(
            <Body
                onChange={onChange}
                body={{
                    content_type: ContentType.Form,
                    [ContentType.Form]: [],
                }}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onChange when clicking on the other radio button', () => {
        render(
            <Body
                onChange={onChange}
                body={{
                    content_type: ContentType.Json,
                    [ContentType.Json]: '',
                }}
            />
        )

        fireEvent.click(
            screen.getByRole('radio', {
                name: ContentType.Form,
            })
        )
        expect(onChange).toHaveBeenCalledWith(
            'body.content_type',
            ContentType.Form
        )
    })

    it('should call onChange when editing the JSON', () => {
        render(
            <Body
                onChange={onChange}
                body={{
                    content_type: ContentType.Json,
                    [ContentType.Json]: '{}',
                }}
            />
        )

        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: '{"ok": "ok"}'},
        })
        expect(onChange).toHaveBeenCalled()
    })

    it('should call onChange when editing the parameter', () => {
        render(
            <Body
                onChange={onChange}
                body={{
                    content_type: ContentType.Form,
                    [ContentType.Form]: [],
                }}
            />
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'add',
            })
        )
        expect(onChange).toHaveBeenCalled()
    })
})
