import type { ComponentProps, ReactNode } from 'react'

import { resetLDMocks } from '@repo/feature-flags/testing'
import type { RenderResult } from '@testing-library/react'
import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { testimonial as testimonialFixture } from 'fixtures/paywall'

import Paywall, { PaywallTheme, UpgradeType } from '../Paywall'

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
        resetLDMocks()
    })

    it('should render with minimal props', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each<[string, ReactNode]>([
        ['string header', 'Page header'],
        // eslint-disable-next-line react/jsx-key
        ['custom header element', <div>Custom page header</div>],
    ])('should render a page header with %s', (testName, pageHeader) => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} pageHeader={pageHeader} />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each<PaywallTheme>(Object.values(PaywallTheme))(
        'should render a paywall theme with badge for %s paywall type',
        (paywallTheme) => {
            const { container } = render(
                <MemoryRouter>
                    <Paywall {...minProps} paywallTheme={paywallTheme} />
                </MemoryRouter>,
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it('should open the lightbox on preview click', () => {
        const { getByAltText, queryAllByTestId } = render(
            <MemoryRouter>
                <Paywall {...minProps} />
            </MemoryRouter>,
        )

        fireEvent.click(getByAltText('Feature preview'))

        expect(queryAllByTestId('lightbox-opened')).not.toBe(null)
    })

    it.each<[string, (result: RenderResult) => void]>([
        [
            'close click',
            ({ getByTestId }) => {
                fireEvent.click(getByTestId('close-button'))
            },
        ],
        [
            'image click',
            ({ getByTestId }) => {
                fireEvent.click(getByTestId('click-image-button'))
            },
        ],
    ])('should close the lightbox on %s', (testName, fireCloseEvent) => {
        const renderResult = render(
            <MemoryRouter>
                <Paywall {...minProps} />
            </MemoryRouter>,
        )

        fireEvent.click(renderResult.getByAltText('Feature preview'))
        fireCloseEvent(renderResult)

        expect(renderResult.queryAllByTestId('lightbox-closed')).not.toBe(null)
    })

    it('should render with filter shadow', () => {
        const { getByAltText } = render(
            <MemoryRouter>
                <Paywall {...minProps} renderFilterShadow />
            </MemoryRouter>,
        )
        expect(getByAltText('Feature preview').parentElement).toMatchSnapshot()
    })

    it('should render with a legacy badge', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} shouldKeepPrice />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with an add-on update type', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} upgradeType={UpgradeType.AddOn} />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a testimonial', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} testimonial={testimonialFixture} />
            </MemoryRouter>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the default upgrade CTA', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} showUpgradeCta />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a custom upgrade CTA', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall
                    {...minProps}
                    customCta={<button>Upgrade me!</button>}
                />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render with modal', () => {
        const { container } = render(
            <MemoryRouter>
                <Paywall {...minProps} modal={<div>Modal content</div>} />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
