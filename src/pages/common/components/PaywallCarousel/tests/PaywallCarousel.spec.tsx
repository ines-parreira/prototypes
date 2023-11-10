import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {assetsUrl} from 'utils'
import PaywallCarousel from '../PaywallCarousel'

describe('<PaywallCarousel />', () => {
    const buttonLabel = 'Hey I am the button label'

    it('should render with minimal props', () => {
        const slidesData = [
            {
                imageUrl: assetsUrl('/img/slide1.png'),
            },
            {
                imageUrl: assetsUrl('/img/slide2.png'),
            },
        ]
        const {container, queryByText} = render(
            <PaywallCarousel
                slides={slidesData}
                singleSlideButtonTitle={buttonLabel}
            />
        )
        const imgs = container.querySelectorAll('img')
        expect(imgs.length).toBe(slidesData.length)
        expect(container.querySelectorAll('.slideDot div').length).toBe(
            slidesData.length
        )
        imgs.forEach((img, i) => {
            expect(img.src).toBe('http://localhost' + slidesData[i].imageUrl)
        })
        expect(queryByText('chevron_left')).toBeInTheDocument()
        expect(queryByText('chevron_right')).toBeInTheDocument()
        expect(queryByText(buttonLabel)).not.toBeInTheDocument()
    })
    it('should render with images and description', () => {
        const slidesData = [
            {
                imageUrl: assetsUrl('/img/slide1.png'),
                description: 'description 1',
            },
            {
                imageUrl: assetsUrl('/img/slide2.png'),
                description: 'description 2',
            },
        ]
        const {container, getByText, queryByText} = render(
            <PaywallCarousel
                slides={slidesData}
                singleSlideButtonTitle={buttonLabel}
            />
        )
        const imgs = container.querySelectorAll('img')
        expect(imgs.length).toBe(slidesData.length)
        expect(container.querySelectorAll('.slideDot div').length).toBe(
            slidesData.length
        )
        imgs.forEach((img, i) => {
            expect(img.src).toBe('http://localhost' + slidesData[i].imageUrl)
            expect(getByText(slidesData[i].description)).toBeInTheDocument()
        })
        expect(queryByText(buttonLabel)).not.toBeInTheDocument()
    })
    it('should render with images, description and header', () => {
        const slidesData = [
            {
                imageUrl: assetsUrl('/img/slide1.png'),
                description: 'description 1',
                header: 'header 1',
            },
            {
                imageUrl: assetsUrl('/img/slide2.png'),
                description: 'description 2',
                header: 'header 2',
            },
        ]
        const {container, getByText, queryByText} = render(
            <PaywallCarousel
                slides={slidesData}
                singleSlideButtonTitle={buttonLabel}
            />
        )
        const imgs = container.querySelectorAll('img')
        expect(container.querySelectorAll('.slideDot div').length).toBe(
            slidesData.length
        )
        expect(imgs.length).toBe(slidesData.length)
        imgs.forEach((img, i) => {
            expect(img.src).toBe('http://localhost' + slidesData[i].imageUrl)
            expect(getByText(slidesData[i].description)).toBeInTheDocument()
            expect(getByText(slidesData[i].header)).toBeInTheDocument()
        })
        expect(queryByText(buttonLabel)).not.toBeInTheDocument()
    })

    it('should render buttonLabel when slides length == 1', () => {
        const slidesData = [
            {
                imageUrl: assetsUrl('/img/slide1.png'),
                description: 'description 1',
                header: 'header 1',
            },
        ]
        const buttonClick = jest.fn()
        const {container, getByText} = render(
            <PaywallCarousel
                slides={slidesData}
                singleSlideButtonTitle={buttonLabel}
                onSingleSlideButtonTitleClick={buttonClick}
            />
        )
        const imgs = container.querySelectorAll('img')
        expect(container.querySelectorAll('.slideDot div').length).toBe(0)
        expect(imgs.length).toBe(slidesData.length)
        imgs.forEach((img, i) => {
            expect(img.src).toBe('http://localhost' + slidesData[i].imageUrl)
            expect(getByText(slidesData[i].description)).toBeInTheDocument()
            expect(getByText(slidesData[i].header)).toBeInTheDocument()
        })
        expect(getByText(buttonLabel)).toBeInTheDocument()
        fireEvent.click(getByText(buttonLabel))
        expect(buttonClick).toBeCalled()
    })
})
