var openImage = function(event) {
    console.log( "ENTER" );

    var imageUrl = event.currentTarget.dataset.imageUrl;

    console.log(imageUrl);


    window.open(
        imageUrl,
        'Image',
        'width=600,height=500,resizable=1'
    );
};


