import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { ContentState, EditorState, SelectionState } from 'draft-js'
import { fromJS } from 'immutable'

import MentionSuggestions from 'pages/common/draftjs/plugins/mentions/MentionSuggestions'

const mentionablePerson = {
    name: 'Matthew Russell',
    link: 'https://twitter.com/mrussell247',
    avatar: 'https://pbs.twimg.com/profile_images/517863945/mattsailing_400x400.jpg',
}

const mentions = fromJS([
    mentionablePerson,
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
        positionSuggestions: jest.fn().mockReturnValue({}),
        mentionTrigger: '',
        entityMutability: 'SEGMENTED',
        mentionPrefix: '',
        canAddMention: true,
    }
    const contentState = ContentState.createFromText('Some text Max')
    const initialEditorState = EditorState.createWithContent(contentState)
    const sel = initialEditorState
        .getSelection()
        .set('anchorOffset', 10)
        .set('focusKey', 13)
    const anchorKey = initialEditorState.getSelection().getAnchorKey()
    const editorStateWithSelection = EditorState.acceptSelection(
        initialEditorState,
        sel as SelectionState,
    )
    const editorState = EditorState.moveFocusToEnd(editorStateWithSelection)

    it('Should not render the suggestions when "canAddMention" is false', () => {
        const callbacks = { onChange: jest.fn(), handleKeyCommand: undefined }

        const { container } = render(
            <MentionSuggestions
                {...{
                    ...minProps,
                    suggestions: fromJS([]),
                    canAddMention: false,
                    store: {
                        ...minProps.store,
                        getAllSearches: jest
                            .fn()
                            .mockReturnValue(fromJS([`${anchorKey}-0-0`])),
                    },
                }}
                callbacks={callbacks}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('Should render suggestions', () => {
        const callbacks = { onChange: jest.fn(), handleKeyCommand: undefined }

        render(
            <MentionSuggestions
                {...{
                    ...minProps,
                    store: {
                        ...minProps.store,
                        getAllSearches: jest
                            .fn()
                            .mockReturnValue(fromJS([`${anchorKey}-0-0`])),
                    },
                }}
                callbacks={callbacks}
            />,
        )

        callbacks.onChange(editorState)

        expect(
            screen.getByRole('option', {
                name: new RegExp(mentionablePerson.name),
            }),
        ).toBeInTheDocument()
    })
})
