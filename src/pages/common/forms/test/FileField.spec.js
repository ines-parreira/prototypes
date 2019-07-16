import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {uploadFiles} from '../../../../utils'
import {FileField} from '../FileField'

jest.mock('../../../../utils', () => {
    return {
        ...require.requireActual('../../../../utils'),
        uploadFiles: jest.fn(() => Promise.resolve([{url: 'file1'}])),
    }
})

jest.mock('lodash/uniqueId', () => () => 'input-1')


describe('<FileField/>', () => {
    const minProps = {
        value: 'value',
        onChange: _noop,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('_onChange()', () => {
        it('should notify a warning when trying to upload a SVG', () => {
            let calledNotify = false

            const component = shallow(
                <FileField
                    {...minProps}
                    notify={() => calledNotify = true}
                />
            )

            component.instance()._onChange({
                target: {
                    files: [{
                        type: 'image/svg+xml'
                    }]
                }
            })

            expect(component.state('isUploading')).toBe(false)
            expect(uploadFiles).not.toBeCalled()
            expect(calledNotify).toBe(true)
        })

        it('should not allow uploading files larger than 10MB', () => {
            const notify = jest.fn()

            const component = shallow(
                <FileField
                    {...minProps}
                    maxSize={10 * 1000 * 1000}
                    notify={notify}
                />
            )

            component.instance()._onChange({
                target: {
                    files: [
                        {size: 1000 * 1000 * 10},
                        {size: 1000 * 1000 * 10},
                    ]
                }
            })

            expect(notify).toBeCalledWith({
                message: 'Failed to upload files. Attached files must be smaller than 10MB.',
                status: 'error'
            })
        })

        it('should not allow uploading files larger than 1kB', () => {
            const notify = jest.fn()

            const component = shallow(
                <FileField
                    {...minProps}
                    maxSize={1000}
                    notify={notify}
                />
            )

            component.instance()._onChange({
                target: {
                    files: [
                        {size: 1000},
                        {size: 1000},
                    ]
                }
            })

            expect(notify).toBeCalledWith({
                message: 'Failed to upload files. Attached files must be smaller than 1kB.',
                status: 'error'
            })
        })
    })

    describe('render()', () => {
        it('should render a basic file input', () => {
            const component = shallow(
                <FileField
                    value="value"
                    onChange={_noop}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render preview', () => {
            const component = shallow(
                <FileField
                    {...minProps}
                    previewUrl="url"
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should not render preview', () => {
            const component = shallow(
                <FileField
                    {...minProps}
                    previewUrl="url"
                    noPreview
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should display loading when loading', () => {
            const component = shallow(<FileField {...minProps}/>)
            component.setState({isUploading: true})
            expect(component).toMatchSnapshot()
        })
    })
})
