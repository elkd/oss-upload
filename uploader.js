/**
 * Create progress bar
 */
var progressBar = 0;
var progress = '';
var $wrap = $('#uploader'),
    // Picture container
    $queue = $('<ul class="filelist"></ul>').appendTo($wrap.find('.queueList')),
    $totalProgressbar = $("#totalProgressBar");

var progress = function (p) { //p percentage 0~1
    return function (done) {
        console.log(p)
        $totalProgressbar.css('width', progressBar)
        done();
    }
};



/***
     *  upload files
     * @param file files to be uploaded
     * @param filename to which location to upload the file. According to the official statement is the key
     * oss is object storage, there is no path path concept, but personally think this can be better understood as a path
     */
    uploadFile: function (file, filename) {

        $totalProgressbar.css('width', '30%').html('Uploading...');
        applyTokenDo();

        //make sure we get the sts token
        if (client !== undefined) {

            const upload = async () => {
                try {
                    const results = await client.multipartUpload(filename, file, {
                            progress: progress,
                            partSize: 200 * 1024,      //Minimum is 100*1024
                            timeout: 60000          // 1 minute timeout
                        })
                        .then(function (res) {
                        
                            $("#" + file.id).children(".success-span").addClass("success");
                            $("#" + file.id).children(".file-panel").hide();
                            uploader.fileStats.uploadFinishedFilesNum++; //Successfully uploaded + 1
                            uploader.fileStats.curFileSize += file.size; //Currently uploaded file size
                            progressBarNum = (uploader.fileStats.curFileSize / uploader.fileStats.totalFilesSize).toFixed(2) * 100;
                            progressBar = (uploader.fileStats.curFileSize / uploader.fileStats.totalFilesSize).toFixed(2) * 100 + '%';
                            
                            if (progressBarNum == 100) {
                                $totalProgressbar.css('width', progressBar)
                                    .html('Upload complete');
                            } else {
                                $totalProgressbar.css('width', progressBar)
                                    .html(progressBar);
                            }

                            images += ',' + res.name;

                        }).catch((err) => {
                            console.error(err);
                            console.log(`err.name : ${err.name}`);
                            console.log(`err.message : ${err.message}`);

                            $totalProgressbar.css('width', '40%')
                                    .html("Retrying...");

                            if (err.name.toLowerCase().indexOf('connectiontimeout') !== -1) {
                                if (retryCount < retryCountMax) {
                                    retryCount++;
                                    console.error(`retryCount : ${retryCount}`);
                                    upload();
                                }
                                else {
                                    //We have retried to the max and there is nothing we can do
                                    //Allow the users to submit the form atleast with default image.
                                    $totalProgressbar.css('width', '94%')
                                    .html("Completed with minor errors!");
                                    
                                    img_error = err.name + " Message: " + err.message;
                                    
                                    if (!images) {
                                        images = 'undef,classifieds/error-img.jpg';
                                        bootbox.alert("Oops! an error occured when uploading your image(s). \
                                            But you can submit this form without images and edit your post later to add images");
                                    }
                                }
                            } else {
                                //Not timeout out error and there is nothing we can do
                                //Allow the users to submit the form atleast with default image.
                                $totalProgressbar.css('width', '94%')
                                    .html("Completed with minor errors!");
                                
                                img_error = err.name + " Message: " + err.message;

                                if (!images) {
                                    images = 'undef,classifieds/error-img.jpg';
                                    bootbox.alert("Oops! an error occured when uploading your image(s). \
                                            But you can submit this form without images and edit your post later to add images");
                                }
                            }
                            
                        });
                    return results;
                } catch (e) {
                    bootbox.alert("Oops! an error occured when uploading your image(s), \
                    Please try again later or contact us via support@obrisk.com. " + e);
                    $(".start-uploader").css('display', 'block');
                    console.log(e);
                }
            }

            return upload()
        } else {
            bootbox.alert("Oops!, it looks like there is a network problem, \
            Please try again later or contact us at support@obrisk.com")
            $(".start-uploader").css('display', 'block');
        }
    }
