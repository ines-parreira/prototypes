// @flow
import update from 'immutability-helper'
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'
import _find from 'lodash/find'
import moment from 'moment'
import React from 'react'
import {connect} from 'react-redux'
import {Button, Container, Popover, PopoverBody} from 'reactstrap'

import {stats as statsConfig} from '../../config/stats'
import * as statsActions from '../../state/stats/actions'
import {fieldEnumSearch} from '../../state/views/actions'
import PageHeader from '../common/components/PageHeader'
import TagDropdownMenu from '../common/components/TagDropdownMenu/TagDropdownMenu'

import Stat from './common/components/charts/Stat'
import PeriodPicker from './common/PeriodPicker'
import RestrictedSatisfactionSurvey from './common/RestrictedSatisfactionSurvey'
import RevenueUpgrade from './common/RevenueUpgrade'
import SearchableSelectField from './common/SearchableSelectField'

type Props = {
    config: Object,
    channels: any[],
    agents: any[],
    tags: any[],
    stats: Object,
    meta: Object,
    filters: Object,
    currentAccount: Object,
    fetchStat: (any, any, any) => Promise<*>,
    setMeta: typeof statsActions.setMeta,
    setFilters: typeof statsActions.setFilters,
    fieldEnumSearch: typeof fieldEnumSearch
}

type State = {
    tags: any[],
    loadings: {},
    isLightboxOpen: boolean,
    descriptionPopoverOpen: boolean,
    currentImage: number
}

class StatsView extends React.Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            tags: props.tags,
            loadings: {}, // store loading state of each stat on the view
            isLightboxOpen: false,
            descriptionPopoverOpen: false,
            currentImage: 0,
        }
    }

    componentWillMount() {
        const {config, meta, filters} = this.props
        this._fetchStats(config.get('stats'), meta.toJS(), filters.toJS())
    }

    /**
     * Reset filters and meta when users leave statistics
     */
    componentWillUnmount() {
        this.props.setFilters(fromJS({}))
        this.props.setMeta(fromJS({}))
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.config.get('name') !== nextProps.config.get('name')) {
            this._fetchStats(nextProps.config.get('stats'), nextProps.meta.toJS(), nextProps.filters.toJS())
        }
    }

    _updateLoadingStatsState = (stats, loading) => {
        let newState = this.state

        stats.forEach((stat) => {
            newState = update(newState, {
                loadings: {
                    [stat]: {$set: loading}
                }
            })
        })
        this.setState(newState)
    }

    _fetchStats = (stats, meta, filters) => {
        this._updateLoadingStatsState(stats, true)

        stats.forEach((stat) => {
            this.props.fetchStat(stat, meta, filters).then(() => {
                this._updateLoadingStatsState([stat], false)
            })
        })
    }

    _handleDateChange = (meta) => {
        this.props.setMeta(meta)
        this._fetchStats(this.props.config.get('stats'), meta, this.props.filters.toJS())
    }

    _handleFilterChange = (filterName) => {
        return (values) => {
            const filters = this.props.filters.set(filterName, fromJS(values))
            this.props.setFilters(filters)
            this._fetchStats(this.props.config.get('stats'), this.props.meta.toJS(), filters.toJS())
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

    // returns a redux-form like input to use the field outside of redux-form context
    _makeInputControl = (name) => {
        const {filters} = this.props

        return {
            value: filters.get(name, fromJS([])).toJS(),
            onChange: this._handleFilterChange(name),
        }
    }

    renderRestrictedFeatures(currentAccount, config) {
        const missingSatisfactionSurvey = config.get('name') === 'Satisfaction' &&
            !currentAccount.get('extra_features').includes('satisfaction-surveys')

        if (missingSatisfactionSurvey) {
            return <RestrictedSatisfactionSurvey/>
        }

        const missingRevenue = config.get('name') === 'Revenue' &&
            !currentAccount.get('extra_features').includes('revenue')

        if (missingRevenue) {
            return <RevenueUpgrade/>
        }
    }

    _toggleDescriptionPopover = () => {
        this.setState({
            descriptionPopoverOpen: !this.state.descriptionPopoverOpen
        })
    }

    render() {
        const {config, filters, meta, stats, currentAccount} = this.props
        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        const configFilters = config.get('filters', fromJS([])).toJS()
        const availableFilters = [
            {
                type: 'agents',
                render: () => <SearchableSelectField
                    key="agents-filter"
                    plural="agents"
                    singular="agent"
                    items={this.props.agents}
                    input={this._makeInputControl('agents')}
                />
            },
            {
                type: 'tags',
                render: () => (
                    <SearchableSelectField
                        key="tags-filter"
                        plural="tags"
                        singular="tag"
                        items={this.state.tags.map((tag) => ({label: tag.name, value: tag.id}))}
                        input={this._makeInputControl('tags')}
                        onSearch={this._onSearchTags}
                        dropdownMenu={(props) => (
                            <TagDropdownMenu
                                {...props}
                                wide
                            />
                        )}
                    />
                )
            },
            {
                type: 'channels',
                render: (filter) => <SearchableSelectField
                    key="channels-filter"
                    plural="channels"
                    singular="channel"
                    items={filter.options
                        ? this.props.channels.filter((channel) => filter.options.includes(channel.value))
                        : this.props.channels}
                    input={this._makeInputControl('channels')}
                />
            },
            {
                type: 'score',
                render: (filter) => <SearchableSelectField
                    key='score-filter'
                    plural='scores'
                    singular='score'
                    items={
                        Array.from({ length: filter.maxValue - filter.minValue + 1 }, (value, index) => {
                            const scoreValue = filter.reverse ? (filter.maxValue - index) : (index + filter.minValue)

                            switch(filter.variant) {
                                case 'star':
                                    return {
                                        value: scoreValue.toString(),
                                        label: Array(filter.minValue + scoreValue - 1).fill('★').join('') +
                                                Array(filter.maxValue - scoreValue).fill('☆').join('')
                                    }
                                default:
                                    return {}
                            }
                        })
                    }
                    input={this._makeInputControl('score')}
                />
            },
            {
                type: 'date',
                render: () => <PeriodPicker
                    key="date-filter"
                    startDatetime={startDatetime}
                    endDatetime={endDatetime}
                    onChange={this._handleDateChange}
                />
            },
        ]

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
            <div className="stats full-width">
                <PageHeader
                    title={pageTitle}
                    className="mb-0"
                >
                    <div className="d-flex flex-wrap float-right">
                        {availableFilters.map(
                            (availableFilter) => {
                                const filter = _find(configFilters, (configFilter) => {
                                    return configFilter.type === availableFilter.type
                                })
                                return filter && (availableFilter: any).render(filter)
                            }
                        )}
                    </div>
                </PageHeader>

                <Container
                    fluid
                    style={{padding: 0}}
                >
                    {this.renderRestrictedFeatures(currentAccount, config) ||
                    config.get('stats').map((statName, idx) => {
                        const isCurrentStatLoading = this.state.loadings[statName]
                        const stat = stats.get(statName)
                        const isLoading = isCurrentStatLoading || !stat
                        const statConfig = statsConfig.get(statName)
                        let padding = '30px'
                        const statProps = isLoading ? {} : stat.toObject()
                        // First key metrics statistics are stuck to the top
                        if (idx === 0 && statConfig.get('style') === 'key-metrics') {
                            padding = '0 0 30px'
                        }

                        return (
                            <div
                                style={{padding}}
                                key={idx}
                            >
                                <Stat
                                    isLoading={isLoading}
                                    name={statName}
                                    config={statConfig}
                                    filters={filters}
                                    meta={{}}
                                    {...statProps}
                                />
                            </div>
                        )
                    })
                    }
                </Container>
            </div>
        )
    }
}

export default connect((state) => ({
    currentAccount: state.currentAccount
}), {fieldEnumSearch})(StatsView)
