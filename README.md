# API for a MongoDb Trix editor

This is an API for a Trix editor using [MongoDb](https://www.mongodb.com/) and the framework [Express](https://expressjs.com/) and is a school work for the course JavaScript frameworks at [Blekinge Institute of Technology](https://www.bth.se/utbildning/program-och-kurser/pagwg/)

1. To download this repository use this code to clone: 
`git clone https://github.com/emcofa/Jsramverk-backend.git`

1. Navigate to directory: 
`cd Jsramverk-backend`

1. Create a hidden file ".env" and add your link to your MongoDb Atlas database. Like this:
`ATLAS_URI=mongodb+srv://link-goes-here`

1. Use 
`npm install`
to install all the dependencies.

2. To start your server use: 
`npm run start` 
or 
`npm run production`
to start in production mode.

3. To put your backend into operation you can download [Azure](https://azure.microsoft.com/en-us/) and create an App service after your preferences. After that you have your backend API accessed to your frontend.

4. The structure of the backend routes are following:

   - "/port:8888/docs" :GET. Returns a JSON-object containing an array of documents in database.
  
   - "/port:8888/docs" :POST. Requires a JSON-body which inlcudes keys "name" and "html". Returns a JSON object of the created document.
  
   - "/port:8888/docs/init" :POST. Uses the JSON-file "data/docs.json" as a test to insert many documents into database. Can be customized after preferences.

   - "/port:8888/docs/docs/:id" :GET. Returns a single JSON-object matching param ":id".

   - "/port:8888/docs/update/:id" :PUT. Requires a JSONö-body which inlcudes the keys "name" and "html". Returns a JSON-object of the updated document with the new values.

   -  "/port:8888/docs/:id" :DELETE. Returns a JSON-object of the deleted document.
