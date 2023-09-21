const { createApp } = Vue;

createApp({
    data() {
        return {
            cardDetail: [],
        };
    },

    created() {
        fetch("https://mindhub-xj03.onrender.com/api/amazing")
            .then((resolve) => resolve.json())
            .then(({events}) => {
                const $parameter = location.search;
                const searchParameter = new URLSearchParams($parameter);
                const idDetail = parseInt(searchParameter.get("key"));
                this.cardDetail = events.find((element) => element._id == idDetail);
            })
            .catch((err) => console.log(err));
    },
}).mount("#app");
