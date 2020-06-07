import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { runInNewContext } from 'vm';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
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
  // QUERY PARAMATERS
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
    } else {
      console.log("Image URL = " + image_url);
    }

    const processedImage = filterImageFromURL(image_url);

    processedImage.then(function(filename) {
      // File downloaded successfully. Return this file to the client.
      res.sendFile(filename, function(err) {
        if (err) {
          return res.status(500).send("** Error encountered during file download: " + err)
        } else {
          // Delete file from local filesystem
          deleteLocalFiles([filename]);
        }
      });
    })

    // TODO: Handle errors when the URL is invalid

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