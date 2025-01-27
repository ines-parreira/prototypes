import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {
    getFirstPreviewForPreviewType,
    mixedPreviews,
    salesPreviews,
    supportPreviews,
} from '../constants'
import {PersonalityPreviewGroup} from '../PersonalityPreviewGroup'

describe.each([
    ['sales', salesPreviews],
    ['support', supportPreviews],
    ['mixed', mixedPreviews],
])('<PersonalityPreviewGroup />', (previewType, previews) => {
    it(`should render the component with ${previewType} previewType`, () => {
        render(
            <div className="wrapper">
                <PersonalityPreviewGroup
                    previewType={previewType as any}
                    onPreviewSelect={jest.fn()}
                />
            </div>
        )

        expect(screen.queryByRole('radiogroup')?.children).toHaveLength(4)
        expect(screen.getByText(previews[0].title)).toBeInTheDocument()
        expect(screen.getByText(previews[0].caption)).toBeInTheDocument()
        expect(screen.getByText(previews[1].title)).toBeInTheDocument()
        expect(screen.getByText(previews[1].caption)).toBeInTheDocument()
        expect(screen.getByText(previews[2].title)).toBeInTheDocument()
        expect(screen.getByText(previews[2].caption)).toBeInTheDocument()
        expect(screen.getByText(previews[3].title)).toBeInTheDocument()
        expect(screen.getByText(previews[3].caption)).toBeInTheDocument()
    })

    it(`should trigger onPreviewSelect with item index and preview data when an item is clicked for ${previewType} previewType`, () => {
        const onPreviewSelect = jest.fn()
        render(
            <div className="wrapper">
                <PersonalityPreviewGroup
                    previewType={previewType as any}
                    onPreviewSelect={onPreviewSelect}
                />
            </div>
        )

        previews.forEach((preview, index) => {
            fireEvent.click(screen.getAllByRole('radio')[index])
            expect(onPreviewSelect).toHaveBeenCalledWith(preview)
        })
    })

    it(`should set the item as selected based on its index for ${previewType} previewType`, () => {
        render(
            <div className="wrapper">
                <PersonalityPreviewGroup
                    previewType={previewType as any}
                    onPreviewSelect={jest.fn()}
                    selectedPreviewId={
                        getFirstPreviewForPreviewType(previewType as any).id
                    }
                />
            </div>
        )

        expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
            'aria-checked',
            'true'
        )
        expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
            'aria-checked',
            'false'
        )
        expect(screen.getAllByRole('radio')[2]).toHaveAttribute(
            'aria-checked',
            'false'
        )
        expect(screen.getAllByRole('radio')[3]).toHaveAttribute(
            'aria-checked',
            'false'
        )
    })

    it(`should apply a loading state when isLoading is set`, () => {
        render(
            <div className="wrapper">
                <PersonalityPreviewGroup
                    previewType={previewType as any}
                    onPreviewSelect={jest.fn()}
                    isLoading={true}
                />
            </div>
        )

        expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
            'aria-busy',
            'true'
        )
        expect(screen.getAllByRole('radio')[1]).toHaveAttribute(
            'aria-busy',
            'true'
        )
        expect(screen.getAllByRole('radio')[2]).toHaveAttribute(
            'aria-busy',
            'true'
        )
        expect(screen.getAllByRole('radio')[3]).toHaveAttribute(
            'aria-busy',
            'true'
        )
    })
})
