var express = require('express');
var fs      = require('fs');
var bodyParser = require('body-parser');
var multer = require('multer');
var aws = require('aws-sdk');


var PORT = 5013;
//var STATIC_CONTENT_LOCATION = "/Users/nicknagel/projects/ff_node_server/public";
var STATIC_CONTENT_LOCATION = __dirname+"/public";


var app = express();
app.set('port', (process.env.PORT || PORT));

app.use( express.static(STATIC_CONTENT_LOCATION) );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( multer( {dest: STATIC_CONTENT_LOCATION + '/temp/'} ).single('uploadedImage'));

app.get("/", function(request, response) {

//  TODO: REFACTOR THIS WITH GALLERY VIEW
//  TEMP KLUDGE TO REMOVE NAV TO UPLOAD PAGE

    const params = {
      Bucket: FF_IMAGE_BUCKET
    };
    const s3 = new aws.S3();
    var responsestr = "";
    s3.listObjects(params, function(err, data) {
      if (err) {
        responsestr += '<p>An error has occured.</p>';
        console.log(err, err.stack); 
      } else {
          responsestr += `<!DOCTYPE html>
<html>
  <head>
    <title>Galery View</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/image-upload.css" 
          type="text/css"
          rel="stylesheet">
  </head>
  <body>

    <h1>IMAGES</h1>`;
/////////////////////////////////////////////
            data.Contents.forEach( (o)=> {
                responsestr += `
<div class="gallery-container">
    <div class="open-control">
        <button type="button"
                onclick="openImage(event)"
                data-image-url="https://s3.amazonaws.com/family-foto-app/` + o.Key + `" width="100px"
                  >Open in new window</button>
    </div>
    <img src="https://s3.amazonaws.com/family-foto-app/` + o.Key + `" width="100px">
</div>
`;
            } );
/////////////////////////////////////////////
  responsestr += `

      <script type='application/ecmascript'
              src = '../javascript/gallery.js'></script>
  </body>
</html>`;
        response.send(responsestr);
      }
    });

} );


app.get('/listing', function (request, response) {
	// TODO: implement listing route
	var responseObj;
	fs.readdir( STATIC_CONTENT_LOCATION+'/images', function( error, listing ) {
		if(error){
            responseObj = { errors: [{
            	status: '500',
                title: 'Internal Server Error',
                detail: 'Listing unobtainable.'
            }] };
            response.status("500").json(responseObj);
		}else{
	        responseObj = {
	            listing: listing
			};
		    response.json(responseObj);
		}
	} );
});

app.get('/image_upload', function (request, response) {
    response.sendFile( STATIC_CONTENT_LOCATION+"/html/image-upload.html" );
});

app.post('/upload_image', function (request, response) {
    // TODO ADD ERROR AVOIDANCE FOR MALFORED RESQUEST/RESPONSE (E.G. NO FILE CHOSEN) ...
	var fileStorePath = STATIC_CONTENT_LOCATION + "/images/" + request.file.filename;
    fs.readFile( request.file.path, function ( error, data ) {
        if(error) {
    	    responseObj = { errors: [{
	        	status: '500',
	            title: 'Internal Server Error',
	            detail: 'Cannot read file.'
            }] };
            response.status("500").json(responseObj);
        } else {
        	// TODO: UPDATE TO CLEAN multer TEMP DIR
        	// TODO: append error message to response
            fs.writeFile( fileStorePath, data, function(error) {
				if(error){
		            responseObj = { errors: [{
		            	status: '500',
		                title: 'Internal Server Error',
		                detail: 'Unable to write file.'
		            }] };
		            response.status("500").json(responseObj);
				}else{
			        responseObj = {
			            newResourceUrl: fileStorePath 
					};
					// TODO: update to proper JSON api response and http header field with link
					// https://httpstatuses.com/201
				    response.status("201").json(responseObj);
				}
            } );
        }
    } );

});

// TODO: RESUME HERE. TEMPLATE THIS OUT!
app.get("/list_page", function(request, response) {
	const params = {
	  Bucket: FF_IMAGE_BUCKET
	};
	const s3 = new aws.S3();
	var responsestr = "";
	s3.listObjects(params, function(err, data) {
	  if (err) {
        responsestr += '<p>An error has occured.</p>';
	  	console.log(err, err.stack); 
	  } else {
	      responsestr += `<!DOCTYPE html>
<html>
  <head>
    <title>Galery View</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/image-upload.css" 
          type="text/css"
          rel="stylesheet">
  </head>
  <body>
    <div id='nav-bar'>
      <span>
        <a href='https://family-foto.herokuapp.com/image_upload'>Upload Image</a>
      </span>
    </div>
    <h1>IMAGES</h1>`;
/////////////////////////////////////////////
	  	    data.Contents.forEach( (o)=> {
                responsestr += `
<div class="gallery-container">
    <div class="open-control">
        <button type="button"
                onclick="openImage(event)"
                data-image-url="https://s3.amazonaws.com/family-foto-app/` + o.Key + `" width="100px"
                  >Open in new window</button>
    </div>
    <img src="https://s3.amazonaws.com/family-foto-app/` + o.Key + `" width="100px">
</div>
`;
	  	    } );
/////////////////////////////////////////////
  responsestr += `

      <script type='application/ecmascript'
              src = '../javascript/gallery.js'></script>
  </body>
</html>`;
        response.send(responsestr);
	  }
	});

} );

const FF_IMAGE_BUCKET = process.env.S3_BUCKET;

// console.log( "PRECONDTIONS" );
// console.log( process.env.AWS_ACCESS_KEY_ID );
// console.log( process.env.AWS_SECRET_ACCESS_KEY );
// console.log( process.env.S3_BUCKET );

app.get( '/aws-s3-signed-request', (request, response) => {
    const fileName = request.query['file-name'];
    const fileType = request.query['file-type'];
    const s3Params = {
    	Bucket: FF_IMAGE_BUCKET,
    	Key: fileName,
    	Expires: 600,
    	ContentType: fileType,
    	ACL: 'public-read'
    };
    // create an aws s3 object
    const s3 = new aws.S3();
    // call for signiture
    s3.getSignedUrl( 'putObject', s3Params, (err, data) => {
        if(err){
        	// TODO: ERROR HANDLING BACK PROPAGATE IT
        	console.log(err);
        	return response.end();
        } else {
        	const responseData = {
        		signedUrl: data,
        		url: `https://${FF_IMAGE_BUCKET}.s3.amazonaws.com/${fileName}`
        	}
        	response.write( JSON.stringify(responseData) );
	        response.end();
        }
    } );
});


var utilities = {};
utilities.cleanDir = function( path ) {
    fs.readdir(path, function(err, listing) {
        // TODO: RESUME HERE... (DELETE FILES)
    });
};

var server = app.listen(app.get('port'), function() {
    var hostAddress = server.address().address;
    var port        = server.address().port;
    console.log("Express server listening at HOST %s and PORT %s", hostAddress, port );
});


