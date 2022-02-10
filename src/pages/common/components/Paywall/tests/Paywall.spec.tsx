import React, {ComponentProps, ReactNode} from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'

import {testimonial as testimonialFixture} from 'fixtures/paywall'

import Paywall, {PaywallTheme, UpgradeType} from '../Paywall'

jest.mock('react-images', () => {
    return ({
        images,
        isOpen,
        onClose,
        onClickImage,
    }: {
        images: any[]
        isOpen: boolean
        onClose: () => void
        onClickImage: () => void
    }) => (
        <div data-testid={`lightbox-${isOpen ? 'opened' : 'closed'}`}>
            isOpen: {JSON.stringify(isOpen)}
            images: {JSON.stringify(images)}
            <button
                data-testid="close-button"
                onClick={() => onClose()}
                value="close"
            />
            <button
                data-testid="click-image-button"
                onClick={() => onClickImage()}
                value="click image"
            />
        </div>
    )
})

describe('<Paywall />', () => {
    const minProps: ComponentProps<typeof Paywall> = {
        requiredUpgrade: 'Foo',
        header: 'Feature',
        description: 'Feature description',
        previewImage: '/static/private/img/paywalls/screens/paywall.png',
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render with minimal props', () => {
        const {container} = render(<Paywall {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each<[string, ReactNode]>([
        ['string header', 'Page header'],
        // eslint-disable-next-line react/jsx-key
        ['custom header element', <div>Custom page header</div>],
    ])('should render a page header with %s', (testName, pageHeader) => {
        const {container} = render(
            <Paywall {...minProps} pageHeader={pageHeader} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each<PaywallTheme>(Object.values(PaywallTheme))(
        'should render a paywall theme with badge for %s paywall type',
        (paywallTheme) => {
            const {container} = render(
                <Paywall {...minProps} paywallTheme={paywallTheme} />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should open the lightbox on preview click', () => {
        const {getByAltText, queryAllByTestId} = render(
            <Paywall {...minProps} />
        )

        fireEvent.click(getByAltText('Feature preview'))

        expect(queryAllByTestId('lightbox-opened')).not.toBe(null)
    })

    it.each<[string, (result: RenderResult) => void]>([
        [
            'close click',
            ({getByTestId}) => {
                fireEvent.click(getByTestId('close-button'))
            },
        ],
        [
            'image click',
            ({getByTestId}) => {
                fireEvent.click(getByTestId('click-image-button'))
            },
        ],
    ])('should close the lightbox on %s', (testName, fireCloseEvent) => {
        const renderResult = render(<Paywall {...minProps} />)

        fireEvent.click(renderResult.getByAltText('Feature preview'))
        fireCloseEvent(renderResult)

        expect(renderResult.queryAllByTestId('lightbox-closed')).not.toBe(null)
    })

    it('should render with filter shadow', () => {
        const {getByAltText} = render(
            <Paywall {...minProps} renderFilterShadow />
        )
        expect(getByAltText('Feature preview').parentElement).toMatchSnapshot()
    })

    it('should render with a legacy badge', () => {
        const {container} = render(<Paywall {...minProps} shouldKeepPlan />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with an add-on update type', () => {
        const {container} = render(
            <Paywall {...minProps} upgradeType={UpgradeType.AddOn} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a testimonial', () => {
        const {container} = render(
            <Paywall {...minProps} testimonial={testimonialFixture} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the default upgrade CTA', () => {
        const {container} = render(<Paywall {...minProps} showUpgradeCta />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a custom upgrade CTA', () => {
        const {container} = render(
            <Paywall {...minProps} customCta={<button>Upgrade me!</button>} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the default upgrade CTA if a custom upgrade CTA is passed', () => {
        const {container} = render(
            <Paywall
                {...minProps}
                showUpgradeCta
                customCta={<button>Upgrade me!</button>}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with modal', () => {
        const {container} = render(
            <Paywall {...minProps} modal={<div>Modal content</div>} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
