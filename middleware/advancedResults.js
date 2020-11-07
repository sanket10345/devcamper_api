const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query};

    // Fields To Exclude
    const removeFields = ['select','sort','page','limit'];

    // Loop Over removeFields & delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create Query String
    let queryStr = JSON.stringify(reqQuery);

    // Finding resource
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // Executing Query
    query= model.find(JSON.parse(queryStr));//.populate('courses');

    // Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    // Sort Fields
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else{
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1 ;
    const limit = parseInt(req.query.limit, 10) || 25 ;
    const startIndex = (page -1) * limit;
    const endIndex = page * limit ;
    const total = await model.countDocuments();

    query.skip(startIndex).limit(limit);
    
    if (populate) {
        query = query.populate(populate);
    }
    
    const results = await query;

    // Pagination Result
    const pagination = {};
    if(endIndex < total){
        pagination.next = {
            page: page +1,
            limit: limit
        }
    }

    if(startIndex > 0){
        pagination.pre = {
            page: page - 1,
            limit: limit
        }
    }
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
      };
    
    next();
}

module.exports = advancedResults;