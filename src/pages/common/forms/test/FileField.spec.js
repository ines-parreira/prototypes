import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import {uploadFiles} from '../../../../utils'
import {FileField} from '../FileField'

jest.mock('../../../../utils', () => {
    return {
        ...require.requireActual('../../../../utils'),
        uploadFiles: jest.fn(() => Promise.resolve([{url: 'file1'}])),
    }
})

describe('FileField', () => {
    const minProps = {
        value: 'value',
        onChange: _noop,
    }

    it('should use default props', () => {
        const component = mount(<FileField {...minProps} />)
        expect(component.find('FileField').props()).toMatchSnapshot()
    })

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

    it('should display uploading when loading', () => {
        const component = mount(<FileField {...minProps}/>)
        component.find('input').simulate('change')
        expect(component.state('isUploading')).toBe(true)
        expect(uploadFiles).toBeCalled()
    })

    it('should notify a warning when trying to upload a SVG', () => {
        let calledNotify = false
        uploadFiles.mockReset()

        const component = mount(
            <FileField
                {...minProps}
                notify={() => calledNotify = true}
            />
        )

        component.find('input').simulate('change', {
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

    it('should not allow uploading files larger than maxSize', () => {
        const notify = jest.fn()

        const component = mount(
            <FileField
                {...minProps}
                maxSize={1000}
                notify={notify}
            />
        )

        component.find('input').simulate('change', {
            target: {
                files: [
                    {size: 1000},
                    {size: 1000},
                ]
            }
        })

        expect(notify).toBeCalledWith({
            message: 'Failed to upload files. Attached files must be smaller than 10MB.',
            status: 'error'
        })
    })
})
