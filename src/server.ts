import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { runInNewContext } from 'vm';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  const fetch = require('node-fetch');

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMETERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  app.get( "/filteredimage", async ( req, res ) => {
    let { image_url } = req.query;

    // Confirm that called specified the image_url query parameter
    if (!image_url) {
      return res.status(400)
          .send(`image_url is required`);
    }

    // Check that image_url points to a live link
    const urlGetResponse = await fetch(image_url)
    if (!urlGetResponse.ok) {
      return res.status(400).send("** Unable to access image URL: " + image_url);
    }

    const processedImage : Promise<string> = filterImageFromURL(image_url);

    processedImage.then(function(filename) {
      // File downloaded successfully. Return this file to the client.
      res.sendFile(filename, function(err) {
        if (!err) {
          // Delete file from local filesystem. We no longer need it.
          console.debug(`Deleting local file: ${filename}`);
          deleteLocalFiles([filename]);
        } else {
          console.error(`Error deleting file: ${filename}, ${err}`);
        }
      });
    })
    .catch(function(err) {
      // Report errors due to invalid URL or other issues
      console.error(`Error processing URL: ${image_url}, ${err}`);
      return res.status(422).send("** Unable to process image URL: " + image_url);
    })


  } );
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();