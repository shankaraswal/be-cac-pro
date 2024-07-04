// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       sucess: false,
//       error: error.message,
//     });
//   }
// };

const asyncHandler = (reqHandler) => {
  return (res, req, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
