(()=>{
	document.getElementById("img-upload-cntrl").onchange = ( evt ) => {
        file = evt.currentTarget.files[0];
        if( file !== undefined && file !== null ) {
            // document.getElementById('img-upload-label').innerHTML = "Selected file: " + file.name
            alert( "Selected file is: " + file.name );
        } else {
            alert( "A file has not been selected." );
        }
	};
})();

// TODO: REFACTOR !!! TURN ALL THIS MESS INTO BONA FIDE OBJECT
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
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                document.getElementById('uploaded_view').src = url;
                document.getElementById('url-display').innerHTML = url;
            }else{
                alert( 'Sorry. Unable to complete upload.' );
            }
        }
    }
    xhr.send(file);
}






