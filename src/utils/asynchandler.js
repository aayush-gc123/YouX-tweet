
const asynchandler  = (requestHandler) => {
   return  (req , res , next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next (error))
    }
}
export {asynchandler}
// const asynchandler = (fn) =>  async(req,res,next) => {
//     try {
//        await fn(req , res , next) 
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess:false,
//             message:error.message
//         })
//     }
// }