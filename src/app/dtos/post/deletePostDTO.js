import * as yup from 'yup';

export class DeletePostDTO {
  static schema = yup.object().shape({
    id: yup
      .number()
      .positive('Post ID must be a positive number')
      .required('Post ID is required'),
    userId: yup
      .string()
      .required('User ID is required')
      .matches(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'), // MongoDB ID validation
  });

  static async validate(data) {
    const validatedData = await this.schema.validate(data, {
      stripUnknown: true,
      abortEarly: false,
    });
    return validatedData;
  }
}
