const { default: axios } = require('axios');
const express = require('express');
const app = express();

//Database to store data

var dataBase = {};
dataBaseUsingTitleAsKey = {};

//Making get request to youtube api every 10 seconds in server using setInterval
setInterval(() => {

    //Youtube api key and category
    const apiKey = "AIzaSyC7U9f3yIISORSNyWNobFt8hQctS0mEYoM";
    const category = "football";
    const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${category}&key=${apiKey}`;

    console.log("Requesting data from youtube api");
    //Make get request to youtube api every 10 seconds

    axios.get(url).then((response) => {
        response.data.items.forEach((item) => {
            //Getting required data from response
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const description = item.snippet.description;
            const thumbnail = item.snippet.thumbnails.high.url;
            const publishedAt = item.snippet.publishedAt;

            //Storing data in database only if it is not already present
            if (dataBase[videoId] === undefined){
                dataBase[videoId] = {
                    title,
                    description,
                    thumbnail,
                    publishedAt
                }
            }

            //Storing data in title based database as we need to find data by title also
            if (dataBaseUsingTitleAsKey[title] === undefined){
                dataBaseUsingTitleAsKey[title] = [{
                    videoId,
                    description,
                    thumbnail,
                    publishedAt
                }]
            }else{
                //If title is already present in database then we need to add video to that title
                dataBaseUsingTitleAsKey[title].push({
                    videoId,
                    description,
                    thumbnail,
                    publishedAt
                    });
            }

        })
    }).catch((error) => {
        console.log(error);
    })

}, 10000);

//Sorting database in descending order of publishedAt

function sortDataBase(dataBase){

    //Converting object to array
    const arr = Object.keys(dataBase).map((key) => {    
        return dataBase[key];
    });
    //Sorting array in descending order of publishedAt
    arr.sort((a, b) => {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
    //Converting array to object
    return arr;
}

app.get('/api/videosInSortedOrder', (req, res) => {

    //Sending sorted data to client
    res.json(sortDataBase(dataBase));

})

app.get('/api/videosByTitle', (req, res) => {

    //Getting title from params
    const title = req.body.title;
    //Checking if title is present in database or not
    if (dataBaseUsingTitleAsKey[title] === undefined){ 
        res.json({error: "No video found with this title"});
    }else{
        res.json(dataBaseUsingTitleAsKey[title]);
    }
})

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})