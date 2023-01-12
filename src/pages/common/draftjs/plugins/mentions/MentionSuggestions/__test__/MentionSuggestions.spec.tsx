import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import MentionSuggestions from '../index'

const mentions = fromJS([
    {
        name: 'Matthew Russell',
        link: 'https://twitter.com/mrussell247',
        avatar: 'https://pbs.twimg.com/profile_images/517863945/mattsailing_400x400.jpg',
    },
    {
        name: 'Julian Krispel-Samsel',
        link: 'https://twitter.com/juliandoesstuff',
        avatar: 'https://pbs.twimg.com/profile_images/477132877763579904/m5bFc8LF_400x400.png',
    },
    {
        name: 'Jyoti Puri',
        link: 'https://twitter.com/jyopur',
        avatar: 'https://pbs.twimg.com/profile_images/705714058939359233/IaJoIa78_400x400.jpg',
    },
    {
        name: 'Max Stoiber',
        link: 'https://twitter.com/mxstbr',
        avatar: 'https://pbs.twimg.com/profile_images/763033229993574400/6frGyDyA_400x400.jpg',
    },
    {
        name: 'Nik Graf',
        link: 'https://twitter.com/nikgraf',
        avatar: 'https://pbs.twimg.com/profile_images/535634005769457664/Ppl32NaN_400x400.jpeg',
    },
    {
        name: 'Pascal Brandt',
        link: 'https://twitter.com/psbrandt',
        avatar: 'https://pbs.twimg.com/profile_images/688487813025640448/E6O6I011_400x400.png',
    },
])

describe('MentionSuggestions Component', () => {
    const minProps: ComponentProps<typeof MentionSuggestions> = {
        ariaProps: {
            ariaExpanded: 'false',
            ariaHasPopup: 'false',
        },
        onSearchChange: jest.fn(),
        callbacks: {
            handleKeyCommand: undefined,
        },
        store: {
            getAllSearches: jest.fn(),
            getPortalClientRect: jest.fn(),
            isEscaped: jest.fn(),
            resetEscapedSearch: jest.fn(),
            escapeSearch: jest.fn(),
            register: jest.fn(),
            unregister: jest.fn(),
            updatePortalClientRect: jest.fn(),
        },
        theme: {},
        suggestions: mentions,
        positionSuggestions: jest.fn(),
        mentionTrigger: '',
        entityMutability: 'SEGMENTED',
        mentionPrefix: '',
    }

    it('Closes when suggestions is empty', () => {
        const suggestions = mount<MentionSuggestions>(
            <MentionSuggestions {...minProps} />
        )

        suggestions.instance().openDropdown()
        expect(suggestions.state().isActive).toEqual(true)

        suggestions.setProps({
            suggestions: fromJS([]),
        })
        expect(suggestions.state().isActive).toEqual(false)
    })
})
