import Joi from "joi";

const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required"
    }),
})

const signupValidationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.alphanum": "Username must only contain letters and numbers",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 30 characters",
      "any.required": "Username is required",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
});


const loginValidation = (req, res, next) => {
  const { error } = loginValidationSchema.validate(req.body);
  if (error) {
    return next(error)
  } next()
}

const signupValidation = (req, res, next) => {
  const { error } = signupValidationSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  next();
};

const refreshTokenValidationSchema = Joi.object({
  refreshToken: Joi.string().required(),
})
const refreshTokenValidation = (req, res, next) => {
  const { error } = refreshTokenValidationSchema.validate(req.body);
  if (error) {
    return next(error)
  } next()
}

export {
  loginValidation,
  refreshTokenValidation,
  signupValidation
}