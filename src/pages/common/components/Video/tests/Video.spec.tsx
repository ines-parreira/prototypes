import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import Video from '../Video'

describe('Video component', () => {
    it('should render the given preview image', () => {
        const previewURL = 'https://preview.url'
        render(
            <Video
                videoURL="https://video.link"
                previewURL={previewURL}
                legend="foo"
            />
        )

        const img = screen.getByAltText('video preview')

        expect(img).toBeVisible()
        expect(img.getAttribute('src')).toBe(previewURL)
    })

    it('should not render if no videoUrl or youtubeId given', () => {
        render(<Video legend="foo" />)

        const img = screen.queryByAltText('video preview')

        expect(img).toBeNull()
    })

    it('should render the given video', () => {
        const videoURL = 'https://video.link'
        render(
            <Video
                videoURL={videoURL}
                previewURL="https://preview.url"
                legend="foo"
            />
        )
        fireEvent.click(screen.getByAltText('video preview'))
        const video = screen.getByTitle('rule-video')

        expect(video).toBeVisible()
        expect(video.getAttribute('src')).toBe(videoURL)
    })

    it('should render with default youtubePreviewIndex', () => {
        const {container} = render(<Video youtubeId="8fDF546" legend="foo" />)

        expect(container).toMatchSnapshot()
    })

    it('should render with passed youtubePreviewIndex', () => {
        const {container} = render(
            <Video youtubeId="8fDF546" legend="foo" youtubePreviewIndex="2" />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render iframe only when modal opened', () => {
        render(
            <Video youtubeId="8fDF546" legend="foo" youtubePreviewIndex="2" />
        )

        fireEvent.click(screen.getByAltText('video preview'))

        expect(screen.getByTitle('rule-video')).toBeTruthy()
    })
})
