import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { Input } from 'reactstrap'
import { noop } from '@gorgias/toolkit'

import { uploadFiles } from 'common/utils'

import { FileFieldContainer } from '../FileField'

jest.mock('common/utils', () => {
    const mockedUtils = jest.requireActual('common/utils')
    return {
        ...mockedUtils,
        uploadFiles: jest.fn(() => Promise.resolve([{ url: 'file1' }])),
    }
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
        Input: ({ innerRef, onChange }: ComponentProps<typeof Input>) => {
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

jest.mock('@gorgias/toolkit', () => ({
    ...jest.requireActual('@gorgias/toolkit'),
    uniqueId: () => 'input-1',
}))

describe('<FileField/>', () => {
    const minProps = {
        value: 'value',
        onChange: noop,
    }

    describe('handleRemove()', () => {
        it('should call onChange with an empty string when removing the file', () => {
            const removeFn = jest.fn()
            const { getByText } = render(
                <FileFieldContainer
                    {...minProps}
                    isRemovable
                    onChange={removeFn}
                />,
            )

            fireEvent.click(getByText('close'))

            expect(removeFn).toHaveBeenCalled()
        })
    })

    describe('handleOnChange()', () => {
        it('should notify a warning when trying to upload a SVG', async () => {
            const { getByLabelText, queryByText } = render(
                <FileFieldContainer {...minProps} />,
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
            await waitFor(() => {
                const toast = screen.getByRole('status', {
                    name: 'Uploading SVGs is not allowed.',
                })
                expect(toast).toHaveAttribute('data-intent', 'warning')
            })
        })

        it('should not allow uploading files larger than 10MB', async () => {
            const { getByLabelText } = render(
                <FileFieldContainer {...minProps} maxSize={10 * 1000 * 1000} />,
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [
                        { size: 1000 * 1000 * 10 },
                        { size: 1000 * 1000 * 10 },
                    ] as any,
                },
            })

            await waitFor(() => {
                const toast = screen.getByRole('status', {
                    name: 'Failed to upload files. Attached files must be smaller than 10MB.',
                })
                expect(toast).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('should not allow uploading files larger than 1kB', async () => {
            const { getByLabelText } = render(
                <FileFieldContainer {...minProps} maxSize={1000} />,
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [{ size: 1000 }, { size: 1000 }] as any,
                },
            })

            await waitFor(() => {
                const toast = screen.getByRole('status', {
                    name: 'Failed to upload files. Attached files must be smaller than 1kB.',
                })
                expect(toast).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('shows a destructive toast when uploadFiles rejects with HTTP 413', async () => {
            const uploadFilesMock = uploadFiles as jest.Mock
            uploadFilesMock.mockRejectedValueOnce({
                response: {
                    status: 413,
                    data: { error: { msg: 'oversize' } },
                },
            })

            const { getByLabelText } = render(
                <FileFieldContainer {...minProps} maxSize={10 * 1000 * 1000} />,
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [{ size: 10, type: 'image/png' }] as any,
                },
            })

            await waitFor(() => {
                const toast = screen.getByRole('status', {
                    name: 'Failed to upload files. Attached files must be smaller than 10MB.',
                })
                expect(toast).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('shows a destructive toast with the server error message when uploadFiles rejects with a non-413 status', async () => {
            const uploadFilesMock = uploadFiles as jest.Mock
            uploadFilesMock.mockRejectedValueOnce({
                response: {
                    status: 500,
                    data: { error: { msg: 'Server upload error' } },
                },
            })

            const { getByLabelText } = render(
                <FileFieldContainer {...minProps} />,
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [{ size: 10, type: 'image/png' }] as any,
                },
            })

            await waitFor(() => {
                const toast = screen.getByRole('status', {
                    name: 'Server upload error',
                })
                expect(toast).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })

    describe('render()', () => {
        it('should render a basic file input', () => {
            const { getByLabelText } = render(
                <FileFieldContainer
                    {...minProps}
                    value="value"
                    onChange={noop}
                />,
            )

            expect(getByLabelText('file input mock')).toBeInTheDocument()
        })

        it('should render preview', () => {
            const { getByRole } = render(
                <FileFieldContainer {...minProps} previewUrl="url" />,
            )

            expect(getByRole('img')).toBeInTheDocument()
        })

        it('should not render preview', () => {
            const { queryByRole } = render(
                <FileFieldContainer {...minProps} previewUrl="url" noPreview />,
            )

            expect(queryByRole('img')).toBeNull()
        })

        it('should display loading when loading', () => {
            const { getByLabelText, getByText } = render(
                <FileFieldContainer {...minProps} />,
            )

            fireEvent.change(getByLabelText('file input mock'), {
                target: {
                    files: [
                        { type: 'image/png' },
                        { type: 'image/png' },
                    ] as any,
                },
            })

            expect(getByText('Uploading...')).toBeInTheDocument()
        })
    })

    it('should open the file dialog on upload button click', () => {
        const placeholder = 'Select'
        const { getByText } = render(
            <FileFieldContainer {...minProps} placeholder={placeholder} />,
        )

        fireEvent.click(getByText(placeholder))

        expect(MockInput.inputRef.click).toHaveBeenLastCalledWith()
    })
})
