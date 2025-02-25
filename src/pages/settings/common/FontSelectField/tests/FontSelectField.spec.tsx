import React from 'react'

import { render } from '@testing-library/react'
import _noop from 'lodash/noop'

import { AGENT_ADDED_FONTS } from '../constants'
import { FontSelectField } from '../FontSelectField'

describe('<FontSelectField />', () => {
    const defaultFonts = [
        'Arial',
        'Georgia',
        'Impact',
        'Inter',
        'Merriweather',
        'Source Code Pro',
        'Tahoma',
        'Times New Roman',
        'Verdana',
    ]
    const placeholder = 'Select a primary font'

    it('should download custom fonts', () => {
        localStorage.setItem(
            AGENT_ADDED_FONTS,
            JSON.stringify(['Roboto', 'Aclonica']),
        )
        render(
            <FontSelectField
                defaultFonts={defaultFonts}
                placeholder={placeholder}
                value="Abracadabra"
                onChange={_noop}
            />,
        )

        const link = document.querySelector('link') as HTMLLinkElement
        expect(link.href).toStrictEqual(
            'https://fonts.googleapis.com/css2?family=Roboto&family=Aclonica&family=Abracadabra&display=swap',
        )
    })

    it('matches snapshot', () => {
        localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(['Roboto']))
        const { container } = render(
            <FontSelectField
                defaultFonts={defaultFonts}
                placeholder={placeholder}
                value="font"
                onChange={_noop}
            />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should display headers if fonts in local storage', () => {
        localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(['Roboto']))
        const { getByText } = render(
            <FontSelectField
                defaultFonts={defaultFonts}
                placeholder={placeholder}
                value="font"
                onChange={_noop}
            />,
        )

        getByText('RECENTLY ADDED')
        getByText('STANDARD FONTS')
    })

    it('should not display headers if one font in local storage and it is currently used', () => {
        localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(['Roboto']))
        const { queryByText } = render(
            <FontSelectField
                defaultFonts={defaultFonts}
                placeholder={placeholder}
                value="Roboto"
                onChange={_noop}
            />,
        )

        expect(queryByText('RECENTLY ADDED')).toBeNull()
        expect(queryByText('STANDARD FONTS')).toBeNull()
    })

    it('should not display headers if no fonts in local storage', () => {
        const { queryByText } = render(
            <FontSelectField
                defaultFonts={defaultFonts}
                placeholder={placeholder}
                value="Roboto"
                onChange={_noop}
            />,
        )

        expect(queryByText('RECENTLY ADDED')).toBeNull()
        expect(queryByText('STANDARD FONTS')).toBeNull()
    })
})
