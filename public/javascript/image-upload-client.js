(()=>{
	document.getElementById("img-upload-cntrl").onchange = ( evt ) => {
        const file = evt.currentTarget.files[0];
        if( file !== undefined && file !== null ) {
            getSignedRequest( file );
        } else {
        	alert( "A file has not been selected." );
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
                // TODO: RESUME HERE. PARSE RESPONSE AND CONTINUE...
                const response = JSON.parse(xhr.responseText);
                doAwsDirectUpload(file, response.signedUrl, response.url );
                //console.log( response );
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






