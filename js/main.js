const { createApp } = Vue;

createApp({
    data() {
        return {
            listOfEvents: [],
            listOfEventsFiltered: [],

            listOfEventsUpComing: [],
            listOfEventsUpComingFiltered: [],

            listOfEventsPast: [],
            listOfEventsPastFiltered: [],

            categories: [],
            categoriesEventsUpComing: [],
            categoriesEventsPast: [],
            categoriesChecked: [],

            searchValue: "",

            eventHighestAttendance: {},
            eventLowerAttendance: {},
            eventHighestCapacity: {},

            statisticsUpComingEvents: {},
            statisticsPastEvents: {},

            cardDetail: {}
        };
    },

    created() {
        fetch("https://mindhub-xj03.onrender.com/api/amazing")
            .then(resolve => resolve.json())
            .then(({events, currentDate}) => {
                this.listOfEvents = [...events];
                this.listOfEventsFiltered = [...events];
                this.categories = this.filterCaregories(this.listOfEvents);

                this.listOfEventsUpComing = this.filterEventsUpComing(events, currentDate);
                this.categoriesEventsUpComing = this.filterCaregories(this.listOfEventsUpComing);
                this.listOfEventsUpComingFiltered = [...this.listOfEventsUpComing];

                this.listOfEventsPast = this.filterEventsPast(events, currentDate);
                this.categoriesEventsPast = this.filterCaregories(this.listOfEventsPast);
                this.listOfEventsPastFiltered = [...this.listOfEventsPast];

                this.eventHighestAttendance = this.calculateAttendance(this.listOfEventsPast, true);
                this.eventLowerAttendance = this.calculateAttendance(this.listOfEventsPast);
                this.eventHighestCapacity = this.calculateHighestCapacity([...events]);

                this.statisticsUpComingEvents = this.calculateValuesOfTable(this.listOfEventsUpComing, true);
                this.statisticsPastEvents = this.calculateValuesOfTable(this.listOfEventsPast);
            })
            .catch(err => console.log(err));
    },

    methods: {
        filterCaregories(listOfEvents) {
            return [...new Set(listOfEvents.map(event => event.category))];
        },
        filterChecks(listOfEvents, categoriesChecked) {
            if (categoriesChecked.length === 0) return listOfEvents;
            return listOfEvents.filter(event => categoriesChecked.includes(event.category));
        },
        filterSearch(listOfEvents, searchValue) {
            return listOfEvents.filter(event => event.name.toLowerCase().includes(searchValue.toLowerCase()));
        },
        doubleFilter(listOfEvents) {
            const listFilteredChecks = this.filterChecks(listOfEvents, this.categoriesChecked);
            const listFilteredSearch = this.filterSearch(listFilteredChecks, this.searchValue);
            this.listOfEventsFiltered = listFilteredSearch; 
            this.listOfEventsUpComingFiltered = listFilteredSearch;
            this.listOfEventsPastFiltered = listFilteredSearch;
        },
        filterEventsUpComing(events, currentDate) {
            let eventsPast = events.filter(
                (event) =>
                    parseInt(event.date.slice(0, 4)) >= parseInt(currentDate.slice(0, 4))
            );
            return eventsPast;
        },
        filterEventsPast(events, currentDate) {
            let eventsPast = events.filter(
                (event) =>
                    parseInt(event.date.slice(0, 4)) < parseInt(currentDate.slice(0, 4))
            );
            return eventsPast;
        },
        calculateAttendance(listOfEvents, output) {
            const aux = listOfEvents.map((event) => {
                const percentageOfAttendance = (
                    (event.assistance / event.capacity) *
                    100
                ).toFixed(2);
                return { name: event.name, percentageOfAttendance };
            });
            aux.sort((a, b) => a.percentageOfAttendance - b.percentageOfAttendance);
            return output ? aux.pop() : aux[0];
        },
        calculateHighestCapacity(listOfEvents) {
            listOfEvents.sort((a, b) => a.capacity - b.capacity);
            return {
                name: listOfEvents.pop().name,
                capacity: listOfEvents.pop().capacity,
            };
        },
        calculateValuesOfTable(listOfEvents, output) {
            const listOfCategories = [
                ...new Set(listOfEvents.map((event) => event.category)),
            ];
            const aux = listOfCategories.map((category) => {
                const categoryEvents = listOfEvents.filter(
                    (event) => event.category === category
                );
                let totalRevenues, percentageOfAttendance;
                if (output) {
                    totalRevenues = categoryEvents.reduce(
                        (totalRevenues, event) =>
                            totalRevenues + event.price * event.estimate,
                        0
                    );
                    percentageOfAttendance = categoryEvents.reduce(
                        (totalSumOfPercentage, event) =>
                            totalSumOfPercentage +
                            parseFloat(
                                ((event.estimate / event.capacity) * 100).toFixed(2)
                            ),
                        0
                    );
                } else {
                    totalRevenues = categoryEvents.reduce(
                        (totalRevenues, event) =>
                            totalRevenues + event.price * event.assistance,
                        0
                    );
                    percentageOfAttendance = categoryEvents.reduce(
                        (totalSumOfPercentage, event) =>
                            totalSumOfPercentage +
                            parseFloat(
                                ((event.assistance / event.capacity) * 100).toFixed(2)
                            ),
                        0
                    );
                }
                return {
                    name: category,
                    revenues: totalRevenues,
                    percentageOfAttendance: (
                        percentageOfAttendance / categoryEvents.length
                    ).toFixed(2),
                };
            });
            return aux;
        }
    }
}).mount("#app");
