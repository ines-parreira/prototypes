// @flow
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'
import moment from 'moment'
import React from 'react'
import {connect} from 'react-redux'
import {Button, Popover, PopoverBody} from 'reactstrap'

import _upperFirst from 'lodash/upperFirst'

import {withRouter} from 'react-router'

import {views as statViewsConfig} from '../../config/stats'
import {resetStatsFilters, mergeStatsFilters} from '../../state/stats/actions'
import {fieldEnumSearch} from '../../state/views/actions'
import PageHeader from '../common/components/PageHeader'
import TagDropdownMenu from '../common/components/TagDropdownMenu/TagDropdownMenu'

import {getViewFilters} from '../../state/stats/selectors'
import {getTags} from '../../state/tags/selectors'
import {CHANNELS} from '../../config/ticket'
import {getAgents} from '../../state/agents/selectors'
import {getDisplayName} from '../../state/customers/helpers'

import PeriodPicker from './common/PeriodPicker'
import SearchableSelectField from './common/SearchableSelectField'

type Props = {
    params: Object,
    config: Object,
    channels: any[],
    agents: any[],
    tags: any[],
    stats: Object,
    filters: Object,
    fetchStat: (any, any, any) => Promise<*>,
    fieldEnumSearch: typeof fieldEnumSearch,
    resetStatsFilters: typeof resetStatsFilters,
    mergeStatsFilters: typeof mergeStatsFilters,
}

type State = {
    tags: any[],
    descriptionPopoverOpen: boolean,
}

export class StatsFilters extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            tags: props.tags,
            descriptionPopoverOpen: false
        }
    }

    componentWillUnmount() {
        this.props.resetStatsFilters()
    }

    _handleFilterChange = (filterName: string) => {
        return (values: any) => {
            this.props.mergeStatsFilters(fromJS({[filterName]: values}))
        }
    }

    _onSearchTags = _debounce((search) => {
        const field = fromJS({
            filter: {type: 'tag'}
        })

        this.props.fieldEnumSearch(field, search)
            .then((data) => {
                this.setState({
                    tags: data.toJS(),
                })
            })
    }, 300)

    _makeInputControl = (name: string) => {
        const {filters} = this.props

        return {
            value: filters.get(name, fromJS([])).toJS(),
            onChange: this._handleFilterChange(name),
        }
    }

    _toggleDescriptionPopover = () => {
        this.setState({
            descriptionPopoverOpen: !this.state.descriptionPopoverOpen
        })
    }

    _renderFilterInput = (filterType: string) => {
        const {config, filters} = this.props
        const filterValue = filters.get(filterType)
        const filterConfig = config.get('filters').find((filter) => filter.get('type') === filterType)

        switch (filterType) {
            case 'score': {
                const minValue = filterConfig.get('minValue')
                const maxValue = filterConfig.get('maxValue')
                const reverse = filterConfig.get('reverse')
                const variant = filterConfig.get('variant')
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural='scores'
                        singular='score'
                        items={
                            Array.from({length: maxValue - minValue + 1}, (value, index) => {
                                const scoreValue = reverse ? (maxValue - index) : (index + minValue)
                                switch (variant) {
                                    case 'star':
                                        return {
                                            value: scoreValue.toString(),
                                            label: Array(minValue + scoreValue - 1).fill('★').join('') +
                                                Array(maxValue - scoreValue).fill('☆').join('')
                                        }
                                    default:
                                        return {}
                                }
                            })
                        }
                        input={this._makeInputControl('score')}
                    />
                )
            }
            case 'channels': {
                const options = filterConfig.get('options')
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="channels"
                        singular="channel"
                        items={options
                            ? this.props.channels.filter((channel) => options.includes(channel.value))
                            : this.props.channels}
                        input={this._makeInputControl('channels')}
                    />
                )
            }
            case 'tags':
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="tags"
                        singular="tag"
                        items={this.state.tags.map((tag) => ({label: tag.name, value: tag.id}))}
                        input={this._makeInputControl('tags')}
                        onSearch={this._onSearchTags}
                        dropdownMenu={(props) => (
                            <TagDropdownMenu {...props}/>
                        )}
                    />
                )
            case 'agents':
                return (
                    <SearchableSelectField
                        key={filterType}
                        plural="agents"
                        singular="agent"
                        items={this.props.agents}
                        input={this._makeInputControl('agents')}
                    />
                )
            case 'period':
                return (
                    <PeriodPicker
                        key={filterType}
                        startDatetime={moment(filterValue.get('start_datetime'))}
                        endDatetime={moment(filterValue.get('end_datetime'))}
                        onChange={this._handleFilterChange('period')}
                    />
                )
            default:
                console.error(`[stats] Cannot render input for this unknown filter type: ${filterType}`)
        }
    }

    render() {
        const {config} = this.props
        const configFilterTypes = config.get('filters').map((filter) => filter.get('type'))
        let pageTitle = config.get('name')

        if (config.get('description')) {
            pageTitle = (
                <h1 className="d-flex align-items-center">
                    {pageTitle}
                    <Button
                        id="stat-description-trigger"
                        className="mt-1"
                        color="link"
                        onClick={this._toggleDescriptionPopover}
                    >
                        <i className="material-icons">info_outline</i> Learn more
                    </Button>
                    <Popover
                        placement="auto"
                        target="stat-description-trigger"
                        isOpen={this.state.descriptionPopoverOpen}
                        toggle={this._toggleDescriptionPopover}
                    >
                        <PopoverBody dangerouslySetInnerHTML={{__html: config.get('description')}}/>
                    </Popover>
                </h1>
            )
        }

        return (
            <PageHeader
                title={pageTitle}
                className="mb-0"
            >
                <div className="d-flex flex-wrap float-right">
                    {configFilterTypes.map((filterType) => this._renderFilterInput(filterType))}
                </div>
            </PageHeader>
        )
    }
}

const mapStateToProps = (state: Object, props: Props) => {
    const view = props.params.view
    const config = statViewsConfig.get(view)

    return {
        tags: getTags(state).toJS(),
        channels: CHANNELS.map((channel) => ({
            label: _upperFirst(channel.replace('-', ' ')),
            value: channel,
        })),
        agents: getAgents(state).map((agent) => ({
            label: getDisplayName(agent),
            value: agent.get('id'),
        })).toJS(),
        filters: getViewFilters(props.params.view)(state),
        config
    }
}

const actions = {
    mergeStatsFilters,
    resetStatsFilters,
    fieldEnumSearch
}

export default withRouter(connect(mapStateToProps, actions)(StatsFilters))
