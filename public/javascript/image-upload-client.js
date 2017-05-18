function testEvent( evt ) {

document.getElementById( "test-out" ).innerHTML='TEST 4: touchend event detected on test-button: ' + evt.currentTarget.id;

}


document.getElementById("test-button").addEventListener( 'touchend', function(evt) {testEvent(evt);}, false );


// (()=>{
// 	document.getElementById("img-upload-cntrl").onchange = ( evt ) => {
// 	};
// })();

function handleFileSelect( evt ) {

    var test = (evt.currentTarget.files !== undefined) && (evt.currentTarget.files !== null);

document.getElementById( "test-out" ).innerHTML='TEST 2: event detected on file-input: ' + test;

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

// TODO: REFACTOR !!! TURN ALL THIS MESS INTO BONA FIDE OBJECT
var file = null;

(()=>{
    document.getElementById("upload-button").onclick = ( evt ) => {

        document.getElementById( "test-out" ).innerHTML='event detected on upload button';

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

function doAwsDirectUpload(file, signedUrl, url) {

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.onreadystatechange = () => {

document.getElementById( "test-out" ).innerHTML='READY STATE: ' + xhr.readyState ;

        if(xhr.readyState === 4){
            if(xhr.status === 200){

document.getElementById( "test-out" ).innerHTML='200!';

                document.getElementById('uploaded_view').src = url;
                document.getElementById('url-display').innerHTML = url;
            }else{

document.getElementById( "test-out" ).innerHTML='ERROR...';

                alert( 'Sorry. Unable to complete upload.' );
            }
        }
    }

document.getElementById( "test-out" ).innerHTML='PRIOR TO SEND READY STATE: ' + xhr.readyState ;

    xhr.send(file);


document.getElementById( "test-out" ).innerHTML='POST SEND READY STATE: ' + xhr.readyState ;


}






