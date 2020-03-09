const axios = require('axios');
const Dev = require('../models/Dev');

const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections } = require('../websocket');
// index, show, store, update, destroy

module.exports = {

    async index(req, res) {
        const devs = await Dev.find();

        return res.json(devs);
    },

    async store(req, res) {
        const { github_username, techs, latitude, longitude } = req.body;
    
        let dev = await Dev.findOne({ github_username });

        if (!dev) {
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username} `);
    
            const { name = login, avatar_url, bio } = apiResponse.data;
        
            const techArray = parseStringAsArray(techs);
        
            const techsArray = parseStringAsArray(techs);

            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            }
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techArray,
                location,
            });

            // Filtrar conexões que estão no raio e tenham 1 das techs
            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray,
            );

            console.log(sendSocketMessageTo);
        }
    
        return res.json( dev );
    }
};