import React from 'react'
import {shallow} from 'enzyme'
import Video from '../Video'


describe('Video component', () => {
    it('should render with default videoPreviewIndex', () => {
        const component = shallow(
            <Video
                videoId="8fDF546"
                legend="foo"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with passed videoPreviewIndex', () => {
        const component = shallow(
            <Video
                videoId="8fDF546"
                legend="foo"
                videoPreviewIndex="2"
            />
        )

        expect(component).toMatchSnapshot()
    })
})
