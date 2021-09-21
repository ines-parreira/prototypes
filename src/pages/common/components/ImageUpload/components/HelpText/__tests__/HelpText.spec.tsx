import React from 'react'
import {render} from '@testing-library/react'

import {HelpText} from '../HelpText'

describe('<HelpText>', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <HelpText
                highlight="Upload image"
                text="recommended size 1640 x 624"
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('adds the highlight text if present', () => {
        const {rerender, getByText} = render(
            <HelpText text="recommended size 1640 x 624" />
        )

        expect(() => getByText('Upload image')).toThrow()

        rerender(
            <HelpText
                highlight="Upload image"
                text="recommended size 1640 x 624"
            />
        )

        getByText('Upload image')
    })
})
