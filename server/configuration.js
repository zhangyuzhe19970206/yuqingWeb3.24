var path = require("path");

module.exports = {
	client:{
        baseUrl: "/yuqing"
    },
	RESTAPI:{
	basicUrl: "http://localhost:8000/bi/v1/",
        apikey: "309dea40e47f447ca83efb6407cea0c9",
        username: "",
        userToken: ""
	},
    server: {
        listenPort: 8899,
        securePort: 8445,
        distFolder: path.resolve(__dirname, "../client/"),
        staticUrl: "/static",
        sessionSecret: "cq-nodejs-vte",
        cookieSecret: "srs-vte-lab"
    },
    restServer:{
        baseUrl:"http://39.102.48.39:8899/yqdata",
        host:"39.102.48.39",
        port:8899,
        basePath:"/yqdata",
    }
};
