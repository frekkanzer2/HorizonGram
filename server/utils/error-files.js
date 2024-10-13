exports.PrintUploadError = (error) => {
    console.error(`UPL > File not uploaded, received error: ${error}`);
    if (error.response) {
        console.log('Status:', error.response.status); // Status code
        console.log('Headers:', error.response.headers);
        console.log('Data:', error.response.data);
    } else if (error.request) {
        console.log('Request data:', error.request);
    } else {
        console.log('Error:', error.message);
    }
    console.log('Config:', error.config);
}