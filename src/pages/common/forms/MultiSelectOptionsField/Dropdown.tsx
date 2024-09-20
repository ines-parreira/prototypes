import _isEqual from 'lodash/isEqual'
import _max from 'lodash/max'
import _min from 'lodash/min'
import React, {Component, ComponentType} from 'react'
import {DropdownMenu, DropdownToggle, UncontrolledDropdown} from 'reactstrap'
import classnames from 'classnames'

import css from './Dropdown.less'
import Input from './Input'
import Menu from './Menu'
import {Option} from './types'

type Props = {
    placeholder: string
    value: string
    options: Option[]
    isFocused: boolean
    isLoading?: boolean
    onChange: (option: string) => void
    onFocus: () => void
    onBlur: () => void
    onSelect: (option: Option) => void
    onDelete: () => void
    menu: ComponentType<{className?: string}>
    isCompact?: boolean
}

type State = {
    activeIndex: number
}

export default class Dropdown extends Component<Props, State> {
    static defaultProps = {
        menu: DropdownMenu,
    }

    state: State = {
        activeIndex: 0,
    }

    componentDidUpdate(prevProps: Props) {
        if (!_isEqual(this.props.options, prevProps.options)) {
            this.setState({
                activeIndex: 0,
            })
        }
    }

    _onInputSubmit = () => {
        const {options} = this.props
        const {activeIndex} = this.state
        const option = options[activeIndex]

        if (option) {
            this.props.onSelect(option)
        }
    }

    _onInputUp = () => {
        const {activeIndex} = this.state
        this.setState({
            activeIndex: _max([activeIndex - 1, 0])!,
        })
    }

    _onInputDown = () => {
        const {options} = this.props
        const {activeIndex} = this.state
        this.setState({
            activeIndex: _min([activeIndex + 1, options.length - 1])!,
        })
    }

    _onOptionActivate = (index: number) => {
        this.setState({
            activeIndex: index,
        })
    }

    render() {
        const {
            isFocused,
            options,
            value,
            onChange,
            onDelete,
            onFocus,
            onBlur,
            placeholder,
            menu: CustomDropdownMenu,
            isCompact,
        } = this.props
        return (
            <div
                className={classnames(
                    css.inputContainer,
                    'multiSelectOptionField-dropdown',
                    {
                        [css.compact]: isCompact,
                    }
                )}
            >
                <UncontrolledDropdown
                    isOpen={isFocused && (!!options.length || !!value)}
                >
                    <DropdownToggle tag="div" data-toggle="dropdown">
                        <Input
                            placeholder={placeholder}
                            value={value}
                            isFocused={isFocused}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onSubmit={this._onInputSubmit}
                            onUp={this._onInputUp}
                            onDown={this._onInputDown}
                            onDelete={onDelete}
                            onChange={onChange}
                            isCompact={isCompact}
                        />
                    </DropdownToggle>
                    <CustomDropdownMenu className={css.options}>
                        <Menu
                            isLoading={this.props.isLoading}
                            options={options}
                            activeIndex={this.state.activeIndex}
                            onActivate={this._onOptionActivate}
                            onSelect={this.props.onSelect}
                        />
                    </CustomDropdownMenu>
                </UncontrolledDropdown>
            </div>
        )
    }
}
