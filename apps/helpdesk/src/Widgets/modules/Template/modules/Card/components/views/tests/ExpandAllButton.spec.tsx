import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import {
    EXPAND_CONTAINER_MARKER,
    EXPAND_TARGET_MARKER,
    TARGET_CLOSED_MARKER,
} from 'Widgets/modules/Template/config/template'

import ExpandAllButton, { EXPAND_TITLE, FOLD_TITLE } from '../ExpandAllButton'

const onClickMock = jest.fn()

const ContainerMock = ({ children }: { children: React.ReactNode }) => (
    <div {...{ [EXPAND_CONTAINER_MARKER]: true }}>{children}</div>
)

const TargetMock = ({ isClosed }: { isClosed: boolean }) => (
    <div
        {...{
            [EXPAND_TARGET_MARKER]: true,
            [TARGET_CLOSED_MARKER]: isClosed,
        }}
        onClick={onClickMock}
    />
)

describe('<ExpandAllButton/>', () => {
    it("should not click on targets if there's no container", () => {
        render(
            <>
                <ExpandAllButton />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={true} />
            </>,
        )

        fireEvent.click(screen.getByTitle(FOLD_TITLE))

        expect(onClickMock).not.toHaveBeenCalled()
    })
    it("should click on targets if there's a container", () => {
        render(
            <ContainerMock>
                <ExpandAllButton />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={true} />
                <TargetMock isClosed={true} />
            </ContainerMock>,
        )

        fireEvent.click(screen.getByTitle(FOLD_TITLE))

        expect(onClickMock).toHaveBeenCalledTimes(2)
    })

    it('should not click on targets that are marked as closed on first click', () => {
        render(
            <ContainerMock>
                <ExpandAllButton />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={true} />
            </ContainerMock>,
        )

        fireEvent.click(screen.getByTitle(FOLD_TITLE))

        expect(onClickMock).toHaveBeenCalledTimes(2)
    })

    it('should click on targets that are marked as closed on second click', () => {
        render(
            <ContainerMock>
                <ExpandAllButton />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={false} />
                <TargetMock isClosed={true} />
            </ContainerMock>,
        )

        fireEvent.click(screen.getByTitle(FOLD_TITLE))
        expect(onClickMock).toHaveBeenCalledTimes(2)

        fireEvent.click(screen.getByTitle(EXPAND_TITLE))
        expect(onClickMock).toHaveBeenCalledTimes(3)

        fireEvent.click(screen.getByTitle(FOLD_TITLE))
        expect(onClickMock).toHaveBeenCalledTimes(5)
    })
})
