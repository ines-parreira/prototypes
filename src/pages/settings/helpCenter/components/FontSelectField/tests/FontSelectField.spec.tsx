import React from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'
import {FontSelectField} from '../FontSelectField'
import {AGENT_ADDED_FONTS} from '../constants'

describe('<FontSelectField />', () => {
    it('should download custom fonts', () => {
        localStorage.setItem(
            AGENT_ADDED_FONTS,
            JSON.stringify(['Roboto', 'Aclonica'])
        )
        render(<FontSelectField title="Title" value="Inter" onChange={_noop} />)

        const link = document.querySelector('link') as HTMLLinkElement
        expect(link.href).toStrictEqual(
            'https://fonts.googleapis.com/css2?family=Roboto&family=Aclonica&display=swap'
        )
    })

    it('matches snapshot', () => {
        localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(['Roboto']))
        const {container} = render(
            <FontSelectField title="Title" value="font" onChange={_noop} />
        )

        expect(container).toMatchSnapshot()
    })

    it('should display recently added if fonts in local storage', () => {
        localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(['Roboto']))
        const {getByText} = render(
            <FontSelectField title="Title" value="font" onChange={_noop} />
        )

        getByText('Recently added')
    })

    it('should not display recently added if one font in local storage and it is currently used', () => {
        localStorage.setItem(AGENT_ADDED_FONTS, JSON.stringify(['Roboto']))
        const {queryByText} = render(
            <FontSelectField title="Title" value="Roboto" onChange={_noop} />
        )

        expect(queryByText('Recently added')).toBeNull()
    })

    it('should not display recently added if no fonts in local storage', () => {
        const {queryByText} = render(
            <FontSelectField title="Title" value="Roboto" onChange={_noop} />
        )

        expect(queryByText('Recently added')).toBeNull()
    })
})
