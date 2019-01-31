//@flow
import React, {type Node as ReactNode, type ElementRef} from 'react'
import Button from './Button'
import Popover from './Popover'
import * as ReactDOM from 'react-dom'

type Props = {
    name: string,
    icon: string,
    children: ReactNode,
    className?: string,
    isActive: boolean,
    isDisabled: boolean,
    isOpen: boolean,
    onClose: () => void,
    onOpen: () => void,
}

export default class ButtonPopover extends React.Component<Props> {
    static defaultProps = {
        isActive: false,
        isDisabled: false,
        isOpen: false
    }

    popover: ?ElementRef<*>

    componentDidMount() {
        if (this.props.isOpen) {
            document.addEventListener('click', this._onDocumentClick)
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this._onDocumentClick)
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isOpen && this.props.isOpen) {
            document.addEventListener('click', this._onDocumentClick)
        }

        if (prevProps.isOpen && !this.props.isOpen) {
            document.removeEventListener('click', this._onDocumentClick)
        }
    }

    _onDocumentClick = (e: MouseEvent) => {
        if (!this.popover || !this.props.isOpen || !e.target) {
            return
        }

        const target = ((e.target: any): Node)
        const popoverEl = ReactDOM.findDOMNode(this.popover)

        if (popoverEl instanceof Element && !popoverEl.contains(target)) {
            this.props.onClose()
        }
    }

    _onButtonToggle = () => {
        if (this.props.isOpen) {
            this.props.onClose()
        } else {
            this.props.onOpen()
        }
    }

    render() {
        const {isActive, isDisabled, className, isOpen, children, icon, name} = this.props

        return (
            <Popover
                trigger={(
                    <Button
                        name={name}
                        isActive={isActive}
                        isDisabled={isDisabled}
                        icon={icon}
                        onToggle={this._onButtonToggle}
                    />
                )}
                className={className}
                isOpen={isOpen}
                ref={(el: ?ElementRef<*>) => this.popover = el}
            >
                {children}
            </Popover>
        )
    }
}
