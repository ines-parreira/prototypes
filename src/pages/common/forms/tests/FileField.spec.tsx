import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {Input} from 'reactstrap'
import {fireEvent, render} from '@testing-library/react'

import {uploadFiles} from 'utils'

import {FileFieldContainer} from '../FileField'

jest.mock('utils', () => {
    const mockedUtils = jest.requireActual('utils')
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
        Input: ({innerRef}: ComponentProps<typeof Input>) => {
            if (innerRef && typeof innerRef === 'object') {
                // @ts-ignore
                innerRef.current =
                    MockInput.inputRef as unknown as HTMLInputElement
            }
            return <div>file input mock</div>
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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('handleOnChange()', () => {
        it('should notify a warning when trying to upload a SVG', async () => {
            const component = shallow<FileFieldContainer>(
                <FileFieldContainer {...minProps} />
            )
            await component.instance().handleOnChange({
                target: {
                    files: [
                        {
                            type: 'image/svg+xml',
                        },
                    ] as any,
                },
            })

            expect(component.state('isUploading')).toBe(false)
            expect(uploadFiles).not.toBeCalled()
            expect(mockNotify).toHaveBeenCalled()
        })

        it('should not allow uploading files larger than 10MB', async () => {
            const component = shallow<FileFieldContainer>(
                <FileFieldContainer {...minProps} maxSize={10 * 1000 * 1000} />
            )

            await component.instance().handleOnChange({
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

        it('should not allow uploading files larger than 1kB', async () => {
            const component = shallow<FileFieldContainer>(
                <FileFieldContainer {...minProps} maxSize={1000} />
            )

            await component.instance().handleOnChange({
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
            const component = shallow(
                <FileFieldContainer
                    {...minProps}
                    value="value"
                    onChange={_noop}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render preview', () => {
            const component = shallow(
                <FileFieldContainer {...minProps} previewUrl="url" />
            )
            expect(component).toMatchSnapshot()
        })

        it('should not render preview', () => {
            const component = shallow(
                <FileFieldContainer {...minProps} previewUrl="url" noPreview />
            )
            expect(component).toMatchSnapshot()
        })

        it('should display loading when loading', () => {
            const component = shallow(<FileFieldContainer {...minProps} />)
            component.setState({isUploading: true})
            expect(component).toMatchSnapshot()
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
