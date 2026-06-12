import type { ComponentType, ReactNode } from 'react'
import { memo } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import cn from 'classnames'
import { Container } from 'reactstrap'
import { isEqual } from '@gorgias/toolkit'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { IconButton } from 'pages/common/components/button/IconButton'
import { DefaultExportFullPage as FullPage } from 'pages/common/components/FullPage'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { openPanel } from 'state/layout/actions'

import { AppFrame } from './AppFrame'
import css from './pageLayout.less'

type Props = {
    infobarOnMobile?: boolean
    isEditingWidgets?: boolean
    containerPadding?: boolean
    noContainerWidthLimit?: boolean
    children?: ReactNode
    // Navbar and Infobar containers can be changed depending on the route. See `routes.js`
    navbar?: ComponentType<any>
    infobar?: ComponentType<any>
    content?: ComponentType<any>
}

const LegacyPage = ({
    infobarOnMobile,
    isEditingWidgets,
    noContainerWidthLimit,
    containerPadding,
    content: Content,
    navbar: Navbar,
    infobar: Infobar,
    children,
}: Props) => {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const dispatch = useAppDispatch()

    const Wrapper = containerPadding ? FullPage : Container
    const wrapperProps = containerPadding
        ? { noContainerWidthLimit }
        : { fluid: true, className: cn(css['main-content']) }
    const content = !!Content ? <Content /> : children

    return (
        <AppFrame navbar={Navbar}>
            <div
                className={cn('d-flex flex-grow-1', css.contentInfobar)}
                style={{
                    overflow: 'hidden',
                }}
            >
                <div className={cn('app-content', css.content)}>
                    {!hasWayfindingMS1Flag && (
                        <div className="mobile-nav">
                            <IconButton
                                className="mr-3"
                                fillStyle="ghost"
                                intent="secondary"
                                onClick={() => dispatch(openPanel('navbar'))}
                            >
                                menu
                            </IconButton>
                            {infobarOnMobile && (
                                <Button
                                    className="ml-3"
                                    fillStyle="ghost"
                                    intent="secondary"
                                    onClick={() =>
                                        dispatch(openPanel('infobar'))
                                    }
                                >
                                    More info
                                </Button>
                            )}
                        </div>
                    )}

                    <Wrapper {...wrapperProps}>
                        <ErrorBoundary>{content || null}</ErrorBoundary>
                    </Wrapper>
                </div>

                {!!Infobar && <Infobar isEditingWidgets={!!isEditingWidgets} />}
            </div>
        </AppFrame>
    )
}

const DefaultExportLegacyPage = memo(LegacyPage, isEqual)

export { DefaultExportLegacyPage }
