import {fireEvent, render} from '@testing-library/react'

import _noop from 'lodash/noop'
import React, {ComponentProps} from 'react'
import {Input} from 'reactstrap'

import {uploadFiles} from 'common/utils'

import {FileFieldContainer} from '../FileField'

jest.mock('common/utils', () => {
    const mockedUtils = jest.requireActual('common/utils')
    return {
        ...mockedUtils,
        uploadFiles: jest.fn(() => Promise.resolve([{url: 'file1'}])),
    } as unknown
})

const MockInput = {
    inputRef: {
        click: jest.fn(),
    },
}
jest.mock('reactstrap', () => {
    const reactstrap = jest.requireActual('reactstrap')
    return {
        ...reactstrap,
        Input: ({innerRef, onChange}: ComponentProps<typeof Input>) => {
            if (innerRef && typeof innerRef === 'object') {
                // @ts-ignore
                innerRef.current =
                    MockInput.inputRef as unknown as HTMLInputElement
            }
            return (
                <input
                    type="file"
                    aria-label="file input mock"
                    onChange={onChange}
                />
            )
        },
    } as unknown
})

jest.mock('lodash/uniqueId', () => () => 'input-1')

describe('<FileField/>', () => {
    const mockNotify = jest.fn()
    const minProps = {
        value: 'value',
        onChange: _noop,
        notify: mockNotify,
    }

    describe('handleRemove()', () => {
        it('should call onChange with an empty string when removing the file', () => {
            const removeFn = jest.fn()
            const {getByText} = render(
                <FileFieldContainer
                    {...minProps}
                    isRemovable
                    onChange={removeFn}
                />
            )

            fireEvent.click(getByText('close'))

            expect(removeFn).toHaveBeenCalled()
        })
    })

    describe('handleOnChange()', () => {
        it('should notify a warning when trying to upload a SVG', () => {
            const {getByLabelText, queryByText} = render(
                <FileFieldContainer {...minProps} />
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [
                        {
                            type: 'image/svg+xml',
                        },
                    ] as any,
                },
            })

            expect(queryByText('Uploading...')).toBeNull()
            expect(uploadFiles).not.toBeCalled()
            expect(mockNotify).toHaveBeenCalled()
        })

        it('should not allow uploading files larger than 10MB', () => {
            const {getByLabelText} = render(
                <FileFieldContainer {...minProps} maxSize={10 * 1000 * 1000} />
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [
                        {size: 1000 * 1000 * 10},
                        {size: 1000 * 1000 * 10},
                    ] as any,
                },
            })

            expect(mockNotify).toBeCalledWith({
                message:
                    'Failed to upload files. Attached files must be smaller than 10MB.',
                status: 'error',
            })
        })

        it('should not allow uploading files larger than 1kB', () => {
            const {getByLabelText} = render(
                <FileFieldContainer {...minProps} maxSize={1000} />
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [{size: 1000}, {size: 1000}] as any,
                },
            })

            expect(mockNotify).toBeCalledWith({
                message:
                    'Failed to upload files. Attached files must be smaller than 1kB.',
                status: 'error',
            })
        })
    })

    describe('render()', () => {
        it('should render a basic file input', () => {
            const {getByLabelText} = render(
                <FileFieldContainer
                    {...minProps}
                    value="value"
                    onChange={_noop}
                />
            )

            expect(getByLabelText('file input mock')).toBeInTheDocument()
        })

        it('should render preview', () => {
            const {getByRole} = render(
                <FileFieldContainer {...minProps} previewUrl="url" />
            )

            expect(getByRole('img')).toBeInTheDocument()
        })

        it('should not render preview', () => {
            const {queryByRole} = render(
                <FileFieldContainer {...minProps} previewUrl="url" noPreview />
            )

            expect(queryByRole('img')).toBeNull()
        })

        it('should display loading when loading', () => {
            const {getByLabelText, getByText} = render(
                <FileFieldContainer {...minProps} />
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [{type: 'image/png'}, {type: 'image/png'}] as any,
                },
            })

            expect(getByText('Uploading...')).toBeInTheDocument()
        })
    })

    it('should open the file dialog on upload button click', () => {
        const placeholder = 'Select'
        const {getByText} = render(
            <FileFieldContainer {...minProps} placeholder={placeholder} />
        )

        fireEvent.click(getByText(placeholder))

        expect(MockInput.inputRef.click).toHaveBeenLastCalledWith()
    })
})
