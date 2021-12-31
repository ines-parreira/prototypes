import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import {UncontrolledTooltip, UncontrolledTooltipProps} from 'reactstrap'
import * as reactstrap from 'reactstrap'

import * as mobileUtils from '../../utils/mobile'
import Tooltip from '../Tooltip'

jest.mock('popper.js', () => {
    const PopperJS = jest.requireActual('popper.js')

    return class {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        static placements = PopperJS.placements

        constructor() {
            return {
                destroy: () => null,
                scheduleUpdate: () => null,
            }
        }
    }
})

describe('<Tooltip />', () => {
    beforeEach(() => {
        const element = document.createElement('div')
        element.id = 'target'
        element.title = 'target'
        window.document.body.appendChild(element)
        element.innerHTML = 'Hover me !'
    })

    afterEach(() => {
        document.getElementById('target')?.remove()
        jest.clearAllMocks()
    })

    describe('render', () => {
        it('should render the tooltip on hover', () => {
            jest.useFakeTimers()
            render(
                <Tooltip target="target">
                    <span>This is a tooltip.</span>
                </Tooltip>
            )

            fireEvent.mouseOver(screen.getByTitle('target'))
            jest.runAllTimers()
            expect(document.body.children).toMatchSnapshot()
        })

        it('should not render the tooltip if disabled', () => {
            jest.useFakeTimers()
            render(
                <Tooltip target="target" disabled>
                    <span>This is a tooltip.</span>
                </Tooltip>
            )

            fireEvent.mouseOver(screen.getByTitle('target'))
            jest.runAllTimers()
            expect(document.body.children).toMatchSnapshot()
        })
    })

    describe('tooltipDelay', () => {
        beforeEach(() => {
            jest.spyOn(reactstrap, 'UncontrolledTooltip').mockImplementation(
                (props: UncontrolledTooltipProps) => {
                    return (
                        <div>{JSON.stringify(props.delay)}</div>
                    ) as unknown as UncontrolledTooltip
                }
            )
        })

        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should render with no delay by default', () => {
            const {container} = render(
                <Tooltip target="target">
                    <span>This is a tooltip.</span>
                </Tooltip>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should pass given delay to UncontrolledTooltip', () => {
            const {container} = render(
                <Tooltip target="target" delay={1000}>
                    <span>This is a tooltip.</span>
                </Tooltip>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a specific delay if on a touch device', () => {
            jest.spyOn(mobileUtils, 'isTouchDevice').mockImplementationOnce(
                () => true
            )
            const {container} = render(
                <Tooltip target="target">
                    <span>This is a tooltip.</span>
                </Tooltip>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a specific delay when autohide is off', () => {
            const {container} = render(
                <Tooltip target="target" autohide={false}>
                    <span>This is a tooltip.</span>
                </Tooltip>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
