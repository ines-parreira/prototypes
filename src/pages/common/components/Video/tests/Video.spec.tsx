import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import Video from '../Video'

describe('Video component', () => {
    it('should render with default videoPreviewIndex', () => {
        const {container} = render(<Video videoId="8fDF546" legend="foo" />)

        expect(container).toMatchSnapshot()
    })

    it('should render with passed videoPreviewIndex', () => {
        const {container} = render(
            <Video videoId="8fDF546" legend="foo" videoPreviewIndex="2" />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render iframe only when modal opened', () => {
        render(<Video videoId="8fDF546" legend="foo" videoPreviewIndex="2" />)

        fireEvent.click(screen.getByAltText('video preview'))

        expect(screen.getByTitle('rule-video')).toBeTruthy()
    })
})
