const asyncHandler = (requestHandle) => {
    return (req, res, next) => {
        Promise.resolve(requestHandle(req, res, next)).catch((error) => next(error))
    }
}
export default asyncHandler


//Another way of making a asyncHandler with try-catch


// const asyncHandler = (requesHandler) => async(req, res, next) =>  {
//     try {
//         await requesHandler(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }