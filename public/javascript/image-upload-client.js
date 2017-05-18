// TODO: REFACTOR !!! TURN ALL THIS MESS INTO BONA FIDE OBJECT


// function testEvent( evt ) {
//     document.getElementById( "test-out" ).innerHTML='TEST 4: touchend event detected on test-button: ' + evt.currentTarget.id;
// }
// document.getElementById("test-button").addEventListener( 
//     'touchend', 
//     function(evt) {
//         testEvent(evt);
//     }, 
//     false 
// );


// (()=>{
// 	document.getElementById("img-upload-cntrl").onchange = ( evt ) => {
// 	};
// })();

/**
 *  Handles the 'change' event fired on file selection. no-op at present but can provide feedback to user
 *  if label technique is reinstated (see html view code image-upload.html)
 */
function handleFileSelect( evt ) {
    file = evt.currentTarget.files[0];
    if( file !== undefined && file !== null ) {
        // document.getElementById('img-upload-label').innerHTML = "Selected file: " + file.name
        // alert( "Selected file is: " + file.name );
        // document.getElementById( "test-out" ).innerHTML='event detected on file-input';
    } else {
        alert( "A file has not been selected." );
    }
}
document.getElementById("img-upload-cntrl").addEventListener( 'change', function(evt) {handleFileSelect(evt);}, false );


var file = null;

(()=>{
    document.getElementById("upload-button").onclick = ( evt ) => {
        if( file === null ) {
            alert( "A file has not been selected." );
        } else {
            if ( (file.type === "image/jpeg") || (file.type === "image/png") ) {
                getSignedRequest( file );
            } else {
                alert( "Selected file is not an image." );
            }
        }
    };
})();

/**
 *  Gets a SIGNED REQUEST by calling heroku node server which calls AWS to get 
 *  signiture thereby enabling DIRECT UPLOAD to AWS...
 */
function getSignedRequest ( file ) {
    const routeStr = 
      `/aws-s3-signed-request?file-name=${file.name}&file-type=${file.type}`;
    const xhr = new XMLHttpRequest();
    xhr.open( 'GET', routeStr );
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                const response = JSON.parse(xhr.responseText);
                doAwsDirectUpload(file, response.signedUrl, response.url );
            }else{
                alert( 'Sorry. Unable to store file.' );
            }
        }
    };
    xhr.send();
}


/**
 *  Given the siggy do the DIRECT UPLOAD...  
 *  
 */
function doAwsDirectUpload(file, signedUrl, url) {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, false);
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                document.getElementById('uploaded_view').src = url;
                document.getElementById('url-display').innerHTML = url;
            }else{
                alert( 'Sorry. Unable to complete upload.' );
            }
        }
    }
    // TODO: ERROR AVOIDANCE. WHAT IF XHR HANGS? WHICH IT DID IN FIREFOX...
    xhr.send(file);
}

