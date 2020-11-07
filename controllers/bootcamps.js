const path = require('path')
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geoCoder = require('../utils/geocoder');

//@desc Get all Bootcamps
//@route GET /api/v1/bootcamps
//@Public
exports.getBootcamps = asyncHandler(async (req,res,next) =>{


        res.status(201).json(res.advancedResults)    

});

//@desc Get single Bootcamp
//@route GET /api/v1/bootcamp/:id
//@Public
exports.getBootcamp = asyncHandler(async (req,res,next) =>{
        console.log(req.params.id);
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(
                new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
              );
        }
        res.status(201).json({
            success: true,
            data: bootcamp   
        })    
});

//@desc Create new Bootcamp
//@route POST /api/v1/bootcamp
//@Private
exports.createBootcamp = asyncHandler(async (req,res,next) =>{

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp    
    })
});

//@desc Update Bootcamp
//@route PUT /api/v1/bootcamp/:id
//@Private
exports.updateBootcamp = asyncHandler(async (req,res,next) =>{
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
            }); 
        if(! bootcamp){
            return next(
                new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
              );
        }
        res.status(201).json({
            success: true,
            data: bootcamp    
        })
});

//@desc Delete Bootcamp
//@route DELETE /api/v1/bootcamp/:id
//@Private
exports.deleteBootcamp = asyncHandler(async (req,res,next) =>{
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(! bootcamp){
            return next(
                new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
              );
        }
        bootcamp.remove();
        res.status(201).json({
            success: true,
            data: {}    
        })
});

//@desc Get Bootcamp within Radius
//@route GET /api/v1/bootcamp/radius/:zipcode/:distance
//@Private
exports.getBootcampsInRadius = asyncHandler(async (req,res,next) =>{
    
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geoCoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
  
    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;
  
    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    }); 
});

//@desc Upload Photo for Bootcamp
//@route PUT /api/v1/bootcamp/:id/photo
//@Private
exports.bootcampPhotoUpload = asyncHandler(async (req,res,next) =>{
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(! bootcamp){
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
          );
    }
    bootcamp.remove();

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                 400
            )
        );
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
          success: true,
          data: file.name
        });
    })   

});