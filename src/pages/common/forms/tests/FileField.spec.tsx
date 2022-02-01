import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {uploadFiles} from '../../../../utils'
import {FileFieldContainer} from '../FileField'
import * as utils from '../../../../utils'

jest.mock('../../../../utils', () => {
    const mockedUtils = jest.requireActual('../../../../utils')

    const result: typeof utils = {
        ...mockedUtils,
        uploadFiles: jest.fn(() => Promise.resolve([{url: 'file1'}])),
    }
    return result
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
})
