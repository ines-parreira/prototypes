import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import PlanCard, {PlanCardTheme} from '../PlanCard'

describe('<PlanCard />', () => {
    const minProps: ComponentProps<typeof PlanCard> = {
        className: 'customClassName',
        planName: 'Foo plan',
        features: [
            {
                label: 'Foo feature',
                icon: 'Foo icon',
            },
            {
                label: 'Bar feature',
                icon: 'Bar icon',
                isDisabled: true,
            },
        ],
    }

    it.each(Object.values(PlanCardTheme))(
        'should render the plan card for %s theme',
        (theme) => {
            const {container} = render(<PlanCard {...minProps} theme={theme} />)
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render the price', () => {
        const {container} = render(<PlanCard {...minProps} price="$1000" />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the header badge', () => {
        const {container} = render(
            <PlanCard {...minProps} headerBadge={<span>Foo badge</span>} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the footer', () => {
        const {container} = render(
            <PlanCard {...minProps} footer={<div>Foo footer</div>} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
